import { runAgents } from './agents/agent-runner';
import { readFileAsText } from './services/document-processor';
import type { AgentAnalysis } from './agents/agent-types';

export class RealAnalysisOrchestrator {
  static async analyzeDocument(
    file: File,
    summary?: string,
    reviewMode?: string
  ): Promise<{ id: string; results: AgentAnalysis[] }> {
    const text = await readFileAsText(file);
    const chunks = [{ content: text }];
    const results = await runAgents(chunks);

    console.log('Agent results:', results);

    return {
      id: `analysis-${Date.now()}`,
      results
    };
  }
}
