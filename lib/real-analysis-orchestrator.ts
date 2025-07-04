// lib/real-analysis-orchestrator.ts (ny versjon koblet til agent-system)

import { RealDocumentProcessor } from './real-document-processor';
import { runAgents } from './agent-system/agent-runner';
import { AnalysisStorage } from './kv-storage';
import { v4 as uuidv4 } from 'uuid';

export class RealAnalysisOrchestrator {
  static async analyzeDocument(file: File, summary?: string, reviewMode: string = 'full'): Promise<string> {
    const analysisId = uuidv4();

    const initialResult = {
      analysisId,
      documentName: file.name,
      reviewMode,
      summary,
      status: 'processing',
      timestamp: new Date().toISOString()
    };

    await AnalysisStorage.storeAnalysis(analysisId, initialResult);

    this.processDocumentAsync(analysisId, file, summary, reviewMode).catch(err => {
      console.error('[Orchestrator] Async processing failed:', err);
      AnalysisStorage.updateAnalysisStatus(analysisId, 'failed', err.message || 'Unknown error');
    });

    return analysisId;
  }

  private static async processDocumentAsync(
    analysisId: string,
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ): Promise<void> {
    try {
      console.log('[Orchestrator] Processing document:', file.name);
      const processed = await RealDocumentProcessor.processFile(file);

      if (!processed.chunks || processed.chunks.length === 0) {
        throw new Error('No valid chunks generated');
      }

      console.log('[Orchestrator] Running agents...');
      const agentResults = await runAgents(processed.chunks);

      console.log('[Orchestrator] Storing final analysis');
      await AnalysisStorage.updateAnalysisResult(analysisId, {
        ...processed.metadata,
        results: agentResults,
        status: 'complete',
        completedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Orchestrator] Error during async processing:', err);
      await AnalysisStorage.updateAnalysisStatus(analysisId, 'failed', err.message || 'Error');
    }
  }
}
