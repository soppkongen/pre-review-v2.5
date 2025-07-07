"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeaviateClient = getWeaviateClient;
exports.getSchema = getSchema;
exports.searchPhysicsKnowledge = searchPhysicsKnowledge;
const weaviate_client_1 = __importDefault(require("weaviate-client"));
const weaviateURL = process.env.WEAVIATE_URL;
const weaviateApiKey = process.env.WEAVIATE_API_KEY;
const openaiApiKey = process.env.OPENAI_APIKEY;
let client = null;
/**
 * Returns a singleton Weaviate client connected to your cloud instance.
 */
async function getWeaviateClient() {
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
    if (!openaiApiKey) {
        console.warn('[Weaviate] Missing OPENAI_APIKEY environment variable');
        return null;
    }
    try {
        client = await weaviate_client_1.default.connectToWeaviateCloud(weaviateURL, {
            authCredentials: new weaviate_client_1.default.ApiKey(weaviateApiKey),
            headers: { 'X-Openai-Api-Key': openaiApiKey },
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
async function getSchema() {
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
async function searchPhysicsKnowledge(query, limit = 5) {
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
