export interface DocumentChunk {
  content: string;
  metadata: {
    source: string;
    chunkIndex: number;
    totalChunks: number;
    [key: string]: any;
  };
}

export interface AgentAnalysis {
  name: string;
  score: number;       // 0–10
  confidence: number;  // 0–1
  summary: string;
  findings: string[];
}
