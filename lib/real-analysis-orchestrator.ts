import { RealDocumentProcessor, ProcessedDocument } from '@/lib/real-document-processor';
import { PhysicsAgent } from '@/lib/agents/physics-agent';
import { OpenAIRateLimiter } from '@/lib/ai/rate-limiter';

const rateLimiter = new OpenAIRateLimiter({ minIntervalMs: 6000, concurrency: 1 });

export class RealAnalysisOrchestrator {
  /** Chunked physics analysis with timing instrumentation */
  async processDocumentAsync(file: File) {
    const processed: ProcessedDocument = await RealDocumentProcessor.processFile(file);
    const physicsAgent = new PhysicsAgent();

    const results: Array<{ chunkId: number; result: any; durationMs: number }> = [];

    for (const { id, content } of processed.chunks) {
      const start = Date.now();
      const physicsResult = await rateLimiter.schedule(() =>
        physicsAgent.analyze(content)
      );
      results.push({ chunkId: id, result: physicsResult, durationMs: Date.now() - start });
    }

    const aggregated = results
      .sort((a, b) => a.chunkId - b.chunkId)
      .map(r => `[Chunk ${r.chunkId} - ${r.durationMs}ms]\n${r.result}`)
      .join('\n\n');

    return {
      analysis: aggregated,
      metadata: processed.metadata,
      timings: results.map(r => ({ chunkId: r.chunkId, durationMs: r.durationMs })),
    };
  }
}
