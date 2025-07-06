import { RealDocumentProcessor } from '@/lib/real-document-processor';
import { PhysicsAgent } from '@/lib/agents/physics-agent';
import { OpenAIRateLimiter } from '@/lib/ai/rate-limiter';
const rateLimiter = new OpenAIRateLimiter({ minIntervalMs: 6000, concurrency: 1 });
export class RealAnalysisOrchestrator {
    async processDocumentAsync(file) {
        const processed = await RealDocumentProcessor.processFile(file);
        const physicsAgent = new PhysicsAgent();
        const results = [];
        for (const { id, content } of processed.chunks) {
            const t0 = Date.now();
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
