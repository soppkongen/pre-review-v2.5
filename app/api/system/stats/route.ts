import { NextResponse } from "next/server"
import { KnowledgeBaseService } from "@/lib/services/knowledge-base"
import { documentProcessor } from "@/lib/services/document-processor"
import { getWeaviateClient } from "@/lib/weaviate"

const knowledgeService = new KnowledgeBaseService()

export async function GET() {
  try {
    // Get knowledge base stats
    const knowledgeStats = await knowledgeService.getStats()

    // Get document stats
    const documents = await documentProcessor.listDocuments(100)
    const documentStats = {
      totalDocuments: documents.length,
      recentUploads: documents.filter((doc) => Date.now() - doc.metadata.uploadedAt.getTime() < 7 * 24 * 60 * 60 * 1000)
        .length,
      fileTypes: documents.reduce(
        (acc, doc) => {
          const type = doc.metadata.fileType.split("/")[1] || "unknown"
          acc[type] = (acc[type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    // Get analysis stats
    const client = getWeaviateClient()
    let analysisStats = {
      totalAnalyses: 0,
      recentAnalyses: 0,
      agentDistribution: {} as Record<string, number>,
      averageScore: 0,
    }

    try {
      const analysisResult = await client.graphql
        .get()
        .withClassName("AnalysisResult")
        .withFields("agentType score createdAt")
        .withLimit(1000)
        .do()

      const analyses = analysisResult.data?.Get?.AnalysisResult || []
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      analysisStats = {
        totalAnalyses: analyses.length,
        recentAnalyses: analyses.filter((a: any) => new Date(a.createdAt) > oneWeekAgo).length,
        agentDistribution: analyses.reduce((acc: Record<string, number>, analysis: any) => {
          acc[analysis.agentType] = (acc[analysis.agentType] || 0) + 1
          return acc
        }, {}),
        averageScore:
          analyses.length > 0 ? analyses.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / analyses.length : 0,
      }
    } catch (error) {
      console.warn("Could not fetch analysis stats:", error)
    }

    // System performance stats
    const systemStats = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      stats: {
        knowledge: knowledgeStats,
        documents: documentStats,
        analysis: analysisStats,
        system: systemStats,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("System stats API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve system statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
