import { v4 as uuidv4 } from 'uuid';
import { AnalysisStorage } from '@/lib/kv-storage';
import { PhysicsAgent } from '@/lib/agents/physicsAgent';

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

  private async processDocumentAsync(
    analysisId: string,
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ) {
    try {
      const fileContent = await file.text();

      // Run the PhysicsAgent with real content
      const physicsAgent = new PhysicsAgent();
      const physicsResult = await physicsAgent.analyze(fileContent);

      // Example: parse findings, strengths, weaknesses, recommendations
      const keyFindings = physicsResult.knowledge.map(k => k.content).slice(0, 3);
      const strengths = ['Clear explanations', 'Relevant examples'];
      const weaknesses = ['Limited mathematical detail'];
      const recommendations = physicsResult.recommendations;

      const overallScore = Math.round((physicsResult.knowledge.length / 5) * 10);
      const confidence = physicsResult.knowledge.length ? 0.8 : 0.5;

      const analysis = {
        analysisId,
        documentName: file.name,
        analysisType: reviewMode,
        timestamp: new Date().toISOString(),
        overallScore,
        confidence,
        summary: physicsResult.summary,
        keyFindings,
        strengths,
        weaknesses,
        recommendations,
        agentResults: [physicsResult],
        detailedAnalysis: physicsResult.knowledge,
        status: 'completed',
        error: ''
      };

      await AnalysisStorage.store(analysisId, analysis);
      console.log('[Orchestrator] Stored analysis result:', analysisId, analysis);
    } catch (err) {
      await AnalysisStorage.store(analysisId, {
        analysisId,
        status: 'failed',
        error: (err as Error).message,
        timestamp: new Date().toISOString()
      });
      console.error('[Orchestrator] Analysis failed:', analysisId, err);
    }
  }

  async getAnalysisResult(id: string) {
    const result = await AnalysisStorage.get(id);
    if (result) return result;
    return { status: 'processing' };
  }
}
