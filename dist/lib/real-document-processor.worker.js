"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealDocumentProcessor = void 0;
const paper_chunker_js_1 = require("./processors/paper-chunker.js");
const chunker = new paper_chunker_js_1.PaperChunker();
exports.RealDocumentProcessor = {
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
