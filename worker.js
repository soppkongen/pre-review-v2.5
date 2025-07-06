import { RealAnalysisOrchestrator } from './dist/lib/real-analysis-orchestrator.worker.js';
import { kv } from '@vercel/kv';

console.log('Worker starting...');

async function processJob(jobId) {
  try {
    console.log(`Processing job: ${jobId}`);
    
    // Get job data from KV store
    const jobData = await kv.get(`job:${jobId}`);
    if (!jobData) {
      console.log(`Job ${jobId} not found`);
      return;
    }

    console.log('Job data:', jobData);

    // Update job status to processing
    await kv.set(`job:${jobId}`, { ...jobData, status: 'processing' });

    // Process the document
    const orchestrator = new RealAnalysisOrchestrator();
    const result = await orchestrator.processDocumentAsync(jobData.file);

    // Update job with results
    await kv.set(`job:${jobId}`, { 
      ...jobData, 
      status: 'completed', 
      result: result,
      completedAt: new Date().toISOString()
    });

    console.log(`Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    
    // Update job with error
    const jobData = await kv.get(`job:${jobId}`);
    if (jobData) {
      await kv.set(`job:${jobId}`, { 
        ...jobData, 
        status: 'failed', 
        error: error.message,
        failedAt: new Date().toISOString()
      });
    }
  }
}

// Simple polling loop
async function pollForJobs() {
  try {
    // Get all pending jobs
    const keys = await kv.keys('job:*');
    const pendingJobs = [];
    
    for (const key of keys) {
      const jobData = await kv.get(key);
      if (jobData && jobData.status === 'pending') {
        const jobId = key.replace('job:', '');
        pendingJobs.push(jobId);
      }
    }

    // Process pending jobs
    for (const jobId of pendingJobs) {
      await processJob(jobId);
    }

  } catch (error) {
    console.error('Error polling for jobs:', error);
  }
}

// Start polling
console.log('Starting job poller...');
setInterval(pollForJobs, 5000); // Poll every 5 seconds

// Also poll immediately
pollForJobs(); 