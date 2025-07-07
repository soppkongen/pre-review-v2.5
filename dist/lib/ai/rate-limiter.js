// lib/ai/rate-limiter.ts
export class OpenAIRateLimiter {
    constructor(config = {}) {
        this.queue = [];
        this.processing = false;
        this.lastRequestTimestamp = 0;
        this.minIntervalMs = config.minIntervalMs || 1000; // Reduced to 1 second between requests
        this.maxRetries = config.maxRetries || 3; // Increased retries for better resilience
    }
    async schedule(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push(() => this.execute(fn, resolve, reject));
            if (!this.processing) {
                this.processNext();
            }
        });
    }
    async processNext() {
        this.processing = true;
        const task = this.queue.shift();
        if (!task) {
            this.processing = false;
            return;
        }
        task();
    }
    async execute(fn, resolve, reject, attempt = 1) {
        const now = Date.now();
        const wait = Math.max(0, this.minIntervalMs - (now - this.lastRequestTimestamp));
        if (wait > 0)
            await new Promise(r => setTimeout(r, wait));
        try {
            this.lastRequestTimestamp = Date.now();
            const result = await fn();
            resolve(result);
        }
        catch (err) {
            if (err.status === 429 && attempt <= this.maxRetries) {
                // Improved exponential backoff with jitter
                const baseDelay = 2000; // Start with 2 seconds
                const maxDelay = 30000; // Max 30 seconds
                const backoff = Math.min(baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000, maxDelay);
                console.log(`[RateLimiter] 429 error, retrying in ${Math.round(backoff)}ms (attempt ${attempt}/${this.maxRetries})`);
                await new Promise(r => setTimeout(r, backoff));
                return this.execute(fn, resolve, reject, attempt + 1);
            }
            reject(err);
        }
        finally {
            this.processNext();
        }
    }
}
