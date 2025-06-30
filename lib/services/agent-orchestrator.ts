import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getWeaviateClient, type ResearchPaper, type AnalysisResult } from "../weaviate"

export interface Agent {
  id: string
  name: string
  role: string
  systemPrompt: string
  expertise: string[]
}

export interface AnalysisRequest {
  paperId: string
  paper: ResearchPaper
  analysisTypes: string[]
}

export interface AnalysisProgress {
  agentId: string
  agentName: string
  status: "pending" | "running" | "completed" | "error"
  progress: number
  result?: string
  error?: string
}

export class AgentOrchestrator {
  private client = getWeaviateClient()

  private agents: Agent[] = [
    {
      id: "methodology-agent",
      name: "Methodology Analyst",
      role: "Research Methodology Expert",
      systemPrompt: `You are a research methodology expert specializing in physics research. 
                     Analyze the methodology, experimental design, and research approach of physics papers.
                     Focus on: experimental setup, data collection methods, statistical analysis, 
                     controls, validity, and reproducibility. Identify strengths and potential weaknesses.`,
      expertise: ["experimental design", "statistical analysis", "research methods", "data collection"],
    },
    {
      id: "theoretical-agent",
      name: "Theoretical Physicist",
      role: "Theoretical Analysis Expert",
      systemPrompt: `You are a theoretical physicist expert. Analyze the theoretical framework, 
                     mathematical formulations, and conceptual foundations of physics papers.
                     Focus on: theoretical models, mathematical rigor, conceptual clarity, 
                     theoretical predictions, and consistency with established physics principles.`,
      expertise: ["theoretical physics", "mathematical modeling", "conceptual analysis", "theory validation"],
    },
    {
      id: "novelty-agent",
      name: "Innovation Assessor",
      role: "Novelty and Impact Expert",
      systemPrompt: `You are an expert in assessing scientific novelty and potential impact. 
                     Evaluate the originality, significance, and potential impact of physics research.
                     Focus on: novel contributions, advancement of knowledge, potential applications, 
                     significance to the field, and comparison with existing work.`,
      expertise: ["scientific novelty", "impact assessment", "literature comparison", "innovation evaluation"],
    },
    {
      id: "technical-agent",
      name: "Technical Reviewer",
      role: "Technical Quality Expert",
      systemPrompt: `You are a technical quality expert for physics research. Analyze technical 
                     accuracy, clarity, and presentation quality of physics papers.
                     Focus on: technical correctness, clarity of presentation, figure quality, 
                     data interpretation, error analysis, and overall technical rigor.`,
      expertise: ["technical accuracy", "data analysis", "presentation quality", "error assessment"],
    },
  ]

  async startAnalysis(request: AnalysisRequest): Promise<string> {
    try {
      const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Store initial analysis record
      await this.client.data
        .creator()
        .withClassName("AnalysisResult")
        .withProperties({
          paperId: request.paperId,
          analysisType: "multi-agent-analysis",
          result: JSON.stringify({ status: "started", analysisId }),
          confidence: 0,
          timestamp: new Date().toISOString(),
          agentId: "orchestrator",
        })
        .do()

      return analysisId
    } catch (error) {
      console.error("Error starting analysis:", error)
      throw new Error("Failed to start analysis")
    }
  }

  async *streamAnalysis(request: AnalysisRequest): AsyncGenerator<AnalysisProgress> {
    const activeAgents = this.agents.filter(
      (agent) =>
        request.analysisTypes.some((type) => agent.expertise.includes(type)) ||
        request.analysisTypes.includes("comprehensive"),
    )

    if (activeAgents.length === 0) {
      activeAgents.push(...this.agents) // Use all agents for comprehensive analysis
    }

    for (const agent of activeAgents) {
      yield {
        agentId: agent.id,
        agentName: agent.name,
        status: "running",
        progress: 0,
      }

      try {
        const analysisPrompt = this.buildAnalysisPrompt(agent, request.paper)

        let result = ""
        let progress = 0

        const stream = streamText({
          model: openai("gpt-4o"),
          system: agent.systemPrompt,
          prompt: analysisPrompt,
        })

        for await (const chunk of stream.textStream) {
          result += chunk
          progress = Math.min(progress + 5, 90)

          yield {
            agentId: agent.id,
            agentName: agent.name,
            status: "running",
            progress,
          }
        }

        // Store the analysis result
        await this.client.data
          .creator()
          .withClassName("AnalysisResult")
          .withProperties({
            paperId: request.paperId,
            analysisType: agent.role,
            result,
            confidence: 0.85,
            timestamp: new Date().toISOString(),
            agentId: agent.id,
          })
          .do()

        yield {
          agentId: agent.id,
          agentName: agent.name,
          status: "completed",
          progress: 100,
          result,
        }
      } catch (error) {
        console.error(`Error in agent ${agent.id}:`, error)
        yield {
          agentId: agent.id,
          agentName: agent.name,
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }
  }

  private buildAnalysisPrompt(agent: Agent, paper: ResearchPaper): string {
    return `Please analyze the following physics research paper from your perspective as a ${agent.role}:

Title: ${paper.title}
Authors: ${paper.authors.join(", ")}
Field: ${paper.field}
Keywords: ${paper.keywords.join(", ")}

Abstract:
${paper.abstract}

Full Content:
${paper.content.substring(0, 8000)}${paper.content.length > 8000 ? "..." : ""}

Please provide a detailed analysis focusing on your area of expertise. Structure your response with:
1. Executive Summary
2. Detailed Analysis
3. Strengths
4. Areas for Improvement
5. Recommendations
6. Overall Assessment

Be specific, constructive, and provide actionable feedback.`
  }

  async getAnalysisResults(paperId: string): Promise<AnalysisResult[]> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName("AnalysisResult")
        .withFields("paperId analysisType result confidence timestamp agentId")
        .withWhere({
          path: ["paperId"],
          operator: "Equal",
          valueText: paperId,
        })
        .do()

      return result.data?.Get?.AnalysisResult || []
    } catch (error) {
      console.error("Error getting analysis results:", error)
      throw new Error("Failed to get analysis results")
    }
  }

  getAgents(): Agent[] {
    return this.agents
  }
}
