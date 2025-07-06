import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const JOB_QUEUE_KEY = 'analysis:job-queue';
const JOB_STATUS_PREFIX = 'analysis:status:';
const JOB_RESULT_PREFIX = 'analysis:result:';

export type AnalysisJob = {
  id: string;
  paperContent: string;
  paperTitle: string;
  createdAt: string;
};

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export async function enqueueJob(job: AnalysisJob) {
  await (redis as any).rpush(JOB_QUEUE_KEY, JSON.stringify(job));
  await setJobStatus(job.id, 'pending');
}

export async function dequeueJob(): Promise<AnalysisJob | null> {
  const res = await redis.lpop(JOB_QUEUE_KEY);
  if (!res || typeof res !== 'string' || !res.trim().startsWith('{')) return null;
  try {
    return JSON.parse(res) as AnalysisJob;
  } catch (e) {
    console.error('Failed to parse job from Redis:', res, e);
    return null;
  }
}

export async function setJobStatus(jobId: string, status: JobStatus) {
  await redis.set(JOB_STATUS_PREFIX + jobId, status);
}

export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  return (await redis.get(JOB_STATUS_PREFIX + jobId)) as JobStatus | null;
}

export async function setJobResult(jobId: string, result: any) {
  await redis.set(JOB_RESULT_PREFIX + jobId, JSON.stringify(result));
}

export async function getJobResult(jobId: string): Promise<any | null> {
  const res = await redis.get(JOB_RESULT_PREFIX + jobId);
  if (!res) return null;
  return JSON.parse(res as string);
} 