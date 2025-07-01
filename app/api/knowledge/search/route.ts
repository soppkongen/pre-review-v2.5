import { NextRequest, NextResponse } from 'next/server'
import { getWeaviateClient } from '@/lib/weaviate'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    console.log('Using existing Weaviate client from lib/weaviate.ts')
    const client = getWeaviateClient()

    // Query the actual PhysicsChunk class that contains your data
    const result = await client.graphql
      .get()
      .withClassName('PhysicsChunk')
      .withFields('chunkId content sourceDocument domain subdomain concepts difficultyLevel')
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do()

    console.log('Weaviate result:', JSON.stringify(result, null, 2))

    const results = result.data?.Get?.PhysicsChunk || []

    return NextResponse.json({
      success: true,
      results: results.map((item: any) => ({
        title: item.domain || item.subdomain || 'Physics Concept',
        content: item.content || '',
        source: item.sourceDocument || 'Knowledge Base',
        confidence: 0.8,
        concepts: item.concepts || [],
        difficulty: item.difficultyLevel || 'Unknown'
      }))
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
