import './lib/real-document-processor.js';
import { dequeueJob, setJobStatus, setJobResult } from './lib/kv-job-queue.js';
import { AgentOrchestrator } from './lib/services/agent-orchestrator.js';

async function processJob(job: any) {
  console.log(`[Worker] Processing job ${job.id}...`);
  await setJobStatus(job.id, 'running');
  try {
    const orchestrator = new AgentOrchestrator();
    // For now, run all agents sequentially and aggregate results
    const agents = orchestrator.getAgents();
    const results = [];
    for (const agent of agents) {
      const result = await orchestrator.analyzeWithAgent(agent.id, job.paperContent, job.paperTitle);
      results.push({ agentId: agent.id, result });
      // Small delay to avoid rate limits
      await new Promise(res => setTimeout(res, 500));
    }
    await setJobResult(job.id, { results });
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