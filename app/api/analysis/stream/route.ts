import type { NextRequest } from "next/server"
import { AgentOrchestrator } from "@/lib/services/agent-orchestrator"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paperContent = searchParams.get("paperContent")
  const paperTitle = searchParams.get("paperTitle")

  if (!paperContent || !paperTitle) {
    return new Response("Missing required parameters", { status: 400 })
  }

  const encoder = new TextEncoder()
  let isCompleted = false
  
  const stream = new ReadableStream({
    async start(controller) {
      // Set up timeout to prevent infinite streams
      const timeout = setTimeout(() => {
        if (!isCompleted) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Analysis timeout - please try again",
              })}\n\n`,
            ),
          )
          controller.close()
          isCompleted = true
        }
      }, 180000) // 3 minute timeout

      try {
        const orchestrator = new AgentOrchestrator()
        const agents = orchestrator.getAgents()

        // Send initial message
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "analysis-start",
              message: "Starting multi-agent analysis...",
              totalAgents: agents.length,
            })}\n\n`,
          ),
        )

        // Process each agent strictly one after the other
        for (let i = 0; i < agents.length && !isCompleted; i++) {
          const agent = agents[i]
          const agentStart = Date.now();

          try {
            // Send progress update
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "agent-start",
                  agentId: agent.id,
                  agentName: agent.name,
                  progress: Math.round((i / agents.length) * 100),
                })}\n\n`,
              ),
            )

            // Wait for agent analysis to fully complete before starting next
            const result = await orchestrator.analyzeWithAgent(agent.id, paperContent, paperTitle)

            if (!isCompleted) {
              // Send agent result in smaller chunks to prevent large payloads
              const resultText = typeof result === 'string' ? result : 'Analysis completed';
              const chunks = resultText.match(/.{1,300}/g) || [resultText]
              
              for (const chunk of chunks) {
                if (!isCompleted) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "analysis-chunk",
                        agentId: agent.id,
                        chunk: chunk,
                        timestamp: new Date().toISOString(),
                      })}\n\n`,
                    ),
                  )
                  // Small delay between chunks to prevent overwhelming
                  await new Promise(resolve => setTimeout(resolve, 50))
                }
              }

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "agent-complete",
                    agentId: agent.id,
                    agentName: agent.name,
                    durationMs: Date.now() - agentStart
                  })}\n\n`,
                ),
              )
            }
          } catch (error) {
            console.error(`Agent ${agent.id} failed:`, error)
            if (!isCompleted) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "agent-error",
                    agentId: agent.id,
                    error: error instanceof Error ? error.message : "Analysis failed",
                  })}\n\n`,
                ),
              )
            }
          }

          // Wait 500ms between agents to avoid rate limits and give time for each analysis
          if (i < agents.length - 1 && !isCompleted) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        // Send completion message
        if (!isCompleted) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "analysis-complete",
                message: "Multi-agent analysis completed",
              })}\n\n`,
            ),
          )
        }
      } catch (error) {
        console.error("Stream error:", error)
        if (!isCompleted) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Analysis failed",
              })}\n\n`,
            ),
          )
        }
      } finally {
        clearTimeout(timeout)
        isCompleted = true
        controller.close()
      }
    },
    
    cancel() {
      isCompleted = true
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
