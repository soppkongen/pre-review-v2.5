import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const weaviateUrl = process.env.WEAVIATE_URL
    const apiKey = process.env.WEAVIATE_API_KEY

    console.log('Testing connection to:', weaviateUrl)
    
    // Test basic connectivity
    const response = await fetch(`${weaviateUrl}/v1/meta`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log('Response status:', response.status)
    console.log('Response text:', responseText)

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: response.status,
        statusText: response.statusText,
        response: responseText
      })
    }

    const data = JSON.parse(responseText)
    
    return NextResponse.json({
      success: true,
      status: response.status,
      meta: data
    })

  } catch (error) {
    console.error('Connection error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
  }
}
