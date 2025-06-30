import type { NextRequest } from "next/server"
import { agentOrchestrator } from "@/lib/services/agent-orchestrator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paperId, title, abstract, content } = body

    // Validate required fields
    if (!paperId || !title || !abstract || !content) {
      return new Response("Missing required fields", { status: 400 })
    }

    // Create a readable stream for real-time updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "Starting multi-agent analysis...",
                progress: 0,
              })}\n\n`,
            ),
          )

          const analysisRequest = {
            paperId,
            title,
            abstract,
            content,
          }

          const agents = agentOrchestrator.getAvailableAgents()
          const results = []

          // Process each agent and stream results
          for (let i = 0; i < agents.length; i++) {
            const agent = agents[i]

            // Send progress update
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  message: `Analyzing with ${agent.name}...`,
                  progress: (i / agents.length) * 100,
                  currentAgent: agent.name,
                })}\n\n`,
              ),
            )

            try {
              const result = await agentOrchestrator.analyzeWithAgent(agent, analysisRequest)
              results.push(result)

              // Send individual result
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "result",
                    agent: agent.name,
                    result,
                    progress: ((i + 1) / agents.length) * 100,
                  })}\n\n`,
                ),
              )
            } catch (error) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    agent: agent.name,
                    error: error instanceof Error ? error.message : "Analysis failed",
                  })}\n\n`,
                ),
              )
            }
          }

          // Send completion
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                message: "Analysis completed",
                results,
                totalAgents: results.length,
                averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
              })}\n\n`,
            ),
          )

          controller.close()
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Stream failed",
              })}\n\n`,
            ),
          )
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
    console.error("Stream analysis API error:", error)
    return new Response("Failed to start streaming analysis", { status: 500 })
  }
}
