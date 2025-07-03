- import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client'
+ import { initializeWeaviateClient } from '@/lib/weaviate'

console.log('🔍 WEAVIATE_URL:', process.env.WEAVIATE_URL);
console.log('🔍 WEAVIATE_API_KEY set:', !!process.env.WEAVIATE_API_KEY);
console.log('🔍 OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);
  
- let client: WeaviateClient | null = null
+ // No client variable needed here

- export function initializeWeaviateClient(): WeaviateClient {
-   if (!client) {
-     client = weaviate.client({
-       scheme: 'https',
-       host: process.env.WEAVIATE_URL!.replace('https://', ''),
-       apiKey: new ApiKey(process.env.WEAVIATE_API_KEY!),
-       headers: {
-         'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY!,
-       },
-     })
-   }
-   return client
- }
+ // Use the shared initializer
+ const client = initializeWeaviateClient()

// Physics knowledge chunk interface for Weaviate
export interface PhysicsChunk {
  chunkId: string
  sourceDocument: string
  content: string
  domain: string
  subdomain?: string
  contentType: string
  difficultyLevel: string
  priority: number
  hasMathematicalContent: boolean
  equations?: string[]
  concepts: string[]
  prerequisites?: string[]
  extractionMethod: string
  chunkIndex: number
  totalChunks: number
}

// Weaviate schema for physics knowledge
const PHYSICS_SCHEMA = {
  class: 'PhysicsKnowledge',
  description: 'Physics research paper chunks with domain-specific metadata',
  vectorizer: 'text2vec-openai',
  moduleConfig: {
    'text2vec-openai': {
      model: 'ada',
      modelVersion: '002',
      type: 'text',
    },
  },
  properties: [
    {
      name: 'chunkId',
      dataType: ['text'],
      description: 'Unique identifier for the chunk',
    },
    {
      name: 'sourceDocument',
      dataType: ['text'],
      description: 'Source document filename',
    },
    {
      name: 'content',
      dataType: ['text'],
      description: 'The actual text content of the chunk',
    },
    {
      name: 'domain',
      dataType: ['text'],
      description: 'Physics domain (quantum, relativity, etc.)',
    },
    {
      name: 'subdomain',
      dataType: ['text'],
      description: 'Physics subdomain',
    },
    {
      name: 'contentType',
      dataType: ['text'],
      description: 'Type of content (theorem, experimental, mathematical, etc.)',
    },
    {
      name: 'difficultyLevel',
      dataType: ['text'],
      description: 'Difficulty level (beginner, intermediate, advanced)',
    },
    {
      name: 'priority',
      dataType: ['int'],
      description: 'Priority score for relevance ranking',
    },
    {
      name: 'hasMathematicalContent',
      dataType: ['boolean'],
      description: 'Whether the chunk contains mathematical equations',
    },
    {
      name: 'equations',
      dataType: ['text[]'],
      description: 'Mathematical equations found in the chunk',
    },
    {
      name: 'concepts',
      dataType: ['text[]'],
      description: 'Physics concepts mentioned in the chunk',
    },
    {
      name: 'prerequisites',
      dataType: ['text[]'],
      description: 'Prerequisites for understanding this chunk',
    },
    {
      name: 'extractionMethod',
      dataType: ['text'],
      description: 'Method used to extract this chunk',
    },
    {
      name: 'chunkIndex',
      dataType: ['int'],
      description: 'Index of this chunk within the source document',
    },
    {
      name: 'totalChunks',
      dataType: ['int'],
      description: 'Total number of chunks in the source document',
    },
  ],
}

/**
 * Initialize Weaviate schema
 */
export async function initializeWeaviateSchema(): Promise<void> {
  const client = initializeWeaviateClient()
  
  try {
    // Check if schema already exists
    const existingSchema = await client.schema.getter().do()
    const hasPhysicsClass = existingSchema.classes?.some(
      (cls: any) => cls.class === 'PhysicsKnowledge'
    )
    
    if (!hasPhysicsClass) {
      console.log('Creating PhysicsKnowledge schema...')
      await client.schema.classCreator().withClass(PHYSICS_SCHEMA).do()
      console.log('PhysicsKnowledge schema created successfully')
    } else {
      console.log('PhysicsKnowledge schema already exists')
    }
  } catch (error) {
    console.error('Error initializing Weaviate schema:', error)
    throw new Error('Failed to initialize Weaviate schema')
  }
}

/**
 * Store a physics chunk in Weaviate
 */
export async function storePhysicsChunk(chunk: DocumentChunk): Promise<void> {
  const client = initializeWeaviateClient()
  
  try {
    const physicsChunk: PhysicsChunk = {
      chunkId: chunk.id,
      sourceDocument: chunk.metadata.source,
      content: chunk.content,
      domain: chunk.metadata.domain || 'general',
      subdomain: chunk.metadata.domain,
      contentType: 'general',
      difficultyLevel: chunk.metadata.difficultyLevel || 'intermediate',
      priority: 5,
      hasMathematicalContent: (chunk.metadata.equations?.length || 0) > 0,
      equations: chunk.metadata.equations || [],
      concepts: chunk.metadata.concepts || [],
      prerequisites: [],
      extractionMethod: 'real-document-processor',
      chunkIndex: chunk.metadata.chunkIndex,
      totalChunks: chunk.metadata.totalChunks,
    }
    
    await client.data
      .creator()
      .withClassName('PhysicsKnowledge')
      .withProperties(physicsChunk)
      .do()
    
    console.log(`Stored chunk: ${chunk.id}`)
  } catch (error) {
    console.error(`Error storing chunk ${chunk.id}:`, error)
    throw new Error(`Failed to store chunk: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search for relevant physics knowledge chunks
 */
export async function searchPhysicsKnowledge(
  query: string,
  limit: number = 10,
  domain?: string,
  difficultyLevel?: string
): Promise<PhysicsChunk[]> {
  const client = initializeWeaviateClient()
  
  try {
    let searchQuery = client.graphql
      .get()
      .withClassName('PhysicsKnowledge')
      .withFields([
        'chunkId',
        'sourceDocument',
        'content',
        'domain',
        'subdomain',
        'contentType',
        'difficultyLevel',
        'priority',
        'hasMathematicalContent',
        'equations',
        'concepts',
        'prerequisites',
        'extractionMethod',
        'chunkIndex',
        'totalChunks',
        '_additional { certainty distance }'
      ])
      .withNearText({ concepts: [query] })
      .withLimit(limit)
    
    // Add domain filter if specified
    if (domain) {
      searchQuery = searchQuery.withWhere({
        path: ['domain'],
        operator: 'Equal',
        valueText: domain,
      })
    }
    
    // Add difficulty level filter if specified
    if (difficultyLevel) {
      searchQuery = searchQuery.withWhere({
        path: ['difficultyLevel'],
        operator: 'Equal',
        valueText: difficultyLevel,
      })
    }
    
    const result = await searchQuery.do()
    
    if (!result.data?.Get?.PhysicsKnowledge) {
      return []
    }
    
    return result.data.Get.PhysicsKnowledge.map((item: any) => ({
      chunkId: item.chunkId,
      sourceDocument: item.sourceDocument,
      content: item.content,
      domain: item.domain,
      subdomain: item.subdomain,
      contentType: item.contentType,
      difficultyLevel: item.difficultyLevel,
      priority: item.priority,
      hasMathematicalContent: item.hasMathematicalContent,
      equations: item.equations || [],
      concepts: item.concepts || [],
      prerequisites: item.prerequisites || [],
      extractionMethod: item.extractionMethod,
      chunkIndex: item.chunkIndex,
      totalChunks: item.totalChunks,
    }))
  } catch (error) {
    console.error('Error searching physics knowledge:', error)
    throw new Error(`Failed to search physics knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get chunks by source document
 */
export async function getChunksByDocument(sourceDocument: string): Promise<PhysicsChunk[]> {
  const client = initializeWeaviateClient()
  
  try {
    const result = await client.graphql
      .get()
      .withClassName('PhysicsKnowledge')
      .withFields([
        'chunkId',
        'sourceDocument',
        'content',
        'domain',
        'subdomain',
        'contentType',
        'difficultyLevel',
        'priority',
        'hasMathematicalContent',
        'equations',
        'concepts',
        'prerequisites',
        'extractionMethod',
        'chunkIndex',
        'totalChunks',
      ])
      .withWhere({
        path: ['sourceDocument'],
        operator: 'Equal',
        valueText: sourceDocument,
      })
      .withLimit(1000) // Get all chunks for the document
      .do()
    
    if (!result.data?.Get?.PhysicsKnowledge) {
      return []
    }
    
    return result.data.Get.PhysicsKnowledge.map((item: any) => ({
      chunkId: item.chunkId,
      sourceDocument: item.sourceDocument,
      content: item.content,
      domain: item.domain,
      subdomain: item.subdomain,
      contentType: item.contentType,
      difficultyLevel: item.difficultyLevel,
      priority: item.priority,
      hasMathematicalContent: item.hasMathematicalContent,
      equations: item.equations || [],
      concepts: item.concepts || [],
      prerequisites: item.prerequisites || [],
      extractionMethod: item.extractionMethod,
      chunkIndex: item.chunkIndex,
      totalChunks: item.totalChunks,
    }))
  } catch (error) {
    console.error('Error getting chunks by document:', error)
    throw new Error(`Failed to get chunks by document: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete chunks by source document
 */
export async function deleteChunksByDocument(sourceDocument: string): Promise<void> {
  const client = initializeWeaviateClient()
  
  try {
    await client.batch
      .objectsBatchDeleter()
      .withClassName('PhysicsKnowledge')
      .withWhere({
        path: ['sourceDocument'],
        operator: 'Equal',
        valueText: sourceDocument,
      })
      .do()
    
    console.log(`Deleted chunks for document: ${sourceDocument}`)
  } catch (error) {
    console.error(`Error deleting chunks for document ${sourceDocument}:`, error)
    throw new Error(`Failed to delete chunks: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get physics knowledge statistics
 */
export async function getPhysicsKnowledgeStats(): Promise<{
  totalChunks: number
  domainDistribution: { [domain: string]: number }
  difficultyDistribution: { [level: string]: number }
}> {
  const client = initializeWeaviateClient()
  
  try {
    // Get total count
    const countResult = await client.graphql
      .aggregate()
      .withClassName('PhysicsKnowledge')
      .withFields('meta { count }')
      .do()
    
    const totalChunks = countResult.data?.Aggregate?.PhysicsKnowledge?.[0]?.meta?.count || 0
    
    // Get domain distribution
    const domainResult = await client.graphql
      .aggregate()
      .withClassName('PhysicsKnowledge')
      .withFields('domain { count topOccurrences { value occurs } }')
      .do()
    
    const domainDistribution: { [domain: string]: number } = {}
    const domainData = domainResult.data?.Aggregate?.PhysicsKnowledge?.[0]?.domain?.topOccurrences || []
    domainData.forEach((item: any) => {
      domainDistribution[item.value] = item.occurs
    })
    
    // Get difficulty distribution
    const difficultyResult = await client.graphql
      .aggregate()
      .withClassName('PhysicsKnowledge')
      .withFields('difficultyLevel { count topOccurrences { value occurs } }')
      .do()
    
    const difficultyDistribution: { [level: string]: number } = {}
    const difficultyData = difficultyResult.data?.Aggregate?.PhysicsKnowledge?.[0]?.difficultyLevel?.topOccurrences || []
    difficultyData.forEach((item: any) => {
      difficultyDistribution[item.value] = item.occurs
    })
    
    return {
      totalChunks,
      domainDistribution,
      difficultyDistribution,
    }
  } catch (error) {
    console.error('Error getting physics knowledge stats:', error)
    return {
      totalChunks: 0,
      domainDistribution: {},
      difficultyDistribution: {},
    }
  }
}

