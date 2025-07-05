import weaviate, { WeaviateClient, ApiKey } from 'weaviate-client';

const weaviateURL = process.env.WEAVIATE_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;

let client: WeaviateClient | null = null;

/**
 * Returns a singleton Weaviate client connected to your cloud instance.
 */
export async function getWeaviateClient(): Promise<WeaviateClient | null> {
  if (client) return client;

  if (!weaviateURL) {
    console.warn('[Weaviate] Missing WEAVIATE_URL environment variable');
    return null;
  }
  if (!weaviateApiKey) {
    console.warn('[Weaviate] Missing WEAVIATE_API_KEY environment variable');
    return null;
  }

  try {
    client = await weaviate.connectToWeaviateCloud(weaviateURL, {
      authCredentials: new weaviate.ApiKey(weaviateApiKey),
    });

    const ready = await client.isReady();
    if (!ready) {
      console.warn('[Weaviate] Client not ready');
      return null;
    }

    return client;
  } catch (error) {
    console.error('[Weaviate] Failed to connect:', error);
    return null;
  }
}

/**
 * Fetches the full Weaviate schema.
 */
export async function getSchema(): Promise<any | null> {
  const client = await getWeaviateClient();
  if (!client) return null;

  try {
    const schema = await client.schema.getter().do();
    return schema;
  } catch (error) {
    console.error('[Weaviate] Failed to get schema:', error);
    return null;
  }
}

/**
 * Searches the PhysicsChunk class using a nearText query.
 */
export async function searchPhysicsKnowledge(query: string, limit = 5): Promise<any[]> {
  const client = await getWeaviateClient();
  if (!client) return [];

  try {
    const response = await client.graphql.get()
      .withClassName('PhysicsChunk')
      .withFields(`
        chunkId
        content
        sourceDocument
        domain
        subdomain
        contentType
        difficultyLevel
        concepts
        prerequisites
        source
      `)
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();

    return response.data.Get.PhysicsChunk || [];
  } catch (error) {
    console.error('[searchPhysicsKnowledge] Weaviate query failed:', error);
    return [];
  }
}
