import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasWeaviateUrl: !!process.env.WEAVIATE_URL,
    hasApiKey: !!process.env.WEAVIATE_API_KEY,
    weaviateUrlPrefix: process.env.WEAVIATE_URL?.substring(0, 20) + '...',
    apiKeyPrefix: process.env.WEAVIATE_API_KEY?.substring(0, 10) + '...'
  })
}
