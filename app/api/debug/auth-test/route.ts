import { NextResponse } from 'next/server'

export async function GET() {
  const weaviateUrl = process.env.WEAVIATE_URL
  const apiKey = process.env.WEAVIATE_API_KEY

  const tests = [
    {
      name: 'Bearer Token',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'X-OpenAI-Api-Key',
      headers: {
        'X-OpenAI-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Authorization without Bearer',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    }
  ]

  const results = []

  for (const test of tests) {
    try {
      const response = await fetch(`${weaviateUrl}/v1/objects`, {
        method: 'GET',
        headers: test.headers
      })
      
      results.push({
        method: test.name,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      })
    } catch (error) {
      results.push({
        method: test.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return NextResponse.json({ results })
}
