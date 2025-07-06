import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
import { searchPhysicsKnowledge } from '../weaviate';
import { v4 as uuidv4 } from 'uuid';

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

  /** Orchestrates ingestion, RAG, multi-agent analysis, and persistence */
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

      // 2. RAG retrieval
      const knowledge = await searchPhysicsKnowledge(fullText.slice(0, 200), 5);
      await AnalysisStorage.store(analysisId, {
        status: 'running',
        timestamp: new Date().toISOString(),
      });

      // 3. Run each agent in parallel with instrumentation
      const agentPromises = RealOpenAIAgents.agentIds().map(async (agentId) => {
        console.log(`Starting agent ${agentId} at ${new Date().toISOString()}`);
        const res = await RealOpenAIAgents.runAgent(agentId, {
          text: fullText,
          context: knowledge,
        });
        console.log(`Agent ${agentId} completed in ${res.durationMs}ms`);
        await AnalysisStorage.store(analysisId, {
          [`${agentId}Result`]: res,
          timestamp: new Date().toISOString(),
        });
        return res;
      });

      const agentResults = await Promise.all(agentPromises);
      const totalDurationMs = Date.now() - startAll;

      // 4. Aggregate metrics
      const confidences = agentResults.map(a => a.confidence);
      const avgConfidence = confidences.reduce((s, c) => s + c, 0) / confidences.length;
      const overallScore = Math.round(avgConfidence * 100) / 10;
      const allFindings = agentResults.flatMap(a => a.findings);
      const allRecommendations = agentResults.flatMap(a => a.recommendations);

      // 5. Final persistence
      await AnalysisStorage.store(analysisId, {
        analysisId,
        documentName: file.name,
        reviewMode,
        summary: allFindings.join('\n'),
        status: 'completed',
        timestamp: new Date().toISOString(),
        agentResults,
        overallScore,
        confidence: avgConfidence,
        keyFindings: allFindings,
        recommendations: allRecommendations,
        detailedAnalysis: agentResults.reduce((acc, a) => {
          acc[a.agentName] = {
            findings: a.findings,
            recommendations: a.recommendations,
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
