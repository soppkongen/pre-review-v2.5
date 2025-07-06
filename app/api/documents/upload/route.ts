console.log('ENV:', process.env);

import { type NextRequest, NextResponse } from "next/server"
import { RealDocumentProcessor } from "@/lib/real-document-processor"
import { getWeaviateClient } from "@/lib/weaviate"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const field = (formData.get("field") as string) || "physics"
    const keywords = (formData.get("keywords") as string) || ""

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const processor = RealDocumentProcessor

    // Process the document
    const processed = await processor.processFile(file)

    // Extract authors from content (simple heuristic)
    const authors = extractAuthors(processed.getContent())

    // Extract abstract (simple heuristic)
    const abstract = extractAbstract(processed.getContent())

    // Store in Weaviate
    const client = await getWeaviateClient();
    if (!client) {
      return NextResponse.json({ error: "Failed to connect to Weaviate" }, { status: 500 });
    }
    const result = await (client as any).data
      .creator()
      .withClassName("ResearchPaper")
      .withProperties({
        title: processed.getTitle(),
        authors: authors,
        abstract: abstract,
        content: processed.getContent(),
        field: field,
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
        uploadDate: new Date().toISOString(),
        fileType: processed.metadata.fileType,
      })
      .do();

    return NextResponse.json({
      success: true,
      paperId: result.id,
      title: processed.getTitle(),
      metadata: processed.metadata,
      message: "Document uploaded and processed successfully",
    });
  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json({ error: "Failed to upload and process document" }, { status: 500 })
  }
}

function extractAuthors(content: string): string[] {
  // Simple heuristic to extract authors
  const lines = content.split("\n").slice(0, 20)

  for (const line of lines) {
    const trimmed = line.trim()
    // Look for patterns like "Author1, Author2" or "By Author Name"
    if (
      trimmed.toLowerCase().includes("author") ||
      (trimmed.includes(",") && trimmed.length < 200 && trimmed.length > 10)
    ) {
      const authors = trimmed
        .replace(/^(by|author[s]?:?)\s*/i, "")
        .split(/[,&]/)
        .map((a) => a.trim())
        .filter((a) => a.length > 2 && a.length < 50)

      if (authors.length > 0 && authors.length < 10) {
        return authors
      }
    }
  }

  return ["Unknown Author"]
}

function extractAbstract(content: string): string {
  // Look for abstract section
  const abstractMatch = content.match(/abstract[:\s]*(.*?)(?:\n\s*\n|\n\s*(?:introduction|keywords|1\.|i\.))/i)

  if (abstractMatch) {
    return abstractMatch[1].trim().substring(0, 1000)
  }

  // Fallback: use first paragraph
  const paragraphs = content.split("\n\n")
  for (const paragraph of paragraphs.slice(0, 5)) {
    const trimmed = paragraph.trim()
    if (trimmed.length > 100 && trimmed.length < 1000) {
      return trimmed
    }
  }

  return content.substring(0, 500) + "..."
}

export async function GET() {
  // Use static values for supportedFileTypes and maxFileSize
  return NextResponse.json({
    supportedFileTypes: ['pdf', 'txt', 'docx'],
    maxFileSize: 10 * 1024 * 1024,
    maxFileSizeMB: 10,
  })
}
