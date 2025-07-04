export type AgentResult = {
  summary: string;
  issues: string[];
};

export type DocumentChunk = {
  content: string;
};

export type AgentAnalysis = AgentResult;
