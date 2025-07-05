import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
import { searchPhysicsKnowledge } from '../weaviate';
import { v4 as uuidv4 } from 'uuid';

export class AgentOrchestrator {
  async analyzeDocument(file: File, summary?: string, reviewMode: string = 'full'): Promise<string> {
    const analysisId = uuidv4();
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

  private async processDocumentAsync(analysisId: string, file: File, summary?: string, reviewMode: string = 'full') {
    try {
      const processed = await RealDocumentProcessor.processFile(file);
      const fullText = processed.getContent();

      // Retrieve relevant knowledge from Weaviate (optional, for RAG)
      const knowledge = await searchPhysicsKnowledge(fullText.slice(0, 200), 5);

      // Run all AI agents (real OpenAI calls, with retrieved knowledge if desired)
      const agentResults = await RealOpenAIAgents.runAllAgents(fullText);

      // Aggregate results
      const overallScore = Math.round(agentResults.reduce((sum, a) => sum + a.confidence, 0) / agentResults.length * 10);
      const confidence = agentResults.reduce((sum, a) => sum + a.confidence, 0) / agentResults.length;
      const allFindings = agentResults.flatMap(a => a.findings);
      const allRecommendations = agentResults.flatMap(a => a.recommendations);

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
        detailedAnalysis: {}, // Fill in with more agent outputs as needed
        error: ''
      });
    } catch (err) {
      await AnalysisStorage.store(analysisId, {
        analysisId,
        status: 'failed',
        error: (err as Error).message,
        timestamp: new Date().toISOString()
      });
    }
  }
}
