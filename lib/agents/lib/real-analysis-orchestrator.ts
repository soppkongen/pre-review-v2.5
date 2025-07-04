import { runAgentSystem } from './agents/agent-runner';
import { extractTextFromDocument } from './document-processor';

export async function analyzeDocument(file: any) {
  const text = await extractTextFromDocument(file);
  const results = await runAgentSystem(text);
  return results;
}
