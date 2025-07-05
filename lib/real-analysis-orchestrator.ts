// lib/services/agent-orchestrator.ts

import { searchPhysicsKnowledge } from '@/lib/weaviate';
import { getRedisClient } from '@/lib/db/redis';
import { v4 as uuidv4 } from 'uuid';

// Simple in-memory queue for throttling
const analysisQueue: Array<() => Promise<void>> = [];
let runningTasks = 0;
const MAX_CONCURRENT_TASKS = 1; // Only one analysis at a time
const DELAY_BETWEEN_TASKS_MS = 8000; // 8 seconds delay between analyses

async function processQueue() {
  if (runningTasks >= MAX_CONCURRENT_TASKS || analysisQueue.length === 0) return;
  runningTasks++;
  const task = analysisQueue.shift();
  if (task) {
    try {
      await task();
    } catch (error) {
      console.error('[Orchestrator] Error processing analysis task:', error);
    }
  }
  runningTasks--;
  // Wait before starting the next task
  setTimeout(() => {
    processQueue();
  }, DELAY_BETWEEN_TASKS_MS);
}

export async function agentOrchestrator(task: { type: string; query: string; limit?: number }) {
  if (task.type === 'physics_knowledge_search') {
    return new Promise<{ id: string }>((resolve) => {
      const id = uuidv4();
      analysisQueue.push(async () => {
        try {
          // Simulate long-running analysis (e.g., for big physics papers)
          const result = await searchPhysicsKnowledge(task.query, task.limit || 5);
          const analysis = {
            id,
            score: 8.5, // Replace with real scoring logic if needed
            confidence: 0.95,
            summary: 'Analysis complete',
            details: result,
          };
          const client = getRedisClient();
          await client.set(`analysis:${id}`, JSON.stringify(analysis), { EX: 3600 });
          resolve({ id });
        } catch (err) {
          console.error('[Orchestrator] Analysis failed:', err);
          resolve({ id }); // Still resolve to avoid hanging the queue
        }
      });
      processQueue();
    });
  }
  return { error: 'Unknown task type' };
}

export async function getAnalysisResult(id: string) {
  const client = getRedisClient();
  const data = await client.get(`analysis:${id}`);
  if (data) {
    return JSON.parse(data);
  }
  return { status: 'processing' };
}
