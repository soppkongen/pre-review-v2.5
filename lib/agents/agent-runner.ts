import { AgentAnalysis, DocumentChunk } from './agent-types';
import { EpistemicAgent } from './epistemic-agent';

export async function runAgents(chunks: DocumentChunk[]): Promise<AgentAnalysis[]> {
  const fullText = chunks.map(c => c.content).join('\n\n');
  console.log('[AgentRunner] Received', chunks.length, 'chunks, total chars:', fullText.length);

  const results: AgentAnalysis[] = [];
  results.push(await runEpistemicAgent(fullText));

  console.log('[AgentRunner] Returning', results.length, 'agent results');
  return results;
}
