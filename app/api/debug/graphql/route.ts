import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const weaviateUrl = process.env.WEAVIATE_URL
    const apiKey = process.env.WEAVIATE_API_KEY

    // Test with a simple GraphQL query to list classes
    const query = {
      query: `{
        Get {
          __schema {
            types {
              name
            }
          }
        }
      }`
    }

    const response = await fetch(`${weaviateUrl}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    })

    const responseText = await response.text()
    console.log('GraphQL Response:', response.status, responseText)

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      response: responseText
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
