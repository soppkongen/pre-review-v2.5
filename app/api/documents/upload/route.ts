import { type NextRequest, NextResponse } from "next/server"
import { documentProcessor } from "@/lib/services/document-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/x-tex",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    const allowedExtensions = [".txt", ".pdf", ".tex", ".docx"]

    const isValidType =
      allowedTypes.includes(file.type) || allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!isValidType) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, TXT, TEX, or DOCX files." },
        { status: 400 },
      )
    }

    // Process the document
    const processedDocument = await documentProcessor.processDocument(file)

    return NextResponse.json({
      success: true,
      document: {
        id: processedDocument.id,
        title: processedDocument.title,
        abstract: processedDocument.abstract,
        authors: processedDocument.authors,
        keywords: processedDocument.keywords,
        metadata: processedDocument.metadata,
      },
      message: "Document uploaded and processed successfully",
    })
  } catch (error) {
    console.error("Document upload API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload and process document",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (id) {
      // Get specific document
      const document = await documentProcessor.getDocumentById(id)
      if (!document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        document,
      })
    } else {
      // List documents
      const documents = await documentProcessor.listDocuments(limit)

      return NextResponse.json({
        success: true,
        documents,
        total: documents.length,
      })
    }
  } catch (error) {
    console.error("Get documents API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve documents",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
