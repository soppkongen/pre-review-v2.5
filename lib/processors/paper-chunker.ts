'use server';

import { encoding_for_model } from "tiktoken";

export interface Chunk {
  id: number;
  content: string;
  tokenCount: number;
}

export class PaperChunker {
  private readonly maxTokens = 512;
  private readonly overlap = 50;
  private readonly enc = encoding_for_model("gpt-3.5-turbo");

  public chunkText(fullText: string): Chunk[] {
    const tokens = this.enc.encode(fullText);
    const chunks: Chunk[] = [];

    let id = 0;
    for (let i = 0; i < tokens.length; i += this.maxTokens - this.overlap) {
      const tokenSlice = tokens.slice(i, i + this.maxTokens);
      const chunkText = this.enc.decode(tokenSlice);

      chunks.push({
        id: id++,
        content: chunkText,
        tokenCount: tokenSlice.length,
      });

      if (i + this.maxTokens >= tokens.length) break;
    }

    return chunks;
  }
}
