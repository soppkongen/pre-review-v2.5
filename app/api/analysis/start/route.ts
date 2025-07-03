import { NextRequest, NextResponse } from 'next/server'
import { RealAnalysisOrchestrator } from '@/lib/real-analysis-orchestrator'
import { getAnalysisResult } from '@/lib/kv-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID required' },
        { status: 400 }
      )
    }

    console.log('[DEBUG] Environment check:', {
      KV_URL: !!process.env.KV_REST_API_URL,
      KV_TOKEN: !!process.env.KV_REST_API_TOKEN
    })

    // Retrieve analysis results from KV storage
    console.log('[DEBUG] Attempting to fetch analysis:', analysisId)
    const result = await getAnalysisResult(analysisId)
    console.log('[DEBUG] Result found:', !!result)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Analysis not found or expired' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[DEBUG] Error in analysis fetch:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    )
  }
}

// ... rest of the file stays the same ...
