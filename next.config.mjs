/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve current build ignores
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Enable SWC minification (supports ES modules) and ESM externals
  swcMinify: true,
  experimental: {
    esmExternals: true
  },

  // Environment variables
  env: {
    // Core environment variables
    WEAVIATE_URL: process.env.WEAVIATE_URL ?? 'MISSING',
    WEAVIATE_API_KEY: process.env.WEAVIATE_API_KEY ?? 'MISSING',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? 'MISSING',
    KV_REST_API_URL: process.env.KV_REST_API_URL ?? 'MISSING',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ?? 'MISSING',

    // Application configuration
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'Pre-Review Platform',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? '2.5.0',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.pre-review.com/',

    // OpenAI configuration
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? 'gpt-4-turbo-preview',
    OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS ?? '4000',
    OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE ?? '0.7',

    // Weaviate configuration
    WEAVIATE_CLASS_NAME: process.env.WEAVIATE_CLASS_NAME ?? 'ResearchPaper',

    // Document processing configuration
    MAX_FILE_SIZE_BYTES: process.env.MAX_FILE_SIZE_BYTES ?? '10485760',
    SUPPORTED_FILE_TYPES: process.env.SUPPORTED_FILE_TYPES ?? 'pdf,docx,txt',
    UPLOAD_TIMEOUT_MS: process.env.UPLOAD_TIMEOUT_MS ?? '30000',

    // Analysis configuration
    ANALYSIS_TIMEOUT_MS: process.env.ANALYSIS_TIMEOUT_MS ?? '300000',
    MAX_CONCURRENT_ANALYSES: process.env.MAX_CONCURRENT_ANALYSES ?? '5',
    ANALYSIS_CACHE_TTL: process.env.ANALYSIS_CACHE_TTL ?? '86400',

    // Security configuration
    CORS_ORIGINS: process.env.CORS_ORIGINS ?? 'https://www.pre-review.com,http://localhost:3000',
    RATE_LIMIT_REQUESTS: process.env.RATE_LIMIT_REQUESTS ?? '100',
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ?? '900000',

    // Logging configuration
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
    ENABLE_DEBUG_LOGS: process.env.ENABLE_DEBUG_LOGS ?? 'false',

    // Performance configuration
    ENABLE_CACHING: process.env.ENABLE_CACHING ?? 'true',
    CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS ?? '3600',
    MAX_RETRY_ATTEMPTS: process.env.MAX_RETRY_ATTEMPTS ?? '3',
    RETRY_DELAY_MS: process.env.RETRY_DELAY_MS ?? '1000',
  },
};

export default nextConfig;
