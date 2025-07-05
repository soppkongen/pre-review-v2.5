import weaviate from "weaviate-ts-client";

// Create the Weaviate client
const client = weaviate.client({
  scheme: "https",
  host: process.env.WEAVIATE_URL?.replace(/^https?:\/\//, "") ?? "",
  apiKey: process.env.WEAVIATE_API_KEY,
});

export function getWeaviateClient() {
  return client;
}

// Real implementation: search for relevant physics knowledge chunks
export async function searchPhysicsKnowledge(query: string, limit: number = 10) {
  const result = await client.graphql.get()
    .withClassName("PhysicsChunk") // Adjust class name to match your schema
    .withFields("content metadata { fileName } _additional { certainty }")
    .withNearText({ concepts: [query] })
    .withLimit(limit)
    .do();

  // Parse and return the relevant chunks
  return result.data.Get.PhysicsChunk || [];
}

// Real implementation: initialize schema if not present
export async function initializeWeaviateSchema() {
  const schema = await client.schema.getter().do();
  const hasPhysicsChunk = schema.classes.some((c: any) => c.class === "PhysicsChunk");
  if (!hasPhysicsChunk) {
    await client.schema
      .classCreator()
      .withClass({
        class: "PhysicsChunk",
        properties: [
          { name: "content", dataType: ["text"] },
          { name: "metadata", dataType: ["object"] },
        ],
      })
      .do();
    return true;
  }
  return false;
}
