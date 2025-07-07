import { EpistemicAgent } from './epistemic-agent.js';
import { AgentAnalysis, DocumentChunk } from './agent-types.js';

export async function runAgentSystem(text: string): Promise<AgentAnalysis[]> {
  const agent = new EpistemicAgent();
  const result = await agent.run(text);
  return [result];
}
