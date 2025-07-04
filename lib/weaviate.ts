import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

// Debug logs to confirm environment variables at runtime
console.log('🔍 WEAVIATE_URL:', process.env.WEAVIATE_URL);
console.log('🔍 WEAVIATE_API_KEY set:', !!process.env.WEAVIATE_API_KEY);
console.log('🔍 OPENAI_API_KEY set:', !!process.env.OPENAI_API_KEY);

let client: WeaviateClient | null = null;

/**
 * Returns a singleton Weaviate client, configured from environment variables.
 * Throws an error if required variables are missing or invalid.
 */
export function initializeWeaviateClient(): WeaviateClient {
  if (client) {
    return client;
  }

  const rawUrl = process.env.WEAVIATE_URL;
  const apiKey = process.env.WEAVIATE_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!rawUrl || rawUrl === 'weaviate_url') {
    throw new Error('Environment variable WEAVIATE_URL is required and must be a valid URL');
  }
  if (!apiKey) {
    throw new Error('Environment variable WEAVIATE_API_KEY is required');
  }
  if (!openAiKey) {
    throw new Error('Environment variable OPENAI_API_KEY is required');
  }

  // Validate the URL explicitly
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid WEAVIATE_URL provided: ${rawUrl}`);
  }

  client = weaviate.client({
    scheme: parsedUrl.protocol.replace(':', ''),
    host: parsedUrl.host,
    apiKey: new ApiKey(apiKey),
    headers: {
      'X-OpenAI-Api-Key': openAiKey,
    },
  });

  return client;
}

// Explicitly export to match imports elsewhere
export const getWeaviateClient = initializeWeaviateClient;

/**
 * Ensures the Weaviate schema for PhysicsChunk exists. Creates it if missing.
 */
export async function initializeWeaviateSchema() {
  const client = initializeWeaviateClient();
  const className = 'PhysicsChunk';

  // Check if the class already exists
  const schema = await client.schema.getter().do();
  const exists = schema.classes && schema.classes.some((c: any) => c.class === className);
  if (exists) {
    return;
  }

  // Create the class if it doesn't exist
  await client.schema.classCreator().withClass({
    class: className,
    description: 'A chunk of a physics document',
    properties: [
      { name: 'content', dataType: ['text'], description: 'Chunk content' },
      { name: 'source', dataType: ['string'], description: 'Source document or section' },
      { name: 'embedding', dataType: ['number[]'], description: 'Vector embedding' },
      { name: 'createdAt', dataType: ['date'], description: 'Creation timestamp' }
    ]
  }).do();
}

/**
 * Stores a physics document chunk in Weaviate.
 */
export async function storePhysicsChunk(chunk: any) {
  const client = initializeWeaviateClient();
  await client.data.creator()
    .withClassName('PhysicsChunk')
    .withProperties({
      content: chunk.content,
      source: chunk.metadata?.source || '',
      embedding: chunk.embedding || undefined,
      createdAt: new Date().toISOString(),
    })
    .do();
}

// PhysicsChunk interface for type safety
export interface PhysicsChunk {
  chunkId?: string;
  content: string;
  source?: string;
  embedding?: number[];
  createdAt?: string;
  metadata?: any;
  domain?: string;
}

/**
 * Search for relevant PhysicsChunk objects in Weaviate by query string.
 * Returns an array of PhysicsChunk.
 */
export async function searchPhysicsKnowledge(query: string, limit: number = 5): Promise<PhysicsChunk[]> {
  const client = initializeWeaviateClient();
  const response = await client.graphql.get()
    .withClassName('PhysicsChunk')
    .withFields('content source embedding createdAt')
    .withNearText({ concepts: [query] })
    .withLimit(limit)
    .do();

  // Parse and return results
  const data = response.data?.Get?.PhysicsChunk || [];
  return data.map((item: any) => ({
    content: item.content,
    source: item.source,
    embedding: item.embedding,
    createdAt: item.createdAt,
    // Add more fields as needed
  }));
}
