import { NextRequest, NextResponse } from 'next/server'
import { getAnalysisResult } from '@/lib/kv-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[API] GET /api/analysis/${params.id} - Request received`)
  
  try {
    console.log(`[API] Retrieving analysis result for ID: ${params.id}`)
    const result = await getAnalysisResult(params.id)
    
    console.log(`[API] Analysis result retrieved:`, {
      found: !!result,
      status: result?.status,
      hasError: !!result?.error,
      analysisId: result?.analysisId
    })
    
    if (!result) {
      console.log(`[API] Analysis not found for ID: ${params.id}`)
      return NextResponse.json(
        { error: 'Analysis not found' },
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
    }
    
    // Patch: Fill missing fields with safe defaults
    const safeResult = {
      analysisId: result.analysisId || params.id,
      documentName: result.documentName || 'Unknown',
      analysisType: result.analysisType || result.reviewMode || 'standard',
      timestamp: result.timestamp || new Date().toISOString(),
      overallScore: typeof result.overallScore === 'number' ? result.overallScore : 0,
      confidence: typeof result.confidence === 'number' ? result.confidence : 0,
      summary: result.summary || result.executiveSummary || '',
      keyFindings: Array.isArray(result.keyFindings) ? result.keyFindings : [],
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : (Array.isArray(result.improvements) ? result.improvements : []),
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      agentResults: Array.isArray(result.agentAnalysis) ? result.agentAnalysis : [],
      detailedAnalysis: {
        epistemicEvaluation: {
          score: result.detailedAnalysis?.epistemicEvaluation?.score ?? 0,
          details: result.detailedAnalysis?.epistemicEvaluation?.description || 'No details.',
          issues: Array.isArray(result.detailedAnalysis?.epistemicEvaluation?.issues) ? result.detailedAnalysis.epistemicEvaluation.issues : [],
        },
        methodologyAssessment: {
          score: result.detailedAnalysis?.methodologyAssessment?.score ?? 0,
          details: result.detailedAnalysis?.methodologyAssessment?.description || 'No details.',
          strengths: Array.isArray(result.detailedAnalysis?.methodologyAssessment?.strengths) ? result.detailedAnalysis.methodologyAssessment.strengths : [],
          concerns: Array.isArray(result.detailedAnalysis?.methodologyAssessment?.concerns) ? result.detailedAnalysis.methodologyAssessment.concerns : [],
        },
        paradigmIndependence: {
          score: result.detailedAnalysis?.paradigmIndependence?.score ?? 0,
          details: result.detailedAnalysis?.paradigmIndependence?.description || 'No details.',
          biases: Array.isArray(result.detailedAnalysis?.paradigmIndependence?.biases) ? result.detailedAnalysis.paradigmIndependence.biases : [],
        },
        reproducibility: {
          score: result.detailedAnalysis?.reproducibility?.score ?? 0,
          details: result.detailedAnalysis?.reproducibility?.description || 'No details.',
          factors: Array.isArray(result.detailedAnalysis?.reproducibility?.factors) ? result.detailedAnalysis.reproducibility.factors : [],
        },
      },
      status: result.status || 'completed',
      error: result.error || '',
    }

    console.log(`[API] Returning safe result with status: ${safeResult.status}`)
    
    return NextResponse.json(safeResult, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      }
    })
  } catch (error) {
    console.error('[API] Error retrieving analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}
