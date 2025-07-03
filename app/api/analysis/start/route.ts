import { NextRequest, NextResponse } from 'next/server'
import { RealAnalysisOrchestrator } from '@/lib/real-analysis-orchestrator'
import { AnalysisStorage } from '@/lib/kv-storage'

export const config = {
  api: {
    bodyParser: false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Make sure the content type is multipart/form-data
    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type. Must be multipart/form-data' },
        { status: 415 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const summary = formData.get('summary') as string
    const reviewMode = formData.get('reviewMode') as string
    
    console.log('[DEBUG] POST request received:', {
      hasFile: !!file,
      fileType: file?.type,
      fileName: file?.name,
      fileSize: file?.size,
      hasSummary: !!summary,
      hasReviewMode: !!reviewMode,
      contentType: request.headers.get('content-type')
    })

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Test Redis connection before proceeding
    try {
      await AnalysisStorage.ping()
    } catch (error) {
      console.error('Redis connection test failed:', error)
      return NextResponse.json(
        { error: 'Storage system unavailable' },
        { status: 503 }
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
    // Ensure we always return a response
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Always return a response
  return NextResponse.json({ status: 'ok' })
}
