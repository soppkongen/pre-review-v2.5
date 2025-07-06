import { Redis } from '@upstash/redis';
const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});
export async function get(key) {
    return await redis.get(key);
}
export async function set(key, value) {
    await redis.set(key, value);
}
export async function del(key) {
    await redis.del(key);
}
export async function storeAnalysis(id, data) {
    await set(`analysis:${id}`, data);
}
export async function getAnalysisResult(id) {
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
