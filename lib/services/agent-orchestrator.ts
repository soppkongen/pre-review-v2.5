import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
import { searchPhysicsKnowledge } from '../weaviate';
import { v4 as uuidv4 } from 'uuid';

export class AgentOrchestrator {
  /** Starts analysis, stores initial state, and returns analysisId immediately */
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

    // Fire-and-forget background processing
    this.processDocumentAsync(analysisId, file, summary, reviewMode);
    return analysisId;
  }

  /** Background job: orchestrates RAG, multi-agent analysis, and persistence */
  private async processDocumentAsync(
    analysisId: string,
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ) {
    try {
      // 1. Ingest & chunk
      const processed = await RealDocumentProcessor.processFile(file);
      const fullText = processed.getContent();

      // 2. Optional RAG retrieval
      const knowledge = await searchPhysicsKnowledge(fullText.slice(0, 200), 5);

      // 3. Run agents in parallel with rate limiting
      const startAll = Date.now();
      const agentResults = await RealOpenAIAgents.runAllAgents({
        text: fullText,
        context: knowledge,
      });
      const totalDurationMs = Date.now() - startAll;

      // 4. Aggregate analytics
      const confidences = agentResults.map(a => a.confidence);
      const averageConfidence =
        confidences.reduce((s, c) => s + c, 0) / confidences.length;
      const overallScore = Math.round(averageConfidence * 100) / 10;
      const allFindings = agentResults.flatMap(a => a.findings);
      const allRecommendations = agentResults.flatMap(a => a.recommendations);

      // 5. Persist final results
      await AnalysisStorage.store(analysisId, {
        analysisId,
        documentName: file.name,
        reviewMode,
        summary: allFindings.join('\n'),
        status: 'completed',
        timestamp: new Date().toISOString(),
        agentResults,
        overallScore,
        confidence: averageConfidence,
        keyFindings: allFindings,
        recommendations: allRecommendations,
        detailedAnalysis: agentResults.reduce((acc, a) => {
          acc[a.agentName] = { findings: a.findings, recommendations: a.recommendations };
          return acc;
        }, {} as Record<string, any>),
        timings: { totalDurationMs },
        error: '',
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
