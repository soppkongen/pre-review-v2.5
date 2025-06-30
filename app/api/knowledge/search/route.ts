import { type NextRequest, NextResponse } from "next/server"
import { KnowledgeBaseService } from "@/lib/services/knowledge-base"

const knowledgeService = new KnowledgeBaseService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 })
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json({ error: "Limit must be between 1 and 50" }, { status: 400 })
    }

    const results = await knowledgeService.search(query, limit)

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      query,
    })
  } catch (error) {
    console.error("Knowledge search API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search knowledge base",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, title, topic, difficulty, equations, concepts, source, chapter } = body

    // Validate required fields
    if (!content || !title || !topic || !difficulty) {
      return NextResponse.json({ error: "Missing required fields: content, title, topic, difficulty" }, { status: 400 })
    }

    // Validate difficulty level
    if (!["beginner", "intermediate", "advanced"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be one of: beginner, intermediate, advanced" },
        { status: 400 },
      )
    }

    const knowledgeEntry = {
      content,
      title,
      topic,
      difficulty,
      equations: equations || [],
      concepts: concepts || [],
      source: source || "",
      chapter: chapter || "",
    }

    const id = await knowledgeService.addKnowledge(knowledgeEntry)

    return NextResponse.json({
      success: true,
      id,
      message: "Knowledge entry added successfully",
    })
  } catch (error) {
    console.error("Add knowledge API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add knowledge entry",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
