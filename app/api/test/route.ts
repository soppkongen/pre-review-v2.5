import { NextRequest, NextResponse } from 'next/server'
import { RealDocumentProcessor } from '@/lib/real-document-processor'
import { initializeWeaviateSchema, searchPhysicsKnowledge } from '@/lib/weaviate'
import { AnalysisStorage } from '@/lib/kv-storage'
import { KnowledgeBaseService } from '@/lib/services/knowledge-base'
import { getConfig, getKVConfig, getWeaviateConfig, getOpenAIConfig } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST] Testing environment configuration...')
    
    // Test 1: Check environment variables
    const kvConfig = getKVConfig()
    const envCheck = {
      hasKVUrl: !!kvConfig.url,
      hasKVToken: !!kvConfig.token,
      kvUrl: kvConfig.url ? 'Set' : 'Missing',
      kvToken: kvConfig.token ? 'Set' : 'Missing'
    }
    
    console.log('[TEST] Environment check:', envCheck)
    
    if (!envCheck.hasKVUrl || !envCheck.hasKVToken) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        details: envCheck,
        message: 'Please set KV_REST_API_URL and KV_REST_API_TOKEN in your .env.local file'
      }, {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      })
    }
    
    // Test 2: Ping the storage
    console.log('[TEST] Testing KV storage connection...')
    const pingResult = await AnalysisStorage.ping()
    console.log('[TEST] Ping result:', pingResult)
    
    // Test 3: Store a test analysis
    const testId = 'test-analysis-' + Date.now()
    const testAnalysis = {
      analysisId: testId,
      documentName: 'Test Document',
      reviewMode: 'test',
      status: 'completed' as const,
      overallScore: 8.5,
      confidence: 0.9,
      summary: 'This is a test analysis',
      keyFindings: ['Test finding 1', 'Test finding 2'],
      strengths: ['Test strength 1'],
      weaknesses: ['Test weakness 1'],
      recommendations: ['Test recommendation 1'],
      agentAnalysis: [{
        agent: 'Test Agent',
        role: 'Test Role',
        confidence: 0.8,
        findings: ['Test agent finding'],
        recommendations: ['Test agent recommendation']
      }],
      detailedAnalysis: {
        epistemicEvaluation: {
          score: 8,
          description: 'Test epistemic evaluation',
          issues: []
        },
        methodologyAssessment: {
          score: 7,
          description: 'Test methodology assessment',
          strengths: [],
          concerns: []
        },
        paradigmIndependence: {
          score: 9,
          description: 'Test paradigm independence',
          biases: []
        },
        reproducibility: {
          score: 8,
          description: 'Test reproducibility',
          factors: []
        }
      },
      timestamp: new Date().toISOString()
    }
    
    console.log('[TEST] Storing test analysis...')
    await AnalysisStorage.storeAnalysis(testId, testAnalysis)
    
    // Test 4: Retrieve the test analysis
    console.log('[TEST] Retrieving test analysis...')
    const retrievedAnalysis = await AnalysisStorage.getAnalysis(testId)
    console.log('[TEST] Retrieved analysis:', retrievedAnalysis)
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      pingResult,
      testId,
      stored: testAnalysis,
      retrieved: retrievedAnalysis,
      match: JSON.stringify(testAnalysis) === JSON.stringify(retrievedAnalysis)
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
  } catch (error) {
    console.error('[TEST] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    })
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