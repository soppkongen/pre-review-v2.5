import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

const scheme = process.env.WEAVIATE_SCHEME || 'https';
const fallbackHost = process.env.WEAVIATE_HOST || process.env.WEAVIATE_FALLBACK_HOST;
const apiKey = process.env.WEAVIATE_API_KEY;

let dynamicHost: string | null = null;
let client: WeaviateClient | null = null;

/**
 * Initializes the Weaviate client, fetching the dynamic host if needed.
 */
export async function getWeaviateClient(): Promise<WeaviateClient | null> {
  if (client && dynamicHost) return client;

  if (!fallbackHost) {
    console.warn('[Weaviate] No fallback host configured, cannot initialize client');
    return null;
  }

  // 1. Connect to fallback host just to fetch meta info
  const tempClient = weaviate.client({
    scheme,
    host: fallbackHost,
    apiKey: apiKey ? new ApiKey(apiKey) : undefined,
  });

  try {
    const meta = await tempClient.misc.metaGetter().do();
    dynamicHost = meta.hostname || fallbackHost;

    // 2. Now connect to the actual dynamic host
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
 * Example: Search physics knowledge using the dynamic client.
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
