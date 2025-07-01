import { NextResponse } from 'next/server'

export async function GET() {
  const weaviateUrl = process.env.WEAVIATE_URL
  const apiKey = process.env.WEAVIATE_API_KEY

  try {
    // Try just the base URL
    const response = await fetch(weaviateUrl!, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    const text = await response.text()
    
    return NextResponse.json({
      baseUrl: weaviateUrl,
      status: response.status,
      response: text.substring(0, 500) // First 500 chars
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
