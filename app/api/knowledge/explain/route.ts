import { type NextRequest, NextResponse } from "next/server"
import { KnowledgeBaseService } from "@/lib/services/knowledge-base"

const knowledgeService = new KnowledgeBaseService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { concept, difficulty = "intermediate" } = body

    if (!concept) {
      return NextResponse.json({ error: "Concept is required" }, { status: 400 })
    }

    if (!["beginner", "intermediate", "advanced"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be one of: beginner, intermediate, advanced" },
        { status: 400 },
      )
    }

    const explanation = await knowledgeService.explainConcept(concept, difficulty)

    return NextResponse.json({
      success: true,
      concept,
      difficulty,
      explanation,
    })
  } catch (error) {
    console.error("Explain concept API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate explanation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
