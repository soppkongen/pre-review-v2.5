import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { getWeaviateConfig, getOpenAIConfig, isDevelopment } from './config';

let client: WeaviateClient | null = null;

/**
 * Returns a singleton Weaviate client, configured from centralized configuration.
 * Throws an error if required variables are missing or invalid.
 */
export function initializeWeaviateClient(): WeaviateClient {
  if (client) {
    return client;
  }

  const weaviateConfig = getWeaviateConfig();
  const openAIConfig = getOpenAIConfig();

  // Debug logs in development
  if (isDevelopment()) {
    console.log('🔍 WEAVIATE_URL:', weaviateConfig.url);
    console.log('🔍 WEAVIATE_API_KEY set:', !!weaviateConfig.apiKey);
    console.log('🔍 OPENAI_API_KEY set:', !!openAIConfig.apiKey);
  }

  if (!weaviateConfig.url || weaviateConfig.url === 'weaviate_url') {
    throw new Error('[Weaviate] Environment variable WEAVIATE_URL is required and must be a valid URL');
  }
  if (!weaviateConfig.apiKey) {
    throw new Error('[Weaviate] Environment variable WEAVIATE_API_KEY is required');
  }
  if (!openAIConfig.apiKey) {
    throw new Error('[Weaviate] Environment variable OPENAI_API_KEY is required');
  }

  // Validate the URL explicitly
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(weaviateConfig.url);
  } catch {
    throw new Error(`[Weaviate] Invalid WEAVIATE_URL provided: ${weaviateConfig.url}`);
  }

  console.log('[Weaviate] Initializing Weaviate client for', parsedUrl.host)
  client = weaviate.client({
    scheme: parsedUrl.protocol.replace(':', ''),
    host: parsedUrl.host,
    headers: {
      'Authorization': `Bearer ${weaviateConfig.apiKey}`,
      'X-OpenAI-Api-Key': openAIConfig.apiKey,
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
    console.log('[Weaviate] Schema already exists for PhysicsChunk')
    return;
  }

  // Create the class if it doesn't exist
  console.log('[Weaviate] Creating schema for PhysicsChunk')
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
  console.log('[Weaviate] Schema created for PhysicsChunk')
}

/**
 * Stores a physics document chunk in Weaviate.
 */
export async function storePhysicsChunk(chunk: any) {
  const client = initializeWeaviateClient();
  console.log('[Weaviate] Storing chunk in Weaviate:', chunk?.content?.slice(0, 40) || '[no content]')
  await client.data.creator()
    .withClassName('PhysicsChunk')
    .withProperties({
      content: chunk.content,
      source: chunk.metadata?.source || '',
      embedding: chunk.embedding || undefined,
      createdAt: new Date().toISOString(),
    })
    .do();
  console.log('[Weaviate] Chunk stored')
}

// PhysicsChunk interface for type safety
export interface PhysicsChunk {
  chunkId?: string;
  content: string;
  source?: string;
  sourceDocument?: string;
  embedding?: number[];
  createdAt?: string;
  metadata?: any;
  domain?: string;
  concepts?: string[];
  equations?: string[];
  hasMathematicalContent?: boolean;
}

// PhysicsKnowledge interface for type safety
export interface PhysicsKnowledge {
  concept: string;
  description: string;
  field: string;
  difficulty: string;
  equations?: string[];
  applications?: string[];
  relatedConcepts?: string[];
  examples?: string[];
}

/**
 * Search for relevant PhysicsChunk objects in Weaviate by query string.
 * Returns an array of PhysicsChunk.
 */
export async function searchPhysicsKnowledge(query: string, limit: number = 5): Promise<PhysicsChunk[]> {
  const client = initializeWeaviateClient();
  console.log('[Weaviate] Searching PhysicsChunk for query:', query)
  const response = await client.graphql.get()
    .withClassName('PhysicsChunk')
    .withFields('content source embedding createdAt')
    .withNearText({ concepts: [query] })
    .withLimit(limit)
    .do();

  // Parse and return results
  const data = response.data?.Get?.PhysicsChunk || [];
  console.log('[Weaviate] Search results:', data.length)
  return data.map((item: any) => ({
    content: item.content,
    source: item.source,
    embedding: item.embedding,
    createdAt: item.createdAt,
    // Add more fields as needed
  }));
}
