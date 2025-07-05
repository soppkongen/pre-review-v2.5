import weaviate from "weaviate-ts-client";

const client = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_URL?.replace(/^https?:\/\//, "") ?? "",
  apiKey: process.env.WEAVIATE_API_KEY,
});

export function getWeaviateClient() {
  return client;
}

export async function searchPhysicsKnowledge(query: string, limit: number = 5) {
  const result = await client.graphql.get()
    .withClassName("PhysicsChunk")
    .withFields("content metadata { fileName } _additional { certainty }")
    .withNearText({ concepts: [query] })
    .withLimit(limit)
    .do();

  return result.data.Get.PhysicsChunk || [];
}
