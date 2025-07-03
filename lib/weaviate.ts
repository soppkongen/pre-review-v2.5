import weaviate, { type WeaviateClient, ApiKey } from "weaviate-ts-client"

let client: WeaviateClient | null = null

export function getWeaviateClient(): WeaviateClient {
  if (!client) {
    if (!process.env.WEAVIATE_API_KEY || !process.env.WEAVIATE_URL) {
      throw new Error(
        "Weaviate configuration missing. Please set WEAVIATE_API_KEY and WEAVIATE_URL environment variables.",
      )
    }

    const url = new URL(process.env.WEAVIATE_URL)
    
    client = weaviate.client({
      scheme: url.protocol.replace(':', ''),
      host: url.host,
      apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
      headers: { "X-OpenAI-Api-Key": process.env.OPENAI_API_KEY || "" },
    })
  }
  return client
}

export interface PhysicsChunk {
  id?: string
  chunkId: string
  sourceDocument: string
  content: string
  domain: string
  subdomain: string
  contentType: string
  difficultyLevel: string
  priority: number
  hasMathematicalContent: boolean
  equations?: string[]
  concepts?: string[]
  prerequisites?: string[]
  chapter?: string
  section?: string
  pageRange?: string
  extractionMethod: string
}

export interface ChunkRelationship {
  id?: string
  fromChunkId: string
  toChunkId: string
  relationshipType: string
  strength: number
  description: string
}

export interface ResearchPaper {
  id?: string
  title: string
  authors: string[]
  abstract: string
  content: string
  field: string
  keywords: string[]
  uploadDate: string
  fileType: string
}

export interface AnalysisResult {
  id?: string
  paperId: string
  analysisType: string
  result: string
  confidence: number
  timestamp: string
  agentId: string
}

export async function initializeWeaviateSchema() {
  const client = getWeaviateClient()

  try {
    // Check if classes already exist
    const schema = await client.schema.getter().do()
    const existingClasses = schema.classes?.map((c) => c.class) || []

    // Create PhysicsChunk class if it doesn't exist
    if (!existingClasses.includes("PhysicsChunk")) {
      await client.schema
        .classCreator()
        .withClass({
          class: "PhysicsChunk",
          description: "A chunk of physics knowledge with rich metadata",
          vectorizer: "text2vec-openai",
          moduleConfig: {
            "text2vec-openai": {
              model: "text-embedding-3-small",
              vectorizeClassName: true,
            },
          },
          properties: [
            {
              name: "chunkId",
              dataType: ["text"],
              description: "Unique identifier for the chunk",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "sourceDocument",
              dataType: ["text"],
              description: "Original source document filename",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "content",
              dataType: ["text"],
              description: "The actual text content",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "domain",
              dataType: ["text"],
              description: "Primary physics domain",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "subdomain",
              dataType: ["text"],
              description: "Physics subdomain",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "contentType",
              dataType: ["text"],
              description: "Type of content",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "difficultyLevel",
              dataType: ["text"],
              description: "Difficulty level",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "priority",
              dataType: ["int"],
              description: "Content priority ranking",
              indexFilterable: true,
            },
            {
              name: "hasMathematicalContent",
              dataType: ["boolean"],
              description: "Contains mathematical equations",
              indexFilterable: true,
            },
            {
              name: "equations",
              dataType: ["text[]"],
              description: "Mathematical equations",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "concepts",
              dataType: ["text[]"],
              description: "Physics concepts covered",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "prerequisites",
              dataType: ["text[]"],
              description: "Required prerequisite knowledge",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "chapter",
              dataType: ["text"],
              description: "Chapter information",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "section",
              dataType: ["text"],
              description: "Section information",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "pageRange",
              dataType: ["text"],
              description: "Page range in source",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "extractionMethod",
              dataType: ["text"],
              description: "Content extraction method",
              indexFilterable: true,
              indexSearchable: true,
            },
          ],
        })
        .do()
    }

    // Create ChunkRelationship class if it doesn't exist
    if (!existingClasses.includes("ChunkRelationship")) {
      await client.schema
        .classCreator()
        .withClass({
          class: "ChunkRelationship",
          description: "Relationships between physics chunks",
          vectorizer: "none",
          properties: [
            {
              name: "fromChunkId",
              dataType: ["text"],
              description: "Source chunk ID",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "toChunkId",
              dataType: ["text"],
              description: "Target chunk ID",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "relationshipType",
              dataType: ["text"],
              description: "Type of relationship",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "strength",
              dataType: ["number"],
              description: "Relationship strength",
              indexFilterable: true,
            },
            {
              name: "description",
              dataType: ["text"],
              description: "Relationship description",
              indexFilterable: true,
              indexSearchable: true,
            },
          ],
        })
        .do()
    }

    // Create ResearchPaper class if it doesn't exist
    if (!existingClasses.includes("ResearchPaper")) {
      await client.schema
        .classCreator()
        .withClass({
          class: "ResearchPaper",
          description: "Research papers for analysis",
          vectorizer: "text2vec-openai",
          moduleConfig: {
            "text2vec-openai": {
              model: "text-embedding-3-small",
              vectorizeClassName: true,
            },
          },
          properties: [
            {
              name: "title",
              dataType: ["text"],
              description: "Paper title",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "authors",
              dataType: ["text[]"],
              description: "Paper authors",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "abstract",
              dataType: ["text"],
              description: "Paper abstract",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "content",
              dataType: ["text"],
              description: "Full paper content",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "field",
              dataType: ["text"],
              description: "Research field",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "keywords",
              dataType: ["text[]"],
              description: "Paper keywords",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "uploadDate",
              dataType: ["text"],
              description: "Upload timestamp",
              indexFilterable: true,
            },
            {
              name: "fileType",
              dataType: ["text"],
              description: "File type (pdf, txt, etc.)",
              indexFilterable: true,
            },
          ],
        })
        .do()
    }

    // Create AnalysisResult class if it doesn't exist
    if (!existingClasses.includes("AnalysisResult")) {
      await client.schema
        .classCreator()
        .withClass({
          class: "AnalysisResult",
          description: "Multi-agent analysis results",
          vectorizer: "text2vec-openai",
          moduleConfig: {
            "text2vec-openai": {
              model: "text-embedding-3-small",
              vectorizeClassName: true,
            },
          },
          properties: [
            {
              name: "paperId",
              dataType: ["text"],
              description: "Reference to analyzed paper",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "analysisType",
              dataType: ["text"],
              description: "Type of analysis performed",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "result",
              dataType: ["text"],
              description: "Analysis result content",
              indexFilterable: true,
              indexSearchable: true,
            },
            {
              name: "confidence",
              dataType: ["number"],
              description: "Confidence score (0-1)",
              indexFilterable: true,
            },
            {
              name: "timestamp",
              dataType: ["text"],
              description: "Analysis timestamp",
              indexFilterable: true,
            },
            {
              name: "agentId",
              dataType: ["text"],
              description: "ID of the agent that performed analysis",
              indexFilterable: true,
              indexSearchable: true,
            },
          ],
        })
        .do()
    }

    console.log("Weaviate schema initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing Weaviate schema:", error)
    throw error
  }
}

// Query functions for physics knowledge
export async function searchPhysicsKnowledge(query: string, limit: number = 10) {
  const client = getWeaviateClient()
  
  try {
    const result = await client.graphql
      .get()
      .withClassName("PhysicsChunk")
      .withFields("chunkId content domain subdomain concepts equations difficultyLevel")
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do()
    
    return result.data.Get.PhysicsChunk || []
  } catch (error) {
    console.error("Error searching physics knowledge:", error)
    throw error
  }
}

// Store physics chunk
export async function storePhysicsChunk(chunk: PhysicsChunk) {
  const client = getWeaviateClient()
  
  try {
    const result = await client.data
      .creator()
      .withClassName("PhysicsChunk")
      .withProperties(chunk)
      .do()
    
    return result
  } catch (error) {
    console.error("Error storing physics chunk:", error)
    throw error
  }
}

// Store research paper
export async function storeResearchPaper(paper: ResearchPaper) {
  const client = getWeaviateClient()
  
  try {
    const result = await client.data
      .creator()
      .withClassName("ResearchPaper")
      .withProperties(paper)
      .do()
    
    return result
  } catch (error) {
    console.error("Error storing research paper:", error)
    throw error
  }
}

// Store analysis result
export async function storeAnalysisResult(analysis: AnalysisResult) {
  const client = getWeaviateClient()
  
  try {
    const result = await client.data
      .creator()
      .withClassName("AnalysisResult")
      .withProperties(analysis)
      .do()
    
    return result
  } catch (error) {
    console.error("Error storing analysis result:", error)
    throw error
  }
}

