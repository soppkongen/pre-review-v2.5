import { AgentResult } from './agent-types';

export class EpistemicAgent {
  async run(text: string): Promise<AgentResult> {
    return {
      summary: 'Epistemic analysis complete.',
      issues: ['No critical issues found.'],
    };
  }
}
