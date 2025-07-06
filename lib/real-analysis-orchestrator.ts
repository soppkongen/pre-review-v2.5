import { RealDocumentProcessor, ProcessedDocument } from '@/lib/real-document-processor';
import { PhysicsAgent } from '@/lib/agents/physics-agent';
import { OpenAIRateLimiter } from '@/lib/ai/rate-limiter';
import { PaperChunker } from '@/lib/processors/paper-chunker';

const rateLimiter = new OpenAIRateLimiter();
const chunker = new PaperChunker();

export class RealAnalysisOrchestrator {
  async processDocumentAsync(file: File) {
    // Step 1: Process file into chunks
    const processed: ProcessedDocument = await RealDocumentProcessor.processFile(file);
    const chunks = processed.chunks;

    // Step 2: Analyze each chunk in sequence (rate-limited)
    const physicsAgent = new PhysicsAgent();
    const results: Array<{ chunkId: number; result: any }> = [];

    for (const { id, content } of chunks) {
      const physicsResult = await rateLimiter.schedule(() =>
        physicsAgent.analyze(content)
      );
      results.push({ chunkId: id, result: physicsResult });
    }

    // Step 3: Aggregate results
    const aggregated = results
      .sort((a, b) => a.chunkId - b.chunkId)
      .map(r => r.result)
      .join('\n\n');

    // Return full analysis text along with metadata
    return {
      analysis: aggregated,
      metadata: processed.metadata,
    };
  }
}
