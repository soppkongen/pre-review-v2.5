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
