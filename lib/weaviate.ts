import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

const scheme = process.env.WEAVIATE_SCHEME || 'https';
const apiKey = process.env.WEAVIATE_API_KEY;

let client: WeaviateClient | null = null;

/**
 * Initialize Weaviate client dynamically by fetching hostname from meta.
 */
export async function getWeaviateClient(): Promise<WeaviateClient | null> {
  if (client) return client; // reuse existing client

  // Use a fallback host from env for initial connection
  const fallbackHost = process.env.WEAVIATE_FALLBACK_HOST;
  if (!fallbackHost) {
    console.warn('[Weaviate] No fallback host configured, cannot initialize client');
    return null;
  }

  // Initialize client with fallback host to get meta info
  const tempClient = weaviate.client({
    scheme,
    host: fallbackHost,
    apiKey: apiKey ? new ApiKey(apiKey) : undefined,
  });

  try {
    const meta = await tempClient.misc.metaGetter().do();
    const dynamicHost = meta.hostname || fallbackHost;

    // Create client with dynamic hostname
    client = weaviate.client({
      scheme,
      host: dynamicHost,
      apiKey: apiKey ? new ApiKey(apiKey) : undefined,
    });

    return client;
  } catch (error) {
    console.error('[Weaviate] Failed to get meta and initialize client:', error);
    return null;
  }
}

/**
 * Get the full schema from Weaviate.
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
 * Search physics knowledge using Weaviate nearText query.
 */
export async function searchPhysicsKnowledge(query: string, limit = 5): Promise<any[]> {
  const client = await getWeaviateClient();
  if (!client) return [];

  try {
    const response = await client.graphql.get()
      .withClassName('PhysicsKnowledge')
      .withFields('title content source id')
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();

    return response.data.Get.PhysicsKnowledge || [];
  } catch (error) {
    console.error('[searchPhysicsKnowledge] Weaviate query failed:', error);
    return [];
  }
}
