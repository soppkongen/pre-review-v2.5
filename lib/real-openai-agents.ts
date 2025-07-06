import OpenAI from "openai";
import { OpenAIRateLimiter } from '@/lib/ai/rate-limiter';

const rateLimiter = new OpenAIRateLimiter({ minIntervalMs: 15000, concurrency: 1 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AgentResult {
  agentName: string;
  role: string;
  confidence: number;
  findings: string[];
  recommendations: string[];
  durationMs: number;
}

async function callOpenAI(
  role: string,
  prompt: string,
  model: string,
  maxTokens: number
): Promise<{ text: string; durationMs: number }> {
  const t0 = Date.now();
  const res = await rateLimiter.schedule(() =>
    openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: `You are a ${role}.` },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    })
  );
  return { text: res.choices[0].message.content.trim(), durationMs: Date.now() - t0 };
}

export const RealOpenAIAgents = {
  async summarizeChunk(text: string, model: string, maxTokens: number): Promise<{ text: string }> {
    const prompt = `Summarize this text in up to ${maxTokens} tokens:\n\n${text}`;
    const { text: sum } = await callOpenAI('summarizer', prompt, model, maxTokens);
    return { text: sum };
  },

  async theoreticalAgent(opts: { text: string; context?: string[] }): Promise<AgentResult> {
    const prompt = [
      "Provide a **theoretical** analysis.",
      opts.context?.length ? `Context:\n${opts.context.join('\n')}` : '',
      `Content:\n${opts.text}`,
      "Return JSON: { observations: string[], strengths: string[], weaknesses: string[], recommendations: string[] }"
    ].filter(Boolean).join('\n\n');
    const { text, durationMs } = await callOpenAI('theoretical physicist', prompt, 'gpt-4-turbo', 250);
    return { agentName: "Theoretical Physicist", role: "Theory", confidence: 0.9, ...JSON.parse(text), durationMs };
  },

  async mathematicalAgent(opts: { text: string; context?: string[] }): Promise<AgentResult> {
    const prompt = [
      "Analyze the **mathematical** rigor.",
      opts.context?.length ? `Context:\n${opts.context.join('\n')}` : '',
      `Content:\n${opts.text}`,
      "Return JSON: { observations: string[], strengths: string[], weaknesses: string[], recommendations: string[] }"
    ].filter(Boolean).join('\n\n');
    const { text, durationMs } = await callOpenAI('mathematician', prompt, 'gpt-4-turbo', 250);
    return { agentName: "Mathematical Analyst", role: "Mathematics", confidence: 0.85, ...JSON.parse(text), durationMs };
  },

  async epistemicAgent(opts: { text: string; context?: string[] }): Promise<AgentResult> {
    const prompt = [
      "Evaluate the **epistemic** quality.",
      opts.context?.length ? `Context:\n${opts.context.join('\n')}` : '',
      `Content:\n${opts.text}`,
      "Return JSON: { observations: string[], strengths: string[], weaknesses: string[], recommendations: string[] }"
    ].filter(Boolean).join('\n\n');
    const { text, durationMs } = await callOpenAI('epistemic reviewer', prompt, 'gpt-4-turbo', 250);
    return { agentName: "Epistemic Reviewer", role: "Epistemics", confidence: 0.8, ...JSON.parse(text), durationMs };
  },

  async runAllAgents(opts: { text: string; context?: string[] }) {
    return Promise.all([
      this.theoreticalAgent(opts),
      this.mathematicalAgent(opts),
      this.epistemicAgent(opts),
    ]);
  },

  agentIds(): string[] {
    return ['theoretical', 'mathematical', 'epistemic'];
  },

  async runAgent(agentId: string, opts: { text: string; context?: string[] }) {
    switch (agentId) {
      case 'theoretical': return this.theoreticalAgent(opts);
      case 'mathematical': return this.mathematicalAgent(opts);
      case 'epistemic': return this.epistemicAgent(opts);
      default: throw new Error(`Unknown agent ${agentId}`);
    }
  },
};
