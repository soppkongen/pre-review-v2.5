import { type NextRequest, NextResponse } from "next/server"
import { agentOrchestrator } from "@/lib/services/agent-orchestrator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paperId, title, abstract, content } = body

    // Validate required fields
    if (!paperId || !title || !abstract || !content) {
      return NextResponse.json({ error: "Missing required fields: paperId, title, abstract, content" }, { status: 400 })
    }

    // Start the analysis
    const analysisRequest = {
      paperId,
      title,
      abstract,
      content,
    }

    const results = await agentOrchestrator.analyzePaper(analysisRequest)

    return NextResponse.json({
      success: true,
      paperId,
      results,
      totalAgents: results.length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      message: "Multi-agent analysis completed successfully",
    })
  } catch (error) {
    console.error("Analysis start API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start analysis",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paperId = searchParams.get("paperId")

    if (!paperId) {
      return NextResponse.json({ error: "paperId parameter is required" }, { status: 400 })
    }

    const results = await agentOrchestrator.getAnalysisHistory(paperId)

    return NextResponse.json({
      success: true,
      paperId,
      results,
      total: results.length,
    })
  } catch (error) {
    console.error("Get analysis API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve analysis",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
