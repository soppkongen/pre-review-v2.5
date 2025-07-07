"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealAnalysisOrchestrator = void 0;
const real_document_processor_worker_1 = require("./real-document-processor.worker");
const physicsAgent_1 = require("./agents/physicsAgent");
const rate_limiter_1 = require("./ai/rate-limiter");
const rateLimiter = new rate_limiter_1.OpenAIRateLimiter({ minIntervalMs: 2000, concurrency: 1 });
class RealAnalysisOrchestrator {
    async processDocumentAsync(file) {
        const processed = await real_document_processor_worker_1.RealDocumentProcessor.processFile(file);
        const physicsAgent = new physicsAgent_1.PhysicsAgent();
        const results = [];
        console.log(`[Orchestrator] Processing ${processed.chunks.length} chunks (was ~100+ before optimization)`);
        for (const { id, content } of processed.chunks) {
            const t0 = Date.now();
            console.log(`[Orchestrator] Processing chunk ${id + 1}/${processed.chunks.length}`);
            const res = await rateLimiter.schedule(() => physicsAgent.analyze(content));
            results.push({ chunkId: id, result: res, durationMs: Date.now() - t0 });
        }
        const analysis = results
            .sort((a, b) => a.chunkId - b.chunkId)
            .map(r => `[Chunk ${r.chunkId} - ${r.durationMs}ms]\n${r.result}`)
            .join('\n\n');
        return { analysis, metadata: processed.metadata, timings: results.map(r => ({ chunkId: r.chunkId, durationMs: r.durationMs })) };
    }
}
exports.RealAnalysisOrchestrator = RealAnalysisOrchestrator;
