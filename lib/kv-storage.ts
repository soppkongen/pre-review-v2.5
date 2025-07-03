import { Redis } from '@upstash/redis'

// Initialize Redis client with Upstash credentials
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
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
      if (!existing) throw new Error('Analysis not found')
      
      existing.status = status
      if (error) existing.error = error
      
      await this.storeAnalysis(analysisId, existing)
    } catch (error) {
      console.error('Error updating analysis status:', error)
      throw new Error('Failed to update analysis status')
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

