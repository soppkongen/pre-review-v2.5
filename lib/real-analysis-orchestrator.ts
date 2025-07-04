import { runAgentSystem } from './agents/agent-runner';
import { readFileAsText } from './document-processor';

export class RealAnalysisOrchestrator {
  static async analyzeDocument(file: File, summary?: string, reviewMode?: string): Promise<string> {
    const text = await readFileAsText(file);
    const results = await runAgentSystem(text);

    console.log('Agent results:', results);

    return `analysis-${Date.now()}`;
  }
}
