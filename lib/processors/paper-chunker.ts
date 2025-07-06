// lib/processors/paper-chunker.ts

export interface Chunk { id: number; content: string; }

export class PaperChunker {
  private readonly maxChunkSize = 1000; // characters per chunk

  public chunkText(fullText: string): Chunk[] {
    const chunks: Chunk[] = [];
    let current = '';
    let id = 0;

    for (const paragraph of fullText.split('\n\n')) {
      if ((current + paragraph).length > this.maxChunkSize) {
        chunks.push({ id: id++, content: current });
        current = paragraph;
      } else {
        current += (current ? '\n\n' : '') + paragraph;
      }
    }
    if (current) chunks.push({ id, content: current });
    return chunks;
  }
}
