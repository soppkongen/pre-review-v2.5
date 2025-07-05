console.log("DEBUG: process.env.OPENAI_API_KEY at runtime:", process.env.OPENAI_API_KEY);

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AgentResult {
  agentName: string;
  role: string;
  confidence: number;
  findings: string[];
  recommendations: string[];
}

async function callOpenAI(role: string, prompt: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: `You are a ${role} reviewing a scientific paper.` },
      { role: "user", content: prompt },
    ],
    max_tokens: 512,
  });
  return completion.choices[0]?.message?.content ?? "No response";
}

export const RealOpenAIAgents = {
  async theoreticalAgent(text: string): Promise<AgentResult> {
    const findings = await callOpenAI("theoretical physicist", `Analyze theoretically: ${text}`);
    return {
      agentName: "Theoretical Physicist",
      role: "Theory",
      confidence: 0.9,
      findings: [findings],
      recommendations: ["Explore deeper theoretical implications."]
    };
  },
  async mathematicalAgent(text: string): Promise<AgentResult> {
    const findings = await callOpenAI("mathematician", `Analyze mathematically: ${text}`);
    return {
      agentName: "Mathematical Analyst",
      role: "Mathematics",
      confidence: 0.85,
      findings: [findings],
      recommendations: ["Check mathematical proofs and logic."]
    };
  },
  async epistemicAgent(text: string): Promise<AgentResult> {
    const findings = await callOpenAI("epistemic reviewer", `Analyze for epistemic soundness: ${text}`);
    return {
      agentName: "Epistemic Reviewer",
      role: "Epistemics",
      confidence: 0.8,
      findings: [findings],
      recommendations: ["Clarify sources of uncertainty."]
    };
  },
  async runAllAgents(text: string): Promise<AgentResult[]> {
    return await Promise.all([
      RealOpenAIAgents.theoreticalAgent(text),
      RealOpenAIAgents.mathematicalAgent(text),
      RealOpenAIAgents.epistemicAgent(text),
    ]);
  }
};
