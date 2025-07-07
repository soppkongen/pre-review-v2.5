"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperChunker = void 0;
const js_tiktoken_1 = require("js-tiktoken");
class PaperChunker {
    constructor() {
        this.maxTokens = 4000;
        this.overlap = 200;
        this.enc = (0, js_tiktoken_1.encodingForModel)("gpt-3.5-turbo");
    }
    chunkText(fullText) {
        const tokens = this.enc.encode(fullText);
        const chunks = [];
        let id = 0;
        for (let i = 0; i < tokens.length; i += this.maxTokens - this.overlap) {
            const tokenSlice = tokens.slice(i, i + this.maxTokens);
            const chunkText = this.enc.decode(tokenSlice);
            chunks.push({
                id: id++,
                content: chunkText,
                tokenCount: tokenSlice.length,
            });
            if (i + this.maxTokens >= tokens.length)
                break;
        }
        return chunks;
    }
}
exports.PaperChunker = PaperChunker;
