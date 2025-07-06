import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
import { searchPhysicsKnowledge } from '../weaviate';
import { v4 as uuidv4 } from 'uuid';
import { encodingForModel } from 'js-tiktoken';

const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const TOKEN_MODEL = MODEL;
const MAX_INPUT_TOKENS = 5000;    // tokens per chunk
const SUMMARY_MODEL = MODEL;
const SUMMARY_TOKENS = 300;

export interface Agent {
  id: string;
  name: string;
  role: string;
  confidence: number;
}

export class AgentOrchestrator {
  // Add the missing methods for streaming
  getAgents(): Agent[] {
    return [
      { id: 'theoretical', name: 'Theoretical Physicist', role: 'Theory', confidence: 0.9 },
      { id: 'mathematical', name: 'Mathematical Analyst', role: 'Mathematics', confidence: 0.85 },
      { id: 'epistemic', name: 'Epistemic Reviewer', role: 'Epistemics', confidence: 0.8 },
    ];
  }

  async analyzeWithAgent(agentId: string, paperContent: string, paperTitle: string): Promise<string> {
    try {
      // Get knowledge context
      const knowledge = await searchPhysicsKnowledge(paperContent.slice(0, 200), 3);
      
      // Run the specific agent
      const result = await RealOpenAIAgents.runAgent(agentId, { 
        text: paperContent, 
        context: knowledge.map(k => k.content) 
      });
      
      // Format the result for streaming
      const analysis = [
        `## ${result.agentName} Analysis`,
        '',
        '**Key Findings:**',
        ...result.findings.map(f => `- ${f}`),
        '',
        '**Recommendations:**',
        ...result.recommendations.map(r => `- ${r}`),
        '',
        `*Confidence: ${Math.round(result.confidence * 100)}%*`
      ].join('\n');
      
      return analysis;
    } catch (error) {
      console.error(`Agent ${agentId} analysis failed:`, error);
      return `Analysis failed for ${agentId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async analyzeDocument(
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ): Promise<string> {
    const analysisId = uuidv4();
    await AnalysisStorage.store(analysisId, {
      analysisId,
      documentName: file.name,
      reviewMode,
      summary,
      status: 'processing',
      timestamp: new Date().toISOString(),
    });

    // Run full pipeline before returning
    await this.processDocumentAsync(analysisId, file, summary, reviewMode);
    return analysisId;
  }

  async processDocumentAsync(
    analysisId: string,
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ) {
    const startAll = Date.now();
    try {
      // 1. Ingest & chunk
      const processed = await RealDocumentProcessor.processFile(file);
      const fullText = processed.getContent();

      // 2. RAG (first 200 chars)
      const knowledge = await searchPhysicsKnowledge(fullText.slice(0, 200), 5);
      await AnalysisStorage.store(analysisId, { status: 'running', timestamp: new Date().toISOString() });

      // 3. Tokenizer for chunking
      const enc = encodingForModel(TOKEN_MODEL);
      const tokenIds = enc.encode(fullText);
      const rawChunks: string[] = [];
      for (let i = 0; i < tokenIds.length; i += MAX_INPUT_TOKENS) {
        rawChunks.push(enc.decode(tokenIds.slice(i, i + MAX_INPUT_TOKENS)));
      }

      // 4. Summarize oversized chunks
      const chunks = await Promise.all(
        rawChunks.map(async (chunk) => {
          if (enc.encode(chunk).length > MAX_INPUT_TOKENS * 0.8) {
            const { text: sum } = await RealOpenAIAgents.summarizeChunk(chunk, SUMMARY_MODEL, SUMMARY_TOKENS);
            return sum;
          }
          return chunk;
        })
      );

      // 5. Run each agent across all chunks
      const perAgent = await Promise.all(
        RealOpenAIAgents.agentIds().map(async (agentId) => {
          const t0 = Date.now();
          const results = [];
          for (const chunk of chunks) {
            results.push(await RealOpenAIAgents.runAgent(agentId, { text: chunk, context: knowledge }));
          }
          return { agentId, results, durationMs: Date.now() - t0 };
        })
      );

      const totalDurationMs = Date.now() - startAll;

      // 6. Aggregate
      const allResults = perAgent.flatMap(a => a.results);
      const confidences = allResults.map(r => r.confidence);
      const avgConfidence = confidences.reduce((s, c) => s + c, 0) / confidences.length;
      const overallScore = Math.round(avgConfidence * 100) / 10;
      const keyFindings = allResults.flatMap(r => r.findings);
      const recommendations = allResults.flatMap(r => r.recommendations);

      // 7. Persist final
      await AnalysisStorage.store(analysisId, {
        analysisId,
        documentName: file.name,
        reviewMode,
        summary: keyFindings.join('\n'),
        status: 'completed',
        timestamp: new Date().toISOString(),
        agentResults: allResults,
        overallScore,
        confidence: avgConfidence,
        keyFindings,
        recommendations,
        detailedAnalysis: perAgent.reduce((acc, a) => {
          acc[a.agentId] = { results: a.results, durationMs: a.durationMs };
          return acc;
        }, {} as Record<string, any>),
        timings: { totalDurationMs },
        error: '',
        timestamps: { started: startAll, finished: Date.now() },
      });
    } catch (err) {
      await AnalysisStorage.store(analysisId, {
        analysisId,
        status: 'failed',
        error: (err as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
