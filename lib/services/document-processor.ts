import { getWeaviateClient } from "../weaviate"

export interface DocumentMetadata {
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: Date
}

export interface ProcessedDocument {
  id: string
  title: string
  content: string
  abstract?: string
  authors?: string[]
  keywords?: string[]
  metadata: DocumentMetadata
}

export class DocumentProcessor {
  private client = getWeaviateClient()

  async processDocument(file: File): Promise<ProcessedDocument> {
    try {
      // Extract text content based on file type
      const content = await this.extractTextContent(file)

      // Extract metadata and structure
      const { title, abstract, authors, keywords } = await this.extractDocumentStructure(content)

      const metadata: DocumentMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || this.getFileTypeFromName(file.name),
        uploadedAt: new Date(),
      }

      // Store in Weaviate
      const result = await this.client.data
        .creator()
        .withClassName("ResearchPaper")
        .withProperties({
          title,
          content,
          abstract: abstract || "",
          authors: authors || [],
          keywords: keywords || [],
          uploadedAt: metadata.uploadedAt.toISOString(),
          fileType: metadata.fileType,
        })
        .do()

      return {
        id: result.id,
        title,
        content,
        abstract,
        authors,
        keywords,
        metadata,
      }
    } catch (error) {
      console.error("Document processing error:", error)
      throw new Error("Failed to process document")
    }
  }

  private async extractTextContent(file: File): Promise<string> {
    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        return await file.text()
      }

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // For PDF processing, we'd typically use a library like pdf-parse
        // For now, return a placeholder that indicates PDF processing is needed
        return `[PDF Content] - File: ${file.name}, Size: ${file.size} bytes. PDF text extraction would be implemented here using a PDF parsing library.`
      }

      if (file.name.endsWith(".tex")) {
        const content = await file.text()
        // Basic LaTeX processing - remove common commands
        return content
          .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "") // Remove LaTeX commands
          .replace(/\\[a-zA-Z]+/g, "") // Remove standalone commands
          .replace(/\{|\}/g, "") // Remove braces
          .replace(/\n\s*\n/g, "\n") // Clean up extra newlines
          .trim()
      }

      // Default to text extraction
      return await file.text()
    } catch (error) {
      console.error("Text extraction error:", error)
      throw new Error("Failed to extract text from document")
    }
  }

  private async extractDocumentStructure(content: string): Promise<{
    title: string
    abstract?: string
    authors?: string[]
    keywords?: string[]
  }> {
    try {
      // Simple heuristic-based extraction
      const lines = content.split("\n").map((line) => line.trim())

      // Extract title (usually the first non-empty line or after \title{})
      let title = "Untitled Document"
      const titleMatch = content.match(/\\title\{([^}]+)\}/) || content.match(/^(.+)$/m)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }

      // Extract abstract
      let abstract: string | undefined
      const abstractMatch =
        content.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/) ||
        content.match(/Abstract[:\s]+([\s\S]*?)(?:\n\s*\n|\n\s*[A-Z])/i)
      if (abstractMatch) {
        abstract = abstractMatch[1].trim()
      }

      // Extract authors
      let authors: string[] | undefined
      const authorMatch = content.match(/\\author\{([^}]+)\}/) || content.match(/Authors?[:\s]+([^\n]+)/i)
      if (authorMatch) {
        authors = authorMatch[1]
          .split(/[,&]/)
          .map((author) => author.trim())
          .filter((author) => author.length > 0)
      }

      // Extract keywords
      let keywords: string[] | undefined
      const keywordMatch = content.match(/Keywords?[:\s]+([^\n]+)/i) || content.match(/\\keywords\{([^}]+)\}/)
      if (keywordMatch) {
        keywords = keywordMatch[1]
          .split(/[,;]/)
          .map((keyword) => keyword.trim())
          .filter((keyword) => keyword.length > 0)
      }

      return {
        title,
        abstract,
        authors,
        keywords,
      }
    } catch (error) {
      console.error("Document structure extraction error:", error)
      return {
        title: "Document Processing Error",
      }
    }
  }

  private getFileTypeFromName(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return "application/pdf"
      case "tex":
        return "application/x-tex"
      case "txt":
        return "text/plain"
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      default:
        return "application/octet-stream"
    }
  }

  async getDocumentById(id: string): Promise<ProcessedDocument | null> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName("ResearchPaper")
        .withFields("title content abstract authors keywords uploadedAt fileType")
        .withWhere({
          path: ["id"],
          operator: "Equal",
          valueString: id,
        })
        .withAdditional(["id"])
        .do()

      const papers = result.data?.Get?.ResearchPaper || []
      if (papers.length === 0) return null

      const paper = papers[0]
      return {
        id: paper._additional.id,
        title: paper.title,
        content: paper.content,
        abstract: paper.abstract,
        authors: paper.authors,
        keywords: paper.keywords,
        metadata: {
          fileName: `${paper.title}.${paper.fileType?.split("/")[1] || "txt"}`,
          fileSize: paper.content?.length || 0,
          fileType: paper.fileType,
          uploadedAt: new Date(paper.uploadedAt),
        },
      }
    } catch (error) {
      console.error("Get document error:", error)
      return null
    }
  }

  async listDocuments(limit = 20): Promise<ProcessedDocument[]> {
    try {
      const result = await this.client.graphql
        .get()
        .withClassName("ResearchPaper")
        .withFields("title content abstract authors keywords uploadedAt fileType")
        .withLimit(limit)
        .withSort([{ path: ["uploadedAt"], order: "desc" }])
        .withAdditional(["id"])
        .do()

      const papers = result.data?.Get?.ResearchPaper || []

      return papers.map((paper: any) => ({
        id: paper._additional.id,
        title: paper.title,
        content: paper.content,
        abstract: paper.abstract,
        authors: paper.authors,
        keywords: paper.keywords,
        metadata: {
          fileName: `${paper.title}.${paper.fileType?.split("/")[1] || "txt"}`,
          fileSize: paper.content?.length || 0,
          fileType: paper.fileType,
          uploadedAt: new Date(paper.uploadedAt),
        },
      }))
    } catch (error) {
      console.error("List documents error:", error)
      return []
    }
  }
}

export const documentProcessor = new DocumentProcessor()
