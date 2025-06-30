import type { NextRequest } from "next/server"
import { AgentOrchestrator } from "@/lib/services/agent-orchestrator"
import { getWeaviateClient } from "@/lib/weaviate"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paperId, analysisTypes } = body

    if (!paperId) {
      return new Response("Paper ID is required", { status: 400 })
    }

    // Get the paper from Weaviate
    const client = getWeaviateClient()
    const paperResult = await client.graphql
      .get()
      .withClassName("ResearchPaper")
      .withFields("title authors abstract content field keywords uploadDate fileType")
      .withWhere({
        path: ["id"],
        operator: "Equal",
        valueText: paperId,
      })
      .do()

    const papers = paperResult.data?.Get?.ResearchPaper
    if (!papers || papers.length === 0) {
      return new Response("Paper not found", { status: 404 })
    }

    const paper = papers[0]
    const orchestrator = new AgentOrchestrator()

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const progress of orchestrator.streamAnalysis({
            paperId,
            paper,
            analysisTypes: analysisTypes || ["comprehensive"],
          })) {
            const data = `data: ${JSON.stringify(progress)}\n\n`
            controller.enqueue(encoder.encode(data))
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Stream analysis error:", error)
          const errorData = `data: ${JSON.stringify({ error: "Analysis failed" })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Stream analysis setup error:", error)
    return new Response("Failed to start analysis stream", { status: 500 })
  }
}
