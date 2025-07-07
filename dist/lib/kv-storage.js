"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisStorage = void 0;
exports.get = get;
exports.set = set;
exports.del = del;
exports.storeAnalysis = storeAnalysis;
exports.getAnalysisResult = getAnalysisResult;
const redis_1 = require("@upstash/redis");
const redis = new redis_1.Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});
async function get(key) {
    return await redis.get(key);
}
async function set(key, value) {
    await redis.set(key, value);
}
async function del(key) {
    await redis.del(key);
}
async function storeAnalysis(id, data) {
    await set(`analysis:${id}`, data);
}
async function getAnalysisResult(id) {
    return await get(`analysis:${id}`);
}
// The real AnalysisStorage object
exports.AnalysisStorage = {
    store: storeAnalysis,
    get: getAnalysisResult,
    set,
    getRaw: get,
    del,
};
