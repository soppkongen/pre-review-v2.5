import { RealDocumentProcessor } from '../real-document-processor';
import { RealOpenAIAgents } from '../real-openai-agents';
import { AnalysisStorage } from '../kv-storage';
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
    this.processDocumentAsync(analysisId, file, summary, reviewMode);
    return analysisId;
  }

  private async processDocumentAsync(analysisId: string, file: File, summary?: string, reviewMode: string = 'full') {
    const processed = await RealDocumentProcessor.processFile(file);
    const fullText = processed.getContent();

    // Run all AI agents (real OpenAI calls)
    const agentResults = await RealOpenAIAgents.runAllAgents(fullText);

    // Optionally: Search Weaviate for relevant knowledge
    // const knowledge = await searchPhysicsKnowledge("quantum mechanics");

    await AnalysisStorage.store(analysisId, {
      analysisId,
      documentName: file.name,
      reviewMode,
      summary,
      status: 'completed',
      timestamp: new Date().toISOString(),
      agentResults,
      overallScore: Math.round(agentResults.reduce((sum, a) => sum + a.confidence, 0) / agentResults.length * 10),
      confidence: agentResults.reduce((sum, a) => sum + a.confidence, 0) / agentResults.length,
      summary: agentResults.map(a => a.findings.join(' ')).join(' '),
    });
  }
}
