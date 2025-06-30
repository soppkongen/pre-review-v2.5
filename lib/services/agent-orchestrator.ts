import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getWeaviateClient } from "../weaviate"

export interface AnalysisAgent {
  name: string
  role: string
  systemPrompt: string
}

export interface AnalysisResult {
  agentName: string
  analysis: string
  score: number
  recommendations: string[]
  confidence: number
}

export interface PaperAnalysisRequest {
  paperId: string
  title: string
  abstract: string
  content: string
}

export class AgentOrchestrator {
  private agents: AnalysisAgent[] = [
    {
      name: "Theory Validator",
      role: "theoretical_analysis",
      systemPrompt: `You are a theoretical physics expert specializing in validating theoretical frameworks and mathematical foundations in research papers. 
      
      Analyze papers for:
      - Theoretical consistency and rigor
      - Mathematical correctness
      - Proper use of physical principles
      - Novel theoretical contributions
      - Connections to established theory
      
      Provide a score from 1-10 and specific recommendations for improvement.`,
    },
    {
      name: "Methodology Reviewer",
      role: "methodology_analysis",
      systemPrompt: `You are a research methodology expert focusing on experimental design, data analysis, and research methods in physics.
      
      Analyze papers for:
      - Experimental design quality
      - Statistical analysis appropriateness
      - Data collection methods
      - Control variables and bias
      - Reproducibility of methods
      
      Provide a score from 1-10 and specific recommendations for improvement.`,
    },
    {
      name: "Literature Specialist",
      role: "literature_analysis",
      systemPrompt: `You are a physics literature expert specializing in citation analysis, literature review quality, and positioning within the field.
      
      Analyze papers for:
      - Completeness of literature review
      - Proper citation of relevant work
      - Identification of research gaps
      - Positioning within current research
      - Missing key references
      
      Provide a score from 1-10 and specific recommendations for improvement.`,
    },
    {
      name: "Impact Assessor",
      role: "impact_analysis",
      systemPrompt: `You are a research impact specialist focusing on the potential significance and applications of physics research.
      
      Analyze papers for:
      - Novelty and originality
      - Potential impact on the field
      - Practical applications
      - Future research directions
      - Broader scientific implications
      
      Provide a score from 1-10 and specific recommendations for improvement.`,
    },
  ]

  private client = getWeaviateClient()

  async analyzeWithAgent(agent: AnalysisAgent, paper: PaperAnalysisRequest): Promise<AnalysisResult> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: agent.systemPrompt,
        prompt: `Analyze this physics research paper:

Title: ${paper.title}

Abstract: ${paper.abstract}

Content: ${paper.content.substring(0, 4000)}...

Please provide:
1. A detailed analysis focusing on your area of expertise
2. A numerical score from 1-10
3. Specific recommendations for improvement
4. Your confidence level in this analysis (0-1)

Format your response as a structured analysis.`,
      })

      // Extract score and confidence from the response (simplified parsing)
      const scoreMatch = text.match(/score[:\s]*(\d+(?:\.\d+)?)/i)
      const confidenceMatch = text.match(/confidence[:\s]*(\d+(?:\.\d+)?)/i)

      const score = scoreMatch ? Number.parseFloat(scoreMatch[1]) : 7.0
      const confidence = confidenceMatch ? Number.parseFloat(confidenceMatch[1]) : 0.8

      // Extract recommendations (simplified)
      const recommendations = text
        .split(/recommendations?[:\s]*/i)[1]
        ?.split(/\n/)
        .filter((line) => line.trim().length > 0)
        .slice(0, 5) || ["Continue developing the research methodology", "Consider additional literature review"]

      return {
        agentName: agent.name,
        analysis: text,
        score: Math.min(Math.max(score, 1), 10), // Clamp between 1-10
        recommendations,
        confidence: Math.min(Math.max(confidence, 0), 1), // Clamp between 0-1
      }
    } catch (error) {
      console.error(`Error in ${agent.name} analysis:`, error)
      return {
        agentName: agent.name,
        analysis: `Analysis temporarily unavailable due to system error. Please try again later.`,
        score: 5.0,
        recommendations: ["Retry analysis when system is available"],
        confidence: 0.1,
      }
    }
  }

  async analyzePaper(paper: PaperAnalysisRequest): Promise<AnalysisResult[]> {
    console.log(`Starting multi-agent analysis for paper: ${paper.title}`)

    const results: AnalysisResult[] = []

    // Run all agents in parallel for efficiency
    const analysisPromises = this.agents.map((agent) => this.analyzeWithAgent(agent, paper))

    try {
      const agentResults = await Promise.all(analysisPromises)
      results.push(...agentResults)

      // Store results in Weaviate
      for (const result of agentResults) {
        try {
          await this.client.data
            .creator()
            .withClassName("AnalysisResult")
            .withProperties({
              paperId: paper.paperId,
              agentType: result.agentName,
              analysis: result.analysis,
              score: result.score,
              confidence: result.confidence,
              recommendations: result.recommendations,
              createdAt: new Date().toISOString(),
            })
            .do()
        } catch (storageError) {
          console.error("Error storing analysis result:", storageError)
        }
      }

      console.log(`Completed analysis for ${paper.title} with ${results.length} agent results`)
    } catch (error) {
      console.error("Error in multi-agent analysis:", error)
      throw new Error("Multi-agent analysis failed")
    }

    return results
  }

  async getAnalysisHistory(paperId: string): Promise<AnalysisResult[]> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName("AnalysisResult")
        .withFields("agentType analysis score confidence recommendations createdAt")
        .withWhere({
          path: ["paperId"],
          operator: "Equal",
          valueString: paperId,
        })
        .withSort([{ path: ["createdAt"], order: "desc" }])
        .do()

      const analyses = result.data?.Get?.AnalysisResult || []

      return analyses.map((item: any) => ({
        agentName: item.agentType,
        analysis: item.analysis,
        score: item.score,
        recommendations: item.recommendations || [],
        confidence: item.confidence,
      }))
    } catch (error) {
      console.error("Error retrieving analysis history:", error)
      return []
    }
  }

  getAvailableAgents(): AnalysisAgent[] {
    return this.agents
  }
}

export const agentOrchestrator = new AgentOrchestrator()
