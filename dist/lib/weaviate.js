import weaviate from 'weaviate-client';
const weaviateURL = process.env.WEAVIATE_URL;
const weaviateApiKey = process.env.WEAVIATE_API_KEY;
let client = null;
/**
 * Returns a singleton Weaviate client connected to your cloud instance.
 */
export async function getWeaviateClient() {
    if (client)
        return client;
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
    }
    catch (error) {
        console.error('[Weaviate] Failed to connect:', error);
        return null;
    }
}
/**
 * Fetches the full Weaviate schema (v3+ API: listAll collections).
 */
export async function getSchema() {
    const client = await getWeaviateClient();
    if (!client)
        return null;
    try {
        // v3+ API: list all collections (schema)
        const collections = await client.collections.listAll();
        return collections;
    }
    catch (error) {
        console.error('[Weaviate] Failed to get schema:', error);
        return null;
    }
}
/**
 * Searches the PhysicsChunk collection using a nearText query (v3+ client API).
 */
export async function searchPhysicsKnowledge(query, limit = 5) {
    const client = await getWeaviateClient();
    if (!client) {
        console.error('[Weaviate] Client not initialized');
        return [];
    }
    try {
        // v3+ API: use collections.get and .query.nearText
        const collection = client.collections.get('PhysicsChunk');
        const result = await collection.query.nearText(query, { limit });
        if (!result || !result.objects) {
            console.error('[Weaviate] Unexpected response:', result);
            return [];
        }
        return result.objects;
    }
    catch (error) {
        console.error('[searchPhysicsKnowledge] Weaviate query failed:', error);
        return [];
    }
}
