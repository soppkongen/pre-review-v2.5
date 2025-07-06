import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
import { searchPhysicsKnowledge } from '../weaviate';
import { v4 as uuidv4 } from 'uuid';
import { encoding_for_model } from 'tiktoken';

const TOKEN_MODEL = 'gpt-4-turbo';
const MAX_INPUT_TOKENS = 5000;    // chunk size
const SUMMARY_MODEL = 'gpt-3.5-turbo-16k';
const SUMMARY_TOKENS = 300;

export class AgentOrchestrator {
  /** Entry point: store initial status and run full analysis before responding */
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

    // Run the full pipeline synchronously
    await this.processDocumentAsync(analysisId, file, summary, reviewMode);
    return analysisId;
  }

  /** Orchestrates ingestion, chunking, RAG, multi-agent analysis, and persistence */
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

      // 2. RAG retrieval on first 200 chars
      const knowledge = await searchPhysicsKnowledge(fullText.slice(0, 200), 5);
      await AnalysisStorage.store(analysisId, { status: 'running', timestamp: new Date().toISOString() });

      // 3. Tokenizer for chunking
      const enc = encoding_for_model(TOKEN_MODEL);
      const tokens = enc.encode(fullText);
      const rawChunks: string[] = [];
      for (let i = 0; i < tokens.length; i += MAX_INPUT_TOKENS) {
        rawChunks.push(enc.decode(tokens.slice(i, i + MAX_INPUT_TOKENS)));
      }

      // 4. Optionally summarize oversized chunks
      const chunks = await Promise.all(
        rawChunks.map(async (chunk) => {
          const tokCount = enc.encode(chunk).length;
          if (tokCount > MAX_INPUT_TOKENS * 0.8) {
            const { text: summaryText } = await RealOpenAIAgents.summarizeChunk(
              chunk,
              SUMMARY_MODEL,
              SUMMARY_TOKENS
            );
            return summaryText;
          }
          return chunk;
        })
      );

      // 5. Run each agent in parallel across all chunks
      const perAgentResults = await Promise.all(
        RealOpenAIAgents.agentIds().map(async (agentId) => {
          const agentStart = Date.now();
          const combined = [];

          for (const chunk of chunks) {
            const res = await RealOpenAIAgents.runAgent(agentId, { text: chunk, context: knowledge });
            combined.push(res);
          }

          const durationMs = Date.now() - agentStart;
          return { agentId, combined, durationMs };
        })
      );

      const totalDurationMs = Date.now() - startAll;

      // 6. Aggregate metrics
      const allResults = perAgentResults.flatMap((ar) => ar.combined);
      const confidences = allResults.map((r) => r.confidence);
      const avgConfidence = confidences.reduce((s, c) => s + c, 0) / confidences.length;
      const overallScore = Math.round(avgConfidence * 100) / 10;
      const allFindings = allResults.flatMap((r) => r.findings);
      const allRecommendations = allResults.flatMap((r) => r.recommendations);

      // 7. Final persistence
      await AnalysisStorage.store(analysisId, {
        analysisId,
        documentName: file.name,
        reviewMode,
        summary: allFindings.join('\n'),
        status: 'completed',
        timestamp: new Date().toISOString(),
        agentResults: allResults,
        overallScore,
        confidence: avgConfidence,
        keyFindings: allFindings,
        recommendations: allRecommendations,
        detailedAnalysis: perAgentResults.reduce((acc, ar) => {
          acc[ar.agentId] = {
            results: ar.combined,
            durationMs: ar.durationMs,
          };
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
