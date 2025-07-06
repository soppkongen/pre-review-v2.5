import OpenAI from "openai";
import { OpenAIRateLimiter } from '@/lib/ai/rate-limiter';

const rateLimiter = new OpenAIRateLimiter({ minIntervalMs: 1000, concurrency: 2 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AgentResult {
  agentName: string;
  role: string;
  confidence: number;
  findings: string[];
  recommendations: string[];
  durationMs?: number;
}

async function callOpenAI(
  role: string,
  prompt: string
): Promise<{ text: string; durationMs: number }> {
  const start = Date.now();
  const completion = await rateLimiter.schedule(() =>
    openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: `You are a ${role}.` }, { role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    })
  );
  const durationMs = Date.now() - start;
  return { text: completion.choices[0].message.content.trim(), durationMs };
}

export const RealOpenAIAgents = {
  async theoreticalAgent(opts: { text: string; context?: string[] }): Promise<AgentResult> {
    const prompt = [
      "Provide a **theoretical** analysis of the paper.",
      opts.context ? `Context:\n${opts.context.join('\n')}` : '',
      `Content:\n${opts.text}`,
      "Output JSON with fields: observations[], strengths[], weaknesses[], recommendations[]."
    ].filter(Boolean).join('\n\n');
    const { text, durationMs } = await callOpenAI("theoretical physicist", prompt);
    const parsed = JSON.parse(text);
    return { agentName: "Theoretical Physicist", role: "Theory", confidence: 0.9, ...parsed, durationMs };
  },

  async mathematicalAgent(opts: { text: string; context?: string[] }): Promise<AgentResult> {
    const prompt = [
      "Analyze the **mathematical** soundness and rigor.",
      opts.context ? `Context:\n${opts.context.join('\n')}` : '',
      `Content:\n${opts.text}`,
      "Output JSON with fields: observations[], strengths[], weaknesses[], recommendations[]."
    ].filter(Boolean).join('\n\n');
    const { text, durationMs } = await callOpenAI("mathematician", prompt);
    const parsed = JSON.parse(text);
    return { agentName: "Mathematical Analyst", role: "Mathematics", confidence: 0.85, ...parsed, durationMs };
  },

  async epistemicAgent(opts: { text: string; context?: string[] }): Promise<AgentResult> {
    const prompt = [
      "Evaluate the **epistemic** quality and reliability.",
      opts.context ? `Context:\n${opts.context.join('\n')}` : '',
      `Content:\n${opts.text}`,
      "Output JSON with fields: observations[], strengths[], weaknesses[], recommendations[]."
    ].filter(Boolean).join('\n\n');
    const { text, durationMs } = await callOpenAI("epistemic reviewer", prompt);
    const parsed = JSON.parse(text);
    return { agentName: "Epistemic Reviewer", role: "Epistemics", confidence: 0.8, ...parsed, durationMs };
  },

  async runAllAgents(opts: { text: string; context?: string[] }): Promise<AgentResult[]> {
    return await Promise.all([
      this.theoreticalAgent(opts),
      this.mathematicalAgent(opts),
      this.epistemicAgent(opts),
    ]);
  },
};
