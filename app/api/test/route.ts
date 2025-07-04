import { NextRequest, NextResponse } from 'next/server'
import { RealDocumentProcessor } from '@/lib/real-document-processor'
import { initializeWeaviateSchema, searchPhysicsKnowledge } from '@/lib/weaviate'
import { AnalysisStorage } from '@/lib/kv-storage'
import { KnowledgeBaseService } from '@/lib/services/knowledge-base'
import { getConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  const testResults = {
    timestamp: new Date().toISOString(),
    status: 'running',
    tests: {} as any,
    errors: [] as string[]
  }

  try {
    // Test 1: Environment Variables
    const config = getConfig()
    testResults.tests.environment = {
      weaviate_url: !!config.WEAVIATE_URL,
      weaviate_api_key: !!config.WEAVIATE_API_KEY,
      openai_api_key: !!config.OPENAI_API_KEY,
      kv_rest_api_url: !!config.KV_REST_API_URL,
      kv_rest_api_token: !!config.KV_REST_API_TOKEN,
      app_name: config.APP_NAME,
      app_version: config.APP_VERSION,
      node_env: config.NODE_ENV
    }

    // Test 2: Document Processor
    try {
      const supportedTypes = RealDocumentProcessor.getSupportedFileTypes()
      const maxSize = RealDocumentProcessor.getMaxFileSize()
      testResults.tests.documentProcessor = {
        supportedTypes,
        maxSize,
        status: 'working'
      }
    } catch (error) {
      testResults.tests.documentProcessor = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
      testResults.errors.push(`Document Processor: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Test 3: Weaviate Connection
    try {
      await initializeWeaviateSchema()
      testResults.tests.weaviate = { status: 'connected' }
    } catch (error) {
      testResults.tests.weaviate = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
      testResults.errors.push(`Weaviate: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Test 4: Knowledge Base Search
    try {
      const results = await searchPhysicsKnowledge('quantum mechanics', 2)
      testResults.tests.knowledgeSearch = {
        status: 'working',
        resultsCount: results.length
      }
    } catch (error) {
      testResults.tests.knowledgeSearch = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
      testResults.errors.push(`Knowledge Search: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Test 5: Redis Storage
    try {
      const pingResult = await AnalysisStorage.ping()
      testResults.tests.redis = {
        status: pingResult ? 'connected' : 'failed',
        ping: pingResult
      }
    } catch (error) {
      testResults.tests.redis = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
      testResults.errors.push(`Redis: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Test 6: Knowledge Base Service
    try {
      const knowledgeService = new KnowledgeBaseService()
      const stats = await knowledgeService.getKnowledgeStats()
      testResults.tests.knowledgeService = {
        status: 'working',
        totalConcepts: stats.totalConcepts
      }
    } catch (error) {
      testResults.tests.knowledgeService = { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' }
      testResults.errors.push(`Knowledge Service: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Determine overall status
    const failedTests = Object.values(testResults.tests).filter((test: any) => test.status === 'failed').length
    testResults.status = failedTests === 0 ? 'all_passing' : `${failedTests}_tests_failed`

    return NextResponse.json(testResults, { 
      status: failedTests === 0 ? 200 : 503 
    })

  } catch (error) {
    testResults.status = 'error'
    testResults.errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return NextResponse.json(testResults, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testType, data } = body

    switch (testType) {
      case 'document_processing':
        // Test document processing with sample data
        const sampleText = data?.content || 'This is a sample physics document for testing.'
        const mockFile = new File([sampleText], 'test.txt', { type: 'text/plain' })
        
        const processed = await RealDocumentProcessor.processFile(mockFile)
        
        return NextResponse.json({
          success: true,
          testType: 'document_processing',
          result: {
            chunks: processed.chunks.length,
            metadata: processed.metadata
          }
        })

      case 'knowledge_search':
        // Test knowledge search
        const query = data?.query || 'quantum mechanics'
        const results = await searchPhysicsKnowledge(query, 5)
        
        return NextResponse.json({
          success: true,
          testType: 'knowledge_search',
          result: {
            query,
            resultsCount: results.length,
            sampleResults: results.slice(0, 2)
          }
        })

      case 'storage':
        // Test storage operations
        const testId = `test-${Date.now()}`
        const testData = {
          analysisId: testId,
          documentName: 'test-document',
          reviewMode: 'test',
          status: 'completed' as const,
          timestamp: new Date().toISOString()
        }
        
        await AnalysisStorage.storeAnalysis(testId, testData)
        const retrieved = await AnalysisStorage.getAnalysis(testId)
        
        return NextResponse.json({
          success: true,
          testType: 'storage',
          result: {
            stored: !!retrieved,
            retrieved: retrieved
          }
        })

      default:
        return NextResponse.json(
          { error: 'Unknown test type' },
          { status: 400 }
        )
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 