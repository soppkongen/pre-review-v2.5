# Environment Variables Configuration

This document describes all environment variables used in the Pre-Review Platform v2.5.

## 🔐 Required Environment Variables

These variables must be set for the application to function properly:

### Core Services
- `OPENAI_API_KEY` - Your OpenAI API key for AI analysis
- `WEAVIATE_URL` - Your Weaviate Cloud cluster URL
- `WEAVIATE_API_KEY` - Your Weaviate Cloud API key
- `KV_REST_API_URL` - Your Upstash Redis REST API URL
- `KV_REST_API_TOKEN` - Your Upstash Redis REST API token

## ⚙️ Optional Configuration Variables

### Application Settings
- `NEXT_PUBLIC_APP_NAME` - Application name (default: "Pre-Review Platform")
- `NEXT_PUBLIC_APP_VERSION` - Application version (default: "2.5.0")
- `NEXT_PUBLIC_APP_URL` - Application URL (default: "https://www.pre-review.com/")

### OpenAI Configuration
- `OPENAI_MODEL` - OpenAI model to use (default: "gpt-4-turbo-preview")
- `OPENAI_MAX_TOKENS` - Maximum tokens per request (default: 4000)
- `OPENAI_TEMPERATURE` - Model temperature (default: 0.7)

### Weaviate Configuration
- `WEAVIATE_CLASS_NAME` - Weaviate class name for papers (default: "ResearchPaper")

### Document Processing
- `MAX_FILE_SIZE_BYTES` - Maximum file size in bytes (default: 10485760 = 10MB)
- `SUPPORTED_FILE_TYPES` - Comma-separated list of supported file types (default: "pdf,docx,txt")
- `UPLOAD_TIMEOUT_MS` - Upload timeout in milliseconds (default: 30000 = 30s)

### Analysis Configuration
- `ANALYSIS_TIMEOUT_MS` - Analysis timeout in milliseconds (default: 300000 = 5min)
- `MAX_CONCURRENT_ANALYSES` - Maximum concurrent analyses (default: 5)
- `ANALYSIS_CACHE_TTL` - Analysis cache TTL in seconds (default: 86400 = 24h)

### Security Configuration
- `CORS_ORIGINS` - Comma-separated list of allowed CORS origins (default: "https://www.pre-review.com,http://localhost:3000")
- `RATE_LIMIT_REQUESTS` - Rate limit requests per window (default: 100)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds (default: 900000 = 15min)

### Logging Configuration
- `LOG_LEVEL` - Logging level (default: "info")
- `ENABLE_DEBUG_LOGS` - Enable debug logging (default: "false")

### Performance Configuration
- `ENABLE_CACHING` - Enable caching (default: "true")
- `CACHE_TTL_SECONDS` - Cache TTL in seconds (default: 3600 = 1h)
- `MAX_RETRY_ATTEMPTS` - Maximum retry attempts (default: 3)
- `RETRY_DELAY_MS` - Retry delay in milliseconds (default: 1000 = 1s)

## 📝 Example .env.local File

```env
# Required - Core Services
OPENAI_API_KEY=sk-your-openai-api-key-here
WEAVIATE_URL=https://your-cluster.weaviate.cloud
WEAVIATE_API_KEY=your-weaviate-api-key-here
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your-upstash-token-here

# Optional - Application Settings
NEXT_PUBLIC_APP_NAME=Pre-Review Platform
NEXT_PUBLIC_APP_VERSION=2.5.0
NEXT_PUBLIC_APP_URL=https://www.pre-review.com/

# Optional - OpenAI Configuration
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7

# Optional - Weaviate Configuration
WEAVIATE_CLASS_NAME=ResearchPaper

# Optional - Document Processing
MAX_FILE_SIZE_BYTES=10485760
SUPPORTED_FILE_TYPES=pdf,docx,txt
UPLOAD_TIMEOUT_MS=30000

# Optional - Analysis Configuration
ANALYSIS_TIMEOUT_MS=300000
MAX_CONCURRENT_ANALYSES=5
ANALYSIS_CACHE_TTL=86400

# Optional - Security Configuration
CORS_ORIGINS=https://www.pre-review.com,http://localhost:3000
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Optional - Logging Configuration
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=false

# Optional - Performance Configuration
ENABLE_CACHING=true
CACHE_TTL_SECONDS=3600
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=1000
```

## 🚀 Deployment Configuration

### Vercel Deployment
For Vercel deployment, set these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each required variable with the appropriate value
4. Redeploy your application

### Local Development
For local development:

1. Create a `.env.local` file in your project root
2. Add the required environment variables
3. Restart your development server

## 🔍 Configuration Validation

The application includes built-in configuration validation that will:

1. Check for required environment variables on startup
2. Validate URL formats and API key presence
3. Log configuration status in development mode
4. Provide clear error messages for missing configuration

## 📊 Configuration Testing

Use the `/api/test` endpoint to verify your configuration:

```bash
curl https://your-app.vercel.app/api/test
```

This will return a comprehensive status report including:
- Environment variable presence
- Service connectivity
- Configuration validation results

## 🔧 Configuration Management

The application uses a centralized configuration system located in `lib/config.ts` that:

- Loads all environment variables with proper type conversion
- Provides default values for optional settings
- Validates required configuration on startup
- Offers utility functions for accessing configuration values
- Supports different environments (development, production)

## 🛡️ Security Notes

- Never commit API keys or sensitive tokens to version control
- Use environment variables for all sensitive configuration
- Regularly rotate API keys and tokens
- Monitor API usage and costs
- Use appropriate CORS settings for production 