// Centralized configuration for the Pre-Review Platform
export interface AppConfig {
  // Environment
  NODE_ENV: string
  IS_PRODUCTION: boolean
  IS_DEVELOPMENT: boolean
  
  // Application
  APP_NAME: string
  APP_VERSION: string
  APP_URL: string
  
  // OpenAI Configuration
  OPENAI_API_KEY: string
  OPENAI_MODEL: string
  OPENAI_MAX_TOKENS: number
  OPENAI_TEMPERATURE: number
  
  // Weaviate Configuration
  WEAVIATE_URL: string
  WEAVIATE_API_KEY: string
  WEAVIATE_CLASS_NAME: string
  
  // Redis/KV Storage Configuration
  KV_REST_API_URL: string
  KV_REST_API_TOKEN: string
  KV_TTL_SECONDS: number
  
  // Document Processing
  MAX_FILE_SIZE_BYTES: number
  SUPPORTED_FILE_TYPES: string[]
  UPLOAD_TIMEOUT_MS: number
  
  // Analysis Configuration
  ANALYSIS_TIMEOUT_MS: number
  MAX_CONCURRENT_ANALYSES: number
  ANALYSIS_CACHE_TTL: number
  
  // Security
  CORS_ORIGINS: string[]
  RATE_LIMIT_REQUESTS: number
  RATE_LIMIT_WINDOW_MS: number
  
  // Logging
  LOG_LEVEL: string
  ENABLE_DEBUG_LOGS: boolean
  
  // Performance
  ENABLE_CACHING: boolean
  CACHE_TTL_SECONDS: number
  MAX_RETRY_ATTEMPTS: number
  RETRY_DELAY_MS: number
}

// Default configuration values
const DEFAULT_CONFIG: Partial<AppConfig> = {
  NODE_ENV: 'development',
  APP_NAME: 'Pre-Review Platform',
  APP_VERSION: '2.5.0',
  APP_URL: 'https://www.pre-review.com/',
  
  // OpenAI defaults
  OPENAI_MODEL: 'gpt-4-turbo-preview',
  OPENAI_MAX_TOKENS: 4000,
  OPENAI_TEMPERATURE: 0.7,
  
  // Weaviate defaults
  WEAVIATE_CLASS_NAME: 'ResearchPaper',
  
  // KV Storage defaults
  KV_TTL_SECONDS: 30 * 24 * 60 * 60, // 30 days
  
  // Document processing defaults
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['pdf', 'docx', 'txt'],
  UPLOAD_TIMEOUT_MS: 30000, // 30 seconds
  
  // Analysis defaults
  ANALYSIS_TIMEOUT_MS: 300000, // 5 minutes
  MAX_CONCURRENT_ANALYSES: 5,
  ANALYSIS_CACHE_TTL: 24 * 60 * 60, // 24 hours
  
  // Security defaults
  CORS_ORIGINS: ['https://www.pre-review.com', 'http://localhost:3000'],
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  
  // Logging defaults
  LOG_LEVEL: 'info',
  ENABLE_DEBUG_LOGS: false,
  
  // Performance defaults
  ENABLE_CACHING: true,
  CACHE_TTL_SECONDS: 3600, // 1 hour
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
}

// Environment variable mapping
const ENV_MAPPING: Record<keyof AppConfig, string> = {
  NODE_ENV: 'NODE_ENV',
  IS_PRODUCTION: 'NODE_ENV',
  IS_DEVELOPMENT: 'NODE_ENV',
  APP_NAME: 'NEXT_PUBLIC_APP_NAME',
  APP_VERSION: 'NEXT_PUBLIC_APP_VERSION',
  APP_URL: 'NEXT_PUBLIC_APP_URL',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENAI_MODEL: 'OPENAI_MODEL',
  OPENAI_MAX_TOKENS: 'OPENAI_MAX_TOKENS',
  OPENAI_TEMPERATURE: 'OPENAI_TEMPERATURE',
  WEAVIATE_URL: 'WEAVIATE_URL',
  WEAVIATE_API_KEY: 'WEAVIATE_API_KEY',
  WEAVIATE_CLASS_NAME: 'WEAVIATE_CLASS_NAME',
  KV_REST_API_URL: 'KV_REST_API_URL',
  KV_REST_API_TOKEN: 'KV_REST_API_TOKEN',
  KV_TTL_SECONDS: 'KV_TTL_SECONDS',
  MAX_FILE_SIZE_BYTES: 'MAX_FILE_SIZE_BYTES',
  SUPPORTED_FILE_TYPES: 'SUPPORTED_FILE_TYPES',
  UPLOAD_TIMEOUT_MS: 'UPLOAD_TIMEOUT_MS',
  ANALYSIS_TIMEOUT_MS: 'ANALYSIS_TIMEOUT_MS',
  MAX_CONCURRENT_ANALYSES: 'MAX_CONCURRENT_ANALYSES',
  ANALYSIS_CACHE_TTL: 'ANALYSIS_CACHE_TTL',
  CORS_ORIGINS: 'CORS_ORIGINS',
  RATE_LIMIT_REQUESTS: 'RATE_LIMIT_REQUESTS',
  RATE_LIMIT_WINDOW_MS: 'RATE_LIMIT_WINDOW_MS',
  LOG_LEVEL: 'LOG_LEVEL',
  ENABLE_DEBUG_LOGS: 'ENABLE_DEBUG_LOGS',
  ENABLE_CACHING: 'ENABLE_CACHING',
  CACHE_TTL_SECONDS: 'CACHE_TTL_SECONDS',
  MAX_RETRY_ATTEMPTS: 'MAX_RETRY_ATTEMPTS',
  RETRY_DELAY_MS: 'RETRY_DELAY_MS',
}

// Configuration loader with validation
export function loadConfig(): AppConfig {
  const config = { ...DEFAULT_CONFIG } as AppConfig
  
  // Load environment variables
  for (const [key, envVar] of Object.entries(ENV_MAPPING)) {
    const value = process.env[envVar]
    if (value !== undefined) {
      const configKey = key as keyof AppConfig
      // Type conversion based on expected type
      if (typeof DEFAULT_CONFIG[configKey] === 'number') {
        (config as any)[configKey] = Number(value)
      } else if (typeof DEFAULT_CONFIG[configKey] === 'boolean') {
        (config as any)[configKey] = (value === 'true' || value === '1')
      } else if (Array.isArray(DEFAULT_CONFIG[configKey])) {
        (config as any)[configKey] = value.split(',').map(v => v.trim())
      } else {
        (config as any)[configKey] = value
      }
    }
  }
  
  // Compute derived values
  config.IS_PRODUCTION = config.NODE_ENV === 'production'
  config.IS_DEVELOPMENT = config.NODE_ENV === 'development'
  
  // Validate required configuration
  validateConfig(config)
  
  return config
}

// Configuration validation
function validateConfig(config: AppConfig): void {
  const required = [
    'OPENAI_API_KEY',
    'WEAVIATE_URL',
    'WEAVIATE_API_KEY',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN'
  ]
  
  const missing = required.filter(key => !config[key as keyof AppConfig])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Export singleton configuration instance
export const config = loadConfig()

// Utility functions for configuration access
export function getConfig(): AppConfig {
  return config
}

export function getConfigValue<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return config[key]
}

export function isProduction(): boolean {
  return config.IS_PRODUCTION
}

export function isDevelopment(): boolean {
  return config.IS_DEVELOPMENT
}

export function getOpenAIConfig() {
  return {
    apiKey: config.OPENAI_API_KEY,
    model: config.OPENAI_MODEL,
    maxTokens: config.OPENAI_MAX_TOKENS,
    temperature: config.OPENAI_TEMPERATURE,
  }
}

export function getWeaviateConfig() {
  return {
    url: config.WEAVIATE_URL,
    apiKey: config.WEAVIATE_API_KEY,
    className: config.WEAVIATE_CLASS_NAME,
  }
}

export function getKVConfig() {
  return {
    url: config.KV_REST_API_URL,
    token: config.KV_REST_API_TOKEN,
    ttl: config.KV_TTL_SECONDS,
  }
}

export function getDocumentConfig() {
  return {
    maxFileSize: config.MAX_FILE_SIZE_BYTES,
    supportedTypes: config.SUPPORTED_FILE_TYPES,
    uploadTimeout: config.UPLOAD_TIMEOUT_MS,
  }
}

export function getAnalysisConfig() {
  return {
    timeout: config.ANALYSIS_TIMEOUT_MS,
    maxConcurrent: config.MAX_CONCURRENT_ANALYSES,
    cacheTtl: config.ANALYSIS_CACHE_TTL,
  }
}

export function getSecurityConfig() {
  return {
    corsOrigins: config.CORS_ORIGINS,
    rateLimitRequests: config.RATE_LIMIT_REQUESTS,
    rateLimitWindow: config.RATE_LIMIT_WINDOW_MS,
  }
}

export function getPerformanceConfig() {
  return {
    enableCaching: config.ENABLE_CACHING,
    cacheTtl: config.CACHE_TTL_SECONDS,
    maxRetries: config.MAX_RETRY_ATTEMPTS,
    retryDelay: config.RETRY_DELAY_MS,
  }
} 