// lib/services/analysis-orchestrator.ts

import { SingleAgentRunner } from "../agents/agent-runner";
import { BaseAgent } from "../agents/base-agent";
import { TheoreticalPhysicsAgent } from "../agents/theoretical-physics-agent";
import { ManuscriptIntakeAgent } from "../agents/manuscript-intake-agent";

interface FileMeta {
  name: string;
  type: string;
  size: number;
}

export interface AnalysisRequest {
  fileContent: string;
  fileMeta: FileMeta;
  mode?: "theory" | "intake";
}

export interface AgentResponse {
  success: boolean;
  output: string;
  agent: string;
}

export async function runAgentAnalysis(
  request: AnalysisRequest
): Promise<AgentResponse> {
  const { fileContent, fileMeta, mode = "intake" } = request;

  let agent: BaseAgent;
  if (mode === "theory") {
    agent = new TheoreticalPhysicsAgent();
  } else {
    agent = new ManuscriptIntakeAgent();
  }

  const runner = new SingleAgentRunner(agent);
  const result = await runner.run({
    input: fileContent,
    context: {
      fileName: fileMeta.name,
      fileType: fileMeta.type,
      fileSize: fileMeta.size,
    },
  });

  return {
    success: true,
    output: result.output,
    agent: agent.name,
  };
}
