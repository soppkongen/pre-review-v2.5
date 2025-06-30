import weaviate, { type WeaviateClient, ApiKey } from "weaviate-ts-client"

let client: WeaviateClient | null = null

export function getWeaviateClient(): WeaviateClient {
  if (!client) {
    if (!process.env.WEAVIATE_API_KEY || !process.env.REST_ENDPOINT_URL) {
      throw new Error(
        "Missing Weaviate configuration. Please set WEAVIATE_API_KEY and REST_ENDPOINT_URL environment variables.",
      )
    }

    client = weaviate.client({
      scheme: "https",
      host: process.env.REST_ENDPOINT_URL.replace("https://", ""),
      apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
      headers: { "X-OpenAI-Api-Key": process.env.OPENAI_API_KEY || "" },
    })
  }
  return client
}

export async function initializeSchema() {
  const client = getWeaviateClient()

  // Check if classes already exist
  const schema = await client.schema.getter().do()
  const existingClasses = schema.classes?.map((c: any) => c.class) || []

  // PhysicsKnowledge class
  if (!existingClasses.includes("PhysicsKnowledge")) {
    await client.schema
      .classCreator()
      .withClass({
        class: "PhysicsKnowledge",
        description: "Physics concepts, equations, and explanations",
        vectorizer: "text2vec-openai",
        moduleConfig: {
          "text2vec-openai": {
            model: "ada",
            modelVersion: "002",
            type: "text",
          },
        },
        properties: [
          {
            name: "content",
            dataType: ["text"],
            description: "The main content or explanation",
          },
          {
            name: "title",
            dataType: ["string"],
            description: "Title or heading of the concept",
          },
          {
            name: "topic",
            dataType: ["string"],
            description: "Physics topic (e.g., quantum mechanics, thermodynamics)",
          },
          {
            name: "difficulty",
            dataType: ["string"],
            description: "Difficulty level: beginner, intermediate, advanced",
          },
          {
            name: "equations",
            dataType: ["string[]"],
            description: "Mathematical equations related to this concept",
          },
          {
            name: "concepts",
            dataType: ["string[]"],
            description: "Key physics concepts covered",
          },
          {
            name: "source",
            dataType: ["string"],
            description: "Source textbook or reference",
          },
          {
            name: "chapter",
            dataType: ["string"],
            description: "Chapter or section reference",
          },
        ],
      })
      .do()
  }

  // ResearchPaper class
  if (!existingClasses.includes("ResearchPaper")) {
    await client.schema
      .classCreator()
      .withClass({
        class: "ResearchPaper",
        description: "Uploaded research papers for analysis",
        vectorizer: "text2vec-openai",
        properties: [
          {
            name: "title",
            dataType: ["string"],
            description: "Paper title",
          },
          {
            name: "content",
            dataType: ["text"],
            description: "Full paper content",
          },
          {
            name: "abstract",
            dataType: ["text"],
            description: "Paper abstract",
          },
          {
            name: "authors",
            dataType: ["string[]"],
            description: "Paper authors",
          },
          {
            name: "uploadedAt",
            dataType: ["date"],
            description: "Upload timestamp",
          },
          {
            name: "fileType",
            dataType: ["string"],
            description: "File type (pdf, tex, docx)",
          },
        ],
      })
      .do()
  }

  // AnalysisResult class
  if (!existingClasses.includes("AnalysisResult")) {
    await client.schema
      .classCreator()
      .withClass({
        class: "AnalysisResult",
        description: "Results from multi-agent paper analysis",
        vectorizer: "text2vec-openai",
        properties: [
          {
            name: "paperId",
            dataType: ["string"],
            description: "Reference to the analyzed paper",
          },
          {
            name: "agentType",
            dataType: ["string"],
            description: "Type of analysis agent",
          },
          {
            name: "analysis",
            dataType: ["text"],
            description: "Analysis content",
          },
          {
            name: "score",
            dataType: ["number"],
            description: "Analysis score or rating",
          },
          {
            name: "completedAt",
            dataType: ["date"],
            description: "Analysis completion timestamp",
          },
        ],
      })
      .do()
  }

  console.log("✅ Weaviate schema initialized successfully")
}
