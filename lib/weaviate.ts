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

  if (!rawUrl) {
    throw new Error('Environment variable WEAVIATE_URL is required');
  }
  if (!apiKey) {
    throw new Error('Environment variable WEAVIATE_API_KEY is required');
  }
  if (!openAiKey) {
    throw new Error('Environment variable OPENAI_API_KEY is required');
  }

  // Use the URL API to parse the host and scheme
  const parsedUrl = new URL(rawUrl);

  client = weaviate.client({
    scheme: parsedUrl.protocol.replace(':', ''),  // "https" or "http"
    host: parsedUrl.host,                        // e.g., "your-instance.weaviate.cloud"
    apiKey: new ApiKey(apiKey),
    headers: {
      'X-OpenAI-Api-Key': openAiKey,
    },
  });

  return client;
}
