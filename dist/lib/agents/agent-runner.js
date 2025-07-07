import { EpistemicAgent } from './epistemic-agent.js';
export async function runAgentSystem(text) {
    const agent = new EpistemicAgent();
    const result = await agent.run(text);
    return [result];
}
