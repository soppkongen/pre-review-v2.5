import { EpistemicAgent } from './agents/epistemic-agent';
import { AgentResult } from './agents/agent-types';

export async function runAgentSystem(documentText: string): Promise<AgentResult[]> {
  const agent = new EpistemicAgent();
  const result = await agent.run(documentText);
  return [result];
}

