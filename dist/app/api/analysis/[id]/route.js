import { NextResponse } from 'next/server';
import { getAnalysisResult } from '@/lib/kv-storage';
export async function GET(request, { params }) {
    const { id } = await params;
    console.log(`[API] GET /api/analysis/${id} - Request received`);
    try {
        const result = await getAnalysisResult(id);
        console.log(`[API] Retrieved result:`, {
            status: result?.status,
            agentCount: result?.agentResults?.length ?? 0,
            error: result?.error
        });
        if (!result) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
        }
        // Build a “safe” response using the exact fields you persist
        const safe = {
            analysisId: result.analysisId,
            documentName: result.documentName,
            reviewMode: result.reviewMode,
            timestamp: result.timestamp,
            status: result.status,
            error: result.error || '',
            overallScore: result.overallScore ?? 0,
            confidence: result.confidence ?? 0,
            summary: result.summary || '',
            keyFindings: result.keyFindings || [],
            recommendations: result.recommendations || [],
            agentResults: result.agentResults || [],
            // Flatten your detailedAnalysis object into per-category entries
            detailedAnalysis: {
                // e.g. detailedAnalysis["Theoretical Physicist"]…
                ...result.detailedAnalysis
            }
        };
        console.log(`[API] Returning safe result with status: ${safe.status}`);
        return NextResponse.json(safe, {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
        });
    }
    catch (err) {
        console.error('[API] Error retrieving analysis:', err);
        return NextResponse.json({ error: 'Failed to retrieve analysis', details: err instanceof Error ? err.message : 'Unknown' }, { status: 500 });
    }
}
