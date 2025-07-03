import { Redis } from '@upstash/redis'

// Initialize Redis client with Upstash credentials
let redis: Redis;

try {
  // Try multiple possible environment variable combinations
  const url = process.env.KV_URL || process.env.KV_REST_API_URL || process.env.REDIS_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN

  if (!url || !token) {
    throw new Error('Missing required Redis credentials. Please check environment variables.')
  }
  
  redis = new Redis({
    url,
    token,
  })

  // Test the connection
  redis.ping().then(() => {
    console.log('Successfully connected to Redis')
  }).catch((error) => {
    console.error('Failed to ping Redis:', error)
  })

} catch (error) {
  console.error('Failed to initialize Redis client:', error)
  // Create a mock Redis client for development
  redis = {
    set: async () => true,
    get: async () => null,
    expire: async () => true,
    keys: async () => [],
    ping: async () => "PONG",
  } as any
}

export interface AnalysisResult {
  analysisId: string
  documentName: string
  reviewMode: string
  summary?: string
  status: 'processing' | 'completed' | 'failed'
  overallScore?: number
  confidence?: number
  rating?: string
  executiveSummary?: string
  keyFindings?: string[]
  strengths?: string[]
  improvements?: string[]
  detailedAnalysis?: {
    epistemicEvaluation: { score: number; description: string }
    methodologyAssessment: { score: number; description: string }
    paradigmIndependence: { score: number; description: string }
    reproducibility: { score: number; description: string }
  }
  agentAnalysis?: Array<{
    agent: string
    role: string
    confidence: number
    findings: string[]
    recommendations: string[]
  }>
  recommendations?: string[]
  timestamp: string
  processingTimeMs?: number
  error?: string
}

export class AnalysisStorage {
  // Test Redis connection
  static async ping(): Promise<boolean> {
    try {
      const result = await redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Redis ping failed:', error)
      throw error
    }
  }

  // Store analysis result
  static async storeAnalysis(analysisId: string, result: AnalysisResult): Promise<void> {
    try {
      await redis.set(`analysis:${analysisId}`, JSON.stringify(result))
      // Set expiration to 30 days
      await redis.expire(`analysis:${analysisId}`, 30 * 24 * 60 * 60)
    } catch (error) {
      console.error('Error storing analysis:', error)
      throw new Error('Failed to store analysis result')
    }
  }

  // Retrieve analysis result
  static async getAnalysis(analysisId: string): Promise<AnalysisResult | null> {
    try {
      const result = await redis.get(`analysis:${analysisId}`)
      if (!result) return null
      return JSON.parse(result as string) as AnalysisResult
    } catch (error) {
      console.error('Error retrieving analysis:', error)
      return null
    }
  }

  // Update analysis status
  static async updateAnalysisStatus(
    analysisId: string, 
    status: 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      const existing = await this.getAnalysis(analysisId)
      
      // If analysis doesn't exist, create a new one
      const analysis: AnalysisResult = existing || {
        analysisId,
        documentName: 'Unknown',
        reviewMode: 'full',
        status: 'processing',
        timestamp: new Date().toISOString()
      }
      
      analysis.status = status
      if (error) analysis.error = error
      
      await this.storeAnalysis(analysisId, analysis)
    } catch (error) {
      console.error('Error updating analysis status:', error)
      // Don't throw here, just log the error
      console.warn(`Failed to update analysis status for ID ${analysisId} to ${status}`)
    }
  }

  // Store document chunks in KV for processing
  static async storeDocumentChunks(analysisId: string, chunks: string[]): Promise<void> {
    try {
      await redis.set(`chunks:${analysisId}`, JSON.stringify(chunks))
      // Set expiration to 7 days for chunks
      await redis.expire(`chunks:${analysisId}`, 7 * 24 * 60 * 60)
    } catch (error) {
      console.error('Error storing document chunks:', error)
      throw new Error('Failed to store document chunks')
    }
  }

  // Retrieve document chunks
  static async getDocumentChunks(analysisId: string): Promise<string[] | null> {
    try {
      const result = await redis.get(`chunks:${analysisId}`)
      if (!result) return null
      return JSON.parse(result as string) as string[]
    } catch (error) {
      console.error('Error retrieving document chunks:', error)
      return null
    }
  }

  // List recent analyses (for admin/debugging)
  static async listRecentAnalyses(limit: number = 10): Promise<string[]> {
    try {
      const keys = await redis.keys('analysis:*')
      return keys.slice(0, limit)
    } catch (error) {
      console.error('Error listing analyses:', error)
      return []
    }
  }
}

// Wrapper function for API routes to get analysis results
export async function getAnalysisResult(analysisId: string): Promise<AnalysisResult | null> {
  return await AnalysisStorage.getAnalysis(analysisId)
}
