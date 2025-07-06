import { NextResponse } from "next/server";
import { getWeaviateClient } from "@/lib/weaviate";
import { KnowledgeBaseService } from "@/lib/services/knowledge-base";
export async function GET() {
    try {
        const client = await getWeaviateClient();
        if (!client)
            throw new Error("Weaviate client not available");
        const knowledgeBase = new KnowledgeBaseService();
        // Robust: always return a valid stats structure
        let knowledgeStats = { totalConcepts: 0, fieldDistribution: {}, difficultyDistribution: {} };
        if (typeof knowledgeBase.getKnowledgeStats === 'function') {
            try {
                const realStats = await knowledgeBase.getKnowledgeStats();
                if (realStats && typeof realStats === 'object') {
                    knowledgeStats = { ...knowledgeStats, ...realStats };
                }
            }
            catch (e) {
                // Ignore errors, use empty stats
            }
        }
        // Get research papers count
        let totalPapers = 0;
        let totalAnalyses = 0;
        let recentUploads = 0;
        try {
            const papersResult = await client.graphql
                .aggregate()
                .withClassName("ResearchPaper")
                .withFields("meta { count }")
                .do();
            totalPapers = papersResult.data?.Aggregate?.ResearchPaper?.[0]?.meta?.count || 0;
            const analysisResult = await client.graphql
                .aggregate()
                .withClassName("AnalysisResult")
                .withFields("meta { count }")
                .do();
            totalAnalyses = analysisResult.data?.Aggregate?.AnalysisResult?.[0]?.meta?.count || 0;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const recentPapers = await client.graphql
                .get()
                .withClassName("ResearchPaper")
                .withFields("uploadDate")
                .withWhere({
                path: ["uploadDate"],
                operator: "GreaterThan",
                valueText: yesterday.toISOString(),
            })
                .do();
            recentUploads = recentPapers.data?.Get?.ResearchPaper?.length || 0;
        }
        catch (e) {
            // If any error, just use zeros
        }
        return NextResponse.json({
            knowledge: knowledgeStats,
            papers: {
                total: totalPapers,
                recentUploads,
            },
            analyses: {
                total: totalAnalyses,
            },
            system: {
                status: "operational",
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        console.error("System stats error:", error);
        // Always return a valid structure, even on error
        return NextResponse.json({
            knowledge: { totalConcepts: 0, fieldDistribution: {}, difficultyDistribution: {} },
            papers: { total: 0, recentUploads: 0 },
            analyses: { total: 0 },
            system: {
                status: "error",
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            },
            error: "Failed to fetch system stats"
        }, { status: 200 });
    }
}
