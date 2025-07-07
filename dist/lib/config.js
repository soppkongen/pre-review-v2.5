"use strict";
// lib/config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenAIConfig = getOpenAIConfig;
exports.getConfig = getConfig;
exports.getKVConfig = getKVConfig;
exports.getWeaviateConfig = getWeaviateConfig;
// OpenAI config
function getOpenAIConfig() {
    return {
        apiKey: process.env.OPENAI_API_KEY || "",
        apiBaseUrl: process.env.OPENAI_API_BASE_URL || "https://api.openai.com/v1",
        // Add more OpenAI-related config if needed
    };
}
// General app config
function getConfig() {
    return {
        appName: process.env.APP_NAME || "PreReview",
        environment: process.env.NODE_ENV || "development",
        // Add more general config as needed
    };
}
// Key-Value storage config (e.g., Upstash, Vercel KV)
function getKVConfig() {
    return {
        url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
        token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
        // Add more KV config if needed
    };
}
// Weaviate config
function getWeaviateConfig() {
    return {
        url: process.env.WEAVIATE_URL || "",
        apiKey: process.env.WEAVIATE_API_KEY || "",
        // Add more Weaviate config if needed
    };
}
