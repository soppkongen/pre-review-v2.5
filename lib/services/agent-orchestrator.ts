import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
import { searchPhysicsKnowledge } from '../weaviate';
import { v4 as uuidv4 } from 'uuid';

const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
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
      // 1. Ingest & chunk (only once)
      const processed = await RealDocumentProcessor.processFile(file);
      const fullText = processed.getContent();
      // 2. RAG (first 200 chars)
      const knowledge = await searchPhysicsKnowledge(fullText.slice(0, 200), 5);
      await AnalysisStorage.store(analysisId, { status: 'running', timestamp: new Date().toISOString() });
      // 3. Use chunks from PaperChunker only
      const chunks = processed.chunks.map(chunk => chunk.content);
      console.log(`[Orchestrator] Number of chunks: ${chunks.length}`);
      // 4. Run each agent across all chunks
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
      // 5. Aggregate
      const allResults = perAgent.flatMap(a => a.results);
      const confidences = allResults.map(r => r.confidence);
      const recommendations = allResults.flatMap(r => r.recommendations);
      // 6. Persist final (API-compatible structure)
      const resultObject = {
        analysisId,
        documentName: processed.metadata.fileName,
        reviewMode,
        timestamp: new Date().toISOString(),
        status: 'completed',
        error: '',
        overallScore: 0, // TODO: calculate if needed
        confidence: confidences.length ? Math.max(...confidences) : 0,
        summary: '', // TODO: add summary if available
        keyFindings: [], // TODO: extract from agent results if needed
        recommendations,
        agentResults: allResults,
        detailedAnalysis: {}, // TODO: fill if you have per-agent details
      };
      await AnalysisStorage.store(analysisId, resultObject);
      return resultObject;
    } catch (error) {
      await AnalysisStorage.store(analysisId, {
        analysisId,
        status: 'failed',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
