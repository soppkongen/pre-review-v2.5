import { NextRequest, NextResponse } from 'next/server'
import { initializeWeaviateSchema, searchPhysicsKnowledge } from '@/lib/weaviate'
import { RealOpenAIAgents } from '@/lib/real-openai-agents'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    // Initialize Weaviate schema if needed
    await initializeWeaviateSchema()
    
    const body = await request.json()
    const { message, conversationId, analysisType = 'theory_development' } = body
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Search for relevant physics knowledge
    const relevantKnowledge = await searchPhysicsKnowledge(message, 8)
    
    // Use real OpenAI agent for theory lab chat
    const analysisResult = await RealOpenAIAgents.theoryLabChat(message, relevantKnowledge)
    
    // Format response for chat interface
    const response = {
      id: uuidv4(),
      role: 'assistant',
      content: analysisResult.response,
      agent: 'Research Coordinator',
      timestamp: new Date(),
      metadata: {
        confidence: analysisResult.confidence,
        relevantSources: relevantKnowledge.length,
        domains: analysisResult.domains
      }
    }
    
    return NextResponse.json({
      success: true,
      response,
      analysisDetails: {
        relevantKnowledge: relevantKnowledge.length,
        domains: analysisResult.domains,
        confidence: analysisResult.confidence
      }
    })
    
  } catch (error) {
    console.error('Theory Lab chat error:', error)
    return NextResponse.json(
      { 
        error: 'Chat analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      conversationId,
      messages: [],
      status: 'active'
    })
    
  } catch (error) {
    console.error('Error retrieving conversation:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve conversation' },
      { status: 500 }
    )
  }
}

