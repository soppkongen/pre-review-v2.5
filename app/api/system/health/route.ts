import { NextResponse } from "next/server"
import { getWeaviateClient } from "@/lib/weaviate"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function GET() {
  const healthChecks = {
    weaviate: false,
    openai: false,
    system: true,
    timestamp: new Date().toISOString(),
  }

  let overallStatus = "healthy"

  try {
    // Test Weaviate connection
    const client = getWeaviateClient()
    await client.misc.liveChecker().do()
    healthChecks.weaviate = true
  } catch (error) {
    console.error("Weaviate health check failed:", error)
    overallStatus = "degraded"
  }

  try {
    // Test OpenAI connection with a simple request
    await generateText({
      model: openai("gpt-4o"),
      prompt: "Say 'OK' if you can respond.",
      maxTokens: 5,
    })
    healthChecks.openai = true
  } catch (error) {
    console.error("OpenAI health check failed:", error)
    overallStatus = "degraded"
  }

  // System health (basic checks)
  const memoryUsage = process.memoryUsage()
  const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100

  if (memoryUsagePercent > 90) {
    overallStatus = "degraded"
    healthChecks.system = false
  }

  const statusCode = overallStatus === "healthy" ? 200 : 503

  return NextResponse.json(
    {
      status: overallStatus,
      checks: healthChecks,
      details: {
        uptime: process.uptime(),
        memoryUsage: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percentage: Math.round(memoryUsagePercent),
        },
        nodeVersion: process.version,
        platform: process.platform,
      },
      timestamp: healthChecks.timestamp,
    },
    { status: statusCode },
  )
}
