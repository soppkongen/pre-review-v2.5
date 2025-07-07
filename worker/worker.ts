import './lib/real-document-processor.js';
import { dequeueJob, setJobStatus, setJobResult, AnalysisJob } from './lib/kv-job-queue.js';
import { AgentOrchestrator } from './lib/services/agent-orchestrator.js';
import type { FileLike } from './lib/real-document-processor.js';

// Helper to reconstruct a File-like object from job data
function makeFileFromJob(job: AnalysisJob): FileLike {
  const buffer = Buffer.from(job.paperContent, 'base64');
  // Node.js doesn't have File, so we create a minimal compatible object
  return {
    name: job.fileName,
    type: job.fileType,
    async text() {
      return buffer.toString('utf-8');
    }
  };
}

async function processJob(job: AnalysisJob) {
  console.log(`[Worker] Processing job ${job.id}...`);
  await setJobStatus(job.id, 'running');
  try {
    const orchestrator = new AgentOrchestrator();
    const file = makeFileFromJob(job);
    const result = await orchestrator.processDocumentAsync(job.id, file, undefined, 'full');
    await setJobResult(job.id, result);
    await setJobStatus(job.id, 'completed');
    console.log(`[Worker] Job ${job.id} completed.`);
  } catch (error) {
    await setJobStatus(job.id, 'failed');
    await setJobResult(job.id, { error: error instanceof Error ? error.message : String(error) });
    console.error(`[Worker] Job ${job.id} failed:`, error);
  }
}

async function main() {
  console.log('[Worker] Started background worker.');
  while (true) {
    const job = await dequeueJob();
    if (job) {
      await processJob(job);
    } else {
      // No job, wait before polling again
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

main(); 