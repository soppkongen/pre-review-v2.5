import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_URL?.replace(/^https?:\/\//, "") ?? "",
  apiKey: process.env.WEAVIATE_API_KEY,
});

export function getWeaviateClient() {
  return client;
}
