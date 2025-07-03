import { NextRequest, NextResponse } from 'next/server'
import { RealAnalysisOrchestrator } from '@/lib/real-analysis-orchestrator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const summary = formData.get('summary') as string
    const reviewMode = formData.get('reviewMode') as string
    
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

    // Start real analysis processing
    const analysisId = await RealAnalysisOrchestrator.analyzeDocument(
      file,
      summary || undefined,
      reviewMode || 'full'
    )
    
    return NextResponse.json({
      success: true,
      analysisId,
      message: 'Analysis started successfully. Processing in background.'
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
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
  try {
    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get('analysisId')
    
    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID required' },
        { status: 400 }
      )
    }
    
    // Get real analysis result
    const result = await RealAnalysisOrchestrator.getAnalysisResult(analysisId)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Analysis result retrieved successfully'
    })
    
  } catch (error) {
    console.error('Error retrieving analysis:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    )
  }
}

