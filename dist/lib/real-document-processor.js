import { PaperChunker } from './processors/paper-chunker.js';
const chunker = new PaperChunker();
export const RealDocumentProcessor = {
    async processFile(file) {
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
