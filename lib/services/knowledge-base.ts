import { getWeaviateClient } from "../weaviate"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface PhysicsKnowledge {
  id?: string
  content: string
  title: string
  topic: string
  difficulty: "beginner" | "intermediate" | "advanced"
  equations?: string[]
  concepts?: string[]
  source?: string
  chapter?: string
}

export interface SearchResult extends PhysicsKnowledge {
  relevanceScore: number
}

export class KnowledgeBaseService {
  private client = getWeaviateClient()

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName("PhysicsKnowledge")
        .withFields("content title topic difficulty equations concepts source chapter _additional { certainty id }")
        .withNearText({ concepts: [query] })
        .withLimit(limit)
        .do()

      const knowledge = result.data?.Get?.PhysicsKnowledge || []

      return knowledge.map((item: any) => ({
        id: item._additional?.id,
        content: item.content,
        title: item.title,
        topic: item.topic,
        difficulty: item.difficulty,
        equations: item.equations || [],
        concepts: item.concepts || [],
        source: item.source,
        chapter: item.chapter,
        relevanceScore: item._additional?.certainty || 0,
      }))
    } catch (error) {
      console.error("Knowledge search error:", error)
      return []
    }
  }

  async addKnowledge(knowledge: PhysicsKnowledge): Promise<string> {
    try {
      const result = await this.client.data
        .creator()
        .withClassName("PhysicsKnowledge")
        .withProperties({
          content: knowledge.content,
          title: knowledge.title,
          topic: knowledge.topic,
          difficulty: knowledge.difficulty,
          equations: knowledge.equations || [],
          concepts: knowledge.concepts || [],
          source: knowledge.source || "",
          chapter: knowledge.chapter || "",
        })
        .do()

      return result.id
    } catch (error) {
      console.error("Add knowledge error:", error)
      throw error
    }
  }

  async explainConcept(concept: string, difficulty = "intermediate"): Promise<string> {
    try {
      // First, search for relevant knowledge
      const searchResults = await this.search(concept, 3)
      const context = searchResults.map((r) => r.content).join("\n\n")

      // Generate explanation using AI
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Explain the physics concept "${concept}" at a ${difficulty} level.
        
        Use this context from our knowledge base:
        ${context}
        
        Provide a clear, accurate explanation that:
        1. Defines the concept clearly
        2. Explains the underlying physics principles
        3. Includes relevant equations if applicable
        4. Uses appropriate language for ${difficulty} level
        5. Connects to related concepts when helpful
        
        Keep the explanation concise but comprehensive.`,
      })

      return text
    } catch (error) {
      console.error("Explain concept error:", error)
      return `I apologize, but I'm unable to explain "${concept}" at the moment. Please try again later.`
    }
  }

  async getStats() {
    try {
      const client = getWeaviateClient()

      // Get total count
      const countResult = await client.graphql
        .aggregate()
        .withClassName("PhysicsKnowledge")
        .withFields("meta { count }")
        .do()

      const totalCount = countResult.data?.Aggregate?.PhysicsKnowledge?.[0]?.meta?.count || 0

      // Get topic distribution
      const topicResult = await client.graphql
        .aggregate()
        .withClassName("PhysicsKnowledge")
        .withFields("topic { topOccurrences { value occurs } }")
        .do()

      const topicDistribution = topicResult.data?.Aggregate?.PhysicsKnowledge?.[0]?.topic?.topOccurrences || []

      // Get difficulty distribution
      const difficultyResult = await client.graphql
        .aggregate()
        .withClassName("PhysicsKnowledge")
        .withFields("difficulty { topOccurrences { value occurs } }")
        .do()

      const difficultyDistribution =
        difficultyResult.data?.Aggregate?.PhysicsKnowledge?.[0]?.difficulty?.topOccurrences || []

      return {
        totalEntries: totalCount,
        topicDistribution,
        difficultyDistribution,
      }
    } catch (error) {
      console.error("Error getting stats:", error)
      return {
        totalEntries: 0,
        topicDistribution: [],
        difficultyDistribution: [],
      }
    }
  }
}
