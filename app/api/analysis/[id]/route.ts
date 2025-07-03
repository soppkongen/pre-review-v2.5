import { NextRequest, NextResponse } from 'next/server'
import { getAnalysisResult } from '@/lib/kv-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getAnalysisResult(params.id)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error retrieving analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
