import weaviate, { ApiKey } from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_URL?.replace(/^https?:\/\//, "") ?? "",
  apiKey: new ApiKey(process.env.WEAVIATE_API_KEY || ""), // ✅ Correct way!
});

export function getWeaviateClient() {
  return client;
}
