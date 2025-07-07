import { EpistemicAgent } from './epistemic-agent';
import { AgentAnalysis, DocumentChunk } from './agent-types';

export async function runAgentSystem(text: string): Promise<AgentAnalysis[]> {
  const agent = new EpistemicAgent();
  const result = await agent.run(text);
  return [result];
}
