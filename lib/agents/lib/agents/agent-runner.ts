import { EpistemicAgent } from './epistemic-agent';
import { AgentResult } from './agent-types';

export async function runAgentSystem(documentText: string): Promise<AgentResult[]> {
  const agent = new EpistemicAgent();
  const result = await agent.run(documentText);
  return [result];
}
