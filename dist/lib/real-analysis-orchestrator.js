import { RealDocumentProcessor } from './real-document-processor.worker.js';
import { PhysicsAgent } from './agents/physicsAgent.js';
import { OpenAIRateLimiter } from './ai/rate-limiter.js';
const rateLimiter = new OpenAIRateLimiter({ minIntervalMs: 2000, concurrency: 1 });
export class RealAnalysisOrchestrator {
    async processDocumentAsync(file) {
        const processed = await RealDocumentProcessor.processFile(file);
        const physicsAgent = new PhysicsAgent();
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
