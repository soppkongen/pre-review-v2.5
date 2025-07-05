import { RealDocumentProcessor } from '../real-document-processor';
import { storeAnalysis } from '../kv-storage';
import { v4 as uuidv4 } from 'uuid';

export class AgentOrchestrator {
  async analyzeDocument(file: File, summary?: string, reviewMode: string = 'full'): Promise<string> {
    const analysisId = uuidv4();
    // Store initial status
    await storeAnalysis(analysisId, {
      analysisId,
      documentName: file.name,
      reviewMode,
      summary,
      status: 'processing',
      timestamp: new Date().toISOString()
    });
    // Start async processing (could be queued or run in background)
    this.processDocumentAsync(analysisId, file, summary, reviewMode);
    return analysisId;
  }

  private async processDocumentAsync(analysisId: string, file: File, summary?: string, reviewMode: string = 'full') {
    const processed = await RealDocumentProcessor.processFile(file);
    // Here you would call your agents and aggregate results
    await storeAnalysis(analysisId, {
      analysisId,
      documentName: file.name,
      reviewMode,
      summary,
      status: 'completed',
      timestamp: new Date().toISOString(),
      processed,
    });
  }
}
