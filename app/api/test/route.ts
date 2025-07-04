import { NextRequest, NextResponse } from 'next/server'
import { RealDocumentProcessor } from '@/lib/real-document-processor'
import { initializeWeaviateSchema, searchPhysicsKnowledge } from '@/lib/weaviate'
import { AnalysisStorage } from '@/lib/kv-storage'
import { KnowledgeBaseService } from '@/lib/services/knowledge-base'
import { getConfig, getKVConfig, getWeaviateConfig, getOpenAIConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const config = getConfig()
    
    // Test configuration
    const configTest = {
      hasOpenAI: !!config.OPENAI_API_KEY,
      hasWeaviate: !!(config.WEAVIATE_URL && config.WEAVIATE_API_KEY),
      hasKV: !!(config.KV_REST_API_URL && config.KV_REST_API_TOKEN),
      nodeEnv: config.NODE_ENV,
      isProduction: config.IS_PRODUCTION,
      isDevelopment: config.IS_DEVELOPMENT
    }
    
    // Test KV storage connection
    let kvTest = { connected: false, error: null as string | null }
    try {
      await AnalysisStorage.ping()
      kvTest.connected = true
    } catch (error) {
      kvTest.error = error instanceof Error ? error.message : 'Unknown error'
    }
    
    // Test Weaviate connection
    let weaviateTest = { connected: false, error: null as string | null }
    try {
      const results = await searchPhysicsKnowledge('test', 1)
      weaviateTest.connected = true
    } catch (error) {
      weaviateTest.error = error instanceof Error ? error.message : 'Unknown error'
    }
    
    // Test document processor
    let processorTest = { working: false, error: null as string | null }
    try {
      const testFile = new File(['Test content'], 'test.txt', { type: 'text/plain' })
      const processed = await RealDocumentProcessor.processFile(testFile)
      processorTest.working = !!processed && !!processed.chunks
    } catch (error) {
      processorTest.error = error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      config: configTest,
      kvStorage: kvTest,
      weaviate: weaviateTest,
      documentProcessor: processorTest,
      summary: {
        allServicesWorking: configTest.hasOpenAI && configTest.hasWeaviate && configTest.hasKV && kvTest.connected && weaviateTest.connected && processorTest.working,
        missingConfig: {
          openai: !configTest.hasOpenAI,
          weaviate: !configTest.hasWeaviate,
          kv: !configTest.hasKV
        },
        connectionIssues: {
          kv: !kvTest.connected,
          weaviate: !weaviateTest.connected,
          processor: !processorTest.working
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
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