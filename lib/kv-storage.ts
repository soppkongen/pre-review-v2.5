import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.PAPERWORK_KV_REST_API_URL!,
  token: process.env.PAPERWORK_KV_REST_API_TOKEN!,
});

export async function get<T = any>(key: string): Promise<T | null> {
  return await redis.get<T>(key);
}

export async function set<T = any>(key: string, value: T): Promise<void> {
  await redis.set(key, value);
}

export async function del(key: string): Promise<void> {
  await redis.del(key);
}

export async function storeAnalysis(id: string, data: any) {
  await set(`analysis:${id}`, data);
}

export async function getAnalysisResult(id: string) {
  // First try the job result location (where worker stores results)
  const jobResult = await get(`analysis:result:${id}`);
  if (jobResult) {
    // Parse if it's a JSON string, otherwise return as-is
    return typeof jobResult === 'string' ? JSON.parse(jobResult) : jobResult;
  }
  
  // Fallback to the old location for backward compatibility
  return await get(`analysis:${id}`);
}

// The real AnalysisStorage object
export const AnalysisStorage = {
  store: storeAnalysis,
  get: getAnalysisResult,
  set,
  getRaw: get,
  del,
};
