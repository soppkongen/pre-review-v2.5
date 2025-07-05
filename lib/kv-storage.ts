import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
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
  return await get(`analysis:${id}`);
}


