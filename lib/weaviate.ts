import weaviate, { WeaviateClient } from 'weaviate-client';

const weaviateURL = process.env.WEAVIATE_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;

let client: WeaviateClient | null = null;

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
