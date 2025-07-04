import { Redis } from '@upstash/redis'

// Initialize Redis client with Vercel KV credentials
const getRedisClient = () => {
  if (!process.env.KV_REST_API_URL) {
    throw new Error('KV_REST_API_URL is not defined')
  }
  if (!process.env.KV_REST_API_TOKEN) {
    throw new Error('KV_REST_API_TOKEN is not defined')
  }

  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN
  })
}

// Create the redis client lazily
let redis: Redis | null = null

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
  private static getRedis(): Redis {
    if (!redis) {
      redis = getRedisClient()
    }
    return redis
  }

  static async ping(): Promise<boolean> {
    try {
      const result = await this.getRedis().ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Storage ping failed:', error)
      throw error
    }
  }

  static async storeAnalysis(analysisId: string, result: AnalysisResult): Promise<void> {
    try {
      const resultString = JSON.stringify(result)
      await this.getRedis().set(`analysis:${analysisId}`, resultString)
      await this.getRedis().expire(`analysis:${analysisId}`, 30 * 24 * 60 * 60)
    } catch (error) {
      console.error('Error storing analysis:', error)
      throw new Error('Failed to store analysis result')
    }
  }

  static async getAnalysis(analysisId: string): Promise<AnalysisResult | null> {
    try {
      const result = await this.getRedis().get(`analysis:${analysisId}`)
      if (!result) return null
      try {
        // Always parse the result as we always store it as a string
        return JSON.parse(result as string) as AnalysisResult
      } catch (parseError) {
        console.error('Failed to parse analysis result from storage:', result)
        return null
      }
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
        // Create a new result if none exists
        const newResult: AnalysisResult = {
          analysisId,
          documentName: 'Unknown',
          reviewMode: 'standard',
          status,
          timestamp: new Date().toISOString()
        }
        if (error) newResult.error = typeof error === 'string' ? error : JSON.stringify(error)
        await this.storeAnalysis(analysisId, newResult)
        return
      }
      existingResult.status = status
      if (error) existingResult.error = typeof error === 'string' ? error : JSON.stringify(error)
      await this.storeAnalysis(analysisId, existingResult)
    } catch (error) {
      console.error('Error updating analysis status:', error)
      throw error
    }
  }
}

export async function getAnalysisResult(analysisId: string) {
  return AnalysisStorage.getAnalysis(analysisId);
}
