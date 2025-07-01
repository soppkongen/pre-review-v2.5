import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const weaviateUrl = process.env.WEAVIATE_URL
    const apiKey = process.env.WEAVIATE_API_KEY

    const response = await fetch(`${weaviateUrl}/v1/schema`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    const schema = await response.json()
    
    return NextResponse.json({
      success: true,
      classes: schema.classes?.map((cls: any) => ({
        name: cls.className,
        description: cls.description,
        properties: cls.properties?.map((prop: any) => prop.name)
      })) || []
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schema', details: error }, { status: 500 })
  }
}
