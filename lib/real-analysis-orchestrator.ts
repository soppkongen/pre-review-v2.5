import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
import { searchPhysicsKnowledge } from '../weaviate';
import { v4 as uuidv4 } from 'uuid';

export class AgentOrchestrator {
  /**
   * Starts analysis for a document and returns the analysisId immediately.
   * The actual analysis runs asynchronously in the background.
   */
  async analyzeDocument(file: File, summary?: string, reviewMode: string = 'full'): Promise<string> {
    const analysisId = uuidv4();
    // Store initial status as 'processing'
    await AnalysisStorage.store(analysisId, {
      analysisId,
      documentName: file.name,
      reviewMode,
      summary,
      status: 'processing',
      timestamp: new Date().toISOString()
    });
    // Start real analysis in background
    this.processDocumentAsync(analysisId, file, summary, reviewMode);
    return analysisId;
  }

  /**
   * Runs the actual document analysis and stores the completed result.
   * Handles all agent execution and aggregation.
   */
  private async processDocumentAsync(
    analysisId: string,
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ) {
    try {
      // 1. Extract text from the uploaded file
      const processed = await RealDocumentProcessor.processFile(file);
      const fullText = processed.getContent();

      // 2. Retrieve relevant knowledge from Weaviate (for RAG)
      const knowledge = await searchPhysicsKnowledge(fullText.slice(0, 200), 5);

      // 3. Run all AI agents (real OpenAI calls, with retrieved knowledge if desired)
      const agentResults = await RealOpenAIAgents.runAllAgents(fullText, knowledge);

      // 4. Aggregate results
      const overallScore = Math.round(
        agentResults.reduce((sum, a) => sum + a.confidence, 0) / agentResults.length * 10
      );
      const confidence =
        agentResults.reduce((sum, a) => sum + a.confidence, 0) / agentResults.length;
      const allFindings = agentResults.flatMap(a => a.findings);
      const allRecommendations = agentResults.flatMap(a => a.recommendations);

      // 5. Store the completed analysis result
      await AnalysisStorage.store(analysisId, {
        analysisId,
        documentName: file.name,
        reviewMode,
        summary: allFindings.join('\n'),
        status: 'completed',
        timestamp: new Date().toISOString(),
        agentResults,
        overallScore,
        confidence,
        keyFindings: allFindings,
        recommendations: allRecommendations,
        detailedAnalysis: agentResults, // now includes all agent outputs
        error: ''
      });
      console.log('[Orchestrator] Stored analysis result:', analysisId);
    } catch (err) {
      // Store the error for frontend display
      await AnalysisStorage.store(analysisId, {
        analysisId,
        status: 'failed',
        error: (err as Error).message,
        timestamp: new Date().toISOString()
      });
      console.error('[Orchestrator] Analysis failed:', analysisId, err);
    }
  }

  /**
   * Retrieves an analysis result by ID.
   */
  async getAnalysisResult(id: string) {
    const result = await AnalysisStorage.get(id);
    if (result) return result;
    return { status: 'processing' };
  }
}
