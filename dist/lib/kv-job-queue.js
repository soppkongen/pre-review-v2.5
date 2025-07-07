"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueJob = enqueueJob;
exports.dequeueJob = dequeueJob;
exports.setJobStatus = setJobStatus;
exports.getJobStatus = getJobStatus;
exports.setJobResult = setJobResult;
exports.getJobResult = getJobResult;
const redis_1 = require("@upstash/redis");
const redis = new redis_1.Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});
const JOB_QUEUE_KEY = 'analysis:job-queue';
const JOB_STATUS_PREFIX = 'analysis:status:';
const JOB_RESULT_PREFIX = 'analysis:result:';
async function enqueueJob(job) {
    await redis.rpush(JOB_QUEUE_KEY, JSON.stringify(job));
    await setJobStatus(job.id, 'pending');
    await redis.set(`job:${job.id}`, { ...job, status: 'pending' });
}
async function dequeueJob() {
    const res = await redis.lpop(JOB_QUEUE_KEY);
    if (!res || typeof res !== 'string' || !res.trim().startsWith('{'))
        return null;
    try {
        return JSON.parse(res);
    }
    catch (e) {
        console.error('Failed to parse job from Redis:', res, e);
        return null;
    }
}
async function setJobStatus(jobId, status) {
    await redis.set(JOB_STATUS_PREFIX + jobId, status);
}
async function getJobStatus(jobId) {
    return (await redis.get(JOB_STATUS_PREFIX + jobId));
}
async function setJobResult(jobId, result) {
    await redis.set(JOB_RESULT_PREFIX + jobId, JSON.stringify(result));
}
async function getJobResult(jobId) {
    const res = await redis.get(JOB_RESULT_PREFIX + jobId);
    if (!res)
        return null;
    return JSON.parse(res);
}
