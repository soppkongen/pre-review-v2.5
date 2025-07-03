import { Redis } from '@upstash/redis'

if (!process.env.KV_REST_API_URL) {
  throw new Error('KV_REST_API_URL is not defined')
}
if (!process.env.KV_REST_API_TOKEN) {
  throw new Error('KV_REST_API_TOKEN is not defined')
}

// Initialize Redis client with Vercel KV credentials
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
})

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
  static async ping(): Promise<boolean> {
    try {
      const result = await redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Storage ping failed:', error)
      throw error // Let the caller handle the error
    }
  }

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

  static async getAnalysis(analysisId: string): Promise<AnalysisResult | null> {
    try {
      const result = await redis.get(`analysis:${analysisId}`)
      if (!result) return null
      return JSON.parse(result as string) as AnalysisResult
    } catch (error) {
      console.error('Error retrieving analysis:', error)
      throw error // Let the caller handle the error
    }
  }

  static async updateAnalysisStatus(
    analysisId: string, 
    status: 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      const existingResult = await this.getAnalysis(analysisId)
      if (!existingResult) {
        throw new Error(`Analysis ${analysisId} not found`)
      }
      existingResult.status = status
      if (error) existingResult.error = error
      await this.storeAnalysis(analysisId, existingResult)
    } catch (error) {
      console.error('Error updating analysis status:', error)
      throw error // Let the caller handle the error
    }
  }
}
