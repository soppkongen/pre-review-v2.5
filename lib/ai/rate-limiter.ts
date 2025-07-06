// lib/ai/rate-limiter.ts

interface RateLimiterConfig {
  minIntervalMs?: number;
  concurrency?: number;
  maxRetries?: number;
}

export class OpenAIRateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private lastRequestTimestamp = 0;
  private readonly minIntervalMs: number;
  private readonly maxRetries: number;

  constructor(config: RateLimiterConfig = {}) {
    this.minIntervalMs = config.minIntervalMs || 2000; // 2 seconds between requests
    this.maxRetries = config.maxRetries || 2; // Reduced retries
  }

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(() => this.execute(fn, resolve, reject));
      if (!this.processing) {
        this.processNext();
      }
    });
  }

  private async processNext() {
    this.processing = true;
    const task = this.queue.shift();
    if (!task) {
      this.processing = false;
      return;
    }
    task();
  }

  private async execute<T>(
    fn: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (err: any) => void,
    attempt = 1
  ) {
    const now = Date.now();
    const wait = Math.max(0, this.minIntervalMs - (now - this.lastRequestTimestamp));
    if (wait > 0) await new Promise(r => setTimeout(r, wait));

    try {
      this.lastRequestTimestamp = Date.now();
      const result = await fn();
      resolve(result);
    } catch (err: any) {
      if (err.status === 429 && attempt <= this.maxRetries) {
        // exponential backoff with shorter delays
        const backoff = Math.min(1000 * 2 ** (attempt - 1), 8000);
        await new Promise(r => setTimeout(r, backoff));
        return this.execute(fn, resolve, reject, attempt + 1);
      }
      reject(err);
    } finally {
      this.processNext();
    }
  }
}
