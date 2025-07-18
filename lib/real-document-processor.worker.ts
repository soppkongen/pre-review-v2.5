import { PaperChunker, Chunk } from './processors/paper-chunker';

export interface ProcessedDocument {
  chunks: Chunk[];
  metadata: { fileType: string; fileName: string };
  getContent: () => string;
  getTitle: () => string;
  getSupportedFileTypes: () => string[];
  getMaxFileSize: () => number;
}

const chunker = new PaperChunker();

export const RealDocumentProcessor = {
  async processFile(file: File): Promise<ProcessedDocument> {
    const text = await file.text();
    const chunks = chunker.chunkText(text);

    return {
      chunks,
      metadata: { fileType: file.type, fileName: file.name },
      getContent: () => text,
      getTitle: () => file.name,
      getSupportedFileTypes: () => ['pdf', 'txt', 'docx'],
      getMaxFileSize: () => 10 * 1024 * 1024,
    };
  },
}; 