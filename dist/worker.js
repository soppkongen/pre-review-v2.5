"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/real-document-processor.js");
const kv_job_queue_js_1 = require("./lib/kv-job-queue.js");
const agent_orchestrator_js_1 = require("./lib/services/agent-orchestrator.js");
// Helper to reconstruct a File-like object from job data
function makeFileFromJob(job) {
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
async function processJob(job) {
    console.log(`[Worker] Processing job ${job.id}...`);
    await (0, kv_job_queue_js_1.setJobStatus)(job.id, 'running');
    try {
        const orchestrator = new agent_orchestrator_js_1.AgentOrchestrator();
        const file = makeFileFromJob(job);
        const result = await orchestrator.processDocumentAsync(job.id, file, undefined, 'full');
        await (0, kv_job_queue_js_1.setJobResult)(job.id, result);
        await (0, kv_job_queue_js_1.setJobStatus)(job.id, 'completed');
        console.log(`[Worker] Job ${job.id} completed.`);
    }
    catch (error) {
        await (0, kv_job_queue_js_1.setJobStatus)(job.id, 'failed');
        await (0, kv_job_queue_js_1.setJobResult)(job.id, { error: error instanceof Error ? error.message : String(error) });
        console.error(`[Worker] Job ${job.id} failed:`, error);
    }
}
async function main() {
    console.log('[Worker] Started background worker.');
    while (true) {
        const job = await (0, kv_job_queue_js_1.dequeueJob)();
        if (job) {
            await processJob(job);
        }
        else {
            // No job, wait before polling again
            await new Promise(res => setTimeout(res, 2000));
        }
    }
}
main();
