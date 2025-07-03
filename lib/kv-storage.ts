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
      throw error
    }
  }

  static async storeAnalysis(analysisId: string, result: AnalysisResult): Promise<void> {
    try {
      // Check if result is already a string
      const resultString = typeof result === 'string' ? result : JSON.stringify(result)
      await redis.set(`analysis:${analysisId}`, resultString)
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
      
      // Handle both string and object responses from Redis
      if (typeof result === 'object') {
        return result as AnalysisResult
      }
      
      return JSON.parse(result) as AnalysisResult
    } catch (error) {
      console.error('Error retrieving analysis:', error)
      throw error
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
        // If no existing result, create a new one
        const newResult: AnalysisResult = {
          analysisId,
          documentName: 'Unknown',  // We don't have this info at this point
          reviewMode: 'standard',   // Default value
          status,
          timestamp: new Date().toISOString()
        }
        if (error) newResult.error = error
        await this.storeAnalysis(analysisId, newResult)
        return
      }

      existingResult.status = status
      if (error) existingResult.error = error
      await this.storeAnalysis(analysisId, existingResult)
    } catch (error) {
      console.error('Error updating analysis status:', error)
      throw error
    }
  }
}
