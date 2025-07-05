// lib/kv-storage.ts

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Get a value by key from Redis.
 */
export async function get<T = any>(key: string): Promise<T | null> {
  return await redis.get<T>(key);
}

/**
 * Set a value by key in Redis.
 */
export async function set<T = any>(key: string, value: T): Promise<void> {
  await redis.set(key, value);
}

/**
 * Delete a key from Redis.
 */
export async function del(key: string): Promise<void> {
  await redis.del(key);
}
