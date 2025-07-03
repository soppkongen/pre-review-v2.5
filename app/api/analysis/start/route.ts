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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const summary = formData.get('summary') as string
    const reviewMode = formData.get('reviewMode') as string
    
    console.log('[DEBUG] POST request received:', {
      hasFile: !!file,
      hasSummary: !!summary,
      hasReviewMode: !!reviewMode
    })

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
    
    const isValidType = allowedTypes.includes(file.type) || file.name.endsWith('.tex')
    
    if (!isValidType) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or LaTeX files.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    console.log('[DEBUG] File validation passed, starting analysis...')
    
    // Process the file and start analysis
    const analysisId = await RealAnalysisOrchestrator.analyzeDocument(file, summary, reviewMode)
    console.log('[DEBUG] Analysis started with ID:', analysisId)
    
    return NextResponse.json({ analysisId })
  } catch (error) {
    console.error('[DEBUG] Error processing analysis:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
