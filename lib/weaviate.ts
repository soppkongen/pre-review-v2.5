// lib/weaviate.ts

import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { getWeaviateConfig } from './config';

// Export any existing functions (e.g., getWeaviateClient)
export function getWeaviateClient(): WeaviateClient {
  const config = getWeaviateConfig();
  return weaviate.client({
    scheme: config.scheme,
    host: config.host,
    apiKey: config.apiKey ? new weaviate.ApiKey(config.apiKey) : undefined,
  });
}

/**
 * Search the physics knowledge base in Weaviate.
 * @param {string} query - The search query.
 * @param {number} limit - Number of results to return.
 * @returns {Promise<any[]>} - Array of relevant knowledge objects.
 */
export async function searchPhysicsKnowledge(query: string, limit: number = 5): Promise<any[]> {
  const client = getWeaviateClient();

  // Adjust className and fields to match your Weaviate schema
  const className = 'PhysicsKnowledge';
  const fields = ['title', 'content', 'source', 'id'];

  try {
    const response = await client.graphql.get()
      .withClassName(className)
      .withFields(fields.join(' '))
      .withNearText({ concepts: [query] })
      .withLimit(limit)
      .do();

    // Adjust path to data as needed based on your schema
    return response.data.Get[className] || [];
  } catch (error) {
    console.error('[searchPhysicsKnowledge] Weaviate query failed:', error);
    return [];
  }
}
