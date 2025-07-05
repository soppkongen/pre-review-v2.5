import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export function getRedisClient() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL is not set in environment variables');
    client = createClient({ url: redisUrl });
    client.connect().catch((err) => {
      console.error('[Redis] Connection error:', err);
    });
  }
  return client;
}
