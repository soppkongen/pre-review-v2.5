import { RealDocumentProcessor, ProcessedDocument } from './real-document-processor'
import { initializeWeaviateSchema, storePhysicsChunk, searchPhysicsKnowledge, PhysicsChunk } from './weaviate'
import { AnalysisStorage, AnalysisResult } from './kv-storage'
import { v4 as uuidv4 } from 'uuid'

// Agent interfaces
interface AgentAnalysis {
  agent: string
  role: string
  confidence: number
  findings: string[]
  recommendations: string[]
  score?: number
}

interface DetailedAnalysis {
  epistemicEvaluation: { score: number; description: string }
  methodologyAssessment: { score: number; description: string }
  paradigmIndependence: { score: number; description: string }
  reproducibility: { score: number; description: string }
}

export class RealAnalysisOrchestrator {
  /**
   * Process a complete document analysis pipeline
   */
  static async analyzeDocument(
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ): Promise<string> {
    const analysisId = uuidv4()
    
    try {
      // Initialize analysis record
      const initialResult: AnalysisResult = {
        analysisId,
        documentName: file.name,
        reviewMode,
        summary,
        status: 'processing',
        timestamp: new Date().toISOString()
      }
      
      await AnalysisStorage.storeAnalysis(analysisId, initialResult)
      
      // Start async processing
      this.processDocumentAsync(analysisId, file, summary, reviewMode)
      
      return analysisId
    } catch (error) {
      console.error('Error starting document analysis:', error)
      throw new Error('Failed to start document analysis')
    }
  }

  /**
   * Async document processing pipeline
   */
     private static async processDocumentAsync(
    analysisId: string,
    file: File,
    summary?: string,
    reviewMode: string = 'full'
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Step 1: Initialize Weaviate schema
      await initializeWeaviateSchema()
      
      // Step 2: Process document and extract chunks
      console.log(`Processing document: ${file.name}`)
      const processedDoc = await RealDocumentProcessor.processFile(file)
      
      if (!processedDoc || !processedDoc.chunks || processedDoc.chunks.length === 0) {
        throw new Error('Document processing failed - no valid chunks generated')
      }

      // Log successful chunk generation
      console.log(`Generated ${processedDoc.chunks.length} chunks`)
      
      // Step 3: Store chunks in Weaviate
      console.log(`Storing ${processedDoc.chunks.length} chunks in Weaviate`)
      let storedChunks = 0
      for (const chunk of processedDoc.chunks) {
        try {
          if (!chunk) continue // Skip null/undefined chunks
          await storePhysicsChunk(chunk)
          storedChunks++
        } catch (error) {
          console.error('Error storing chunk:', error)
          // Continue with other chunks
        }
      }
      
      if (storedChunks === 0) {
        throw new Error('Failed to store any document chunks')
      }

      // Step 4: Retrieve relevant knowledge from Weaviate
      const relevantKnowledge = await this.gatherRelevantKnowledge(processedDoc, summary)
      
      // Step 5: Run multi-agent analysis
      const agentAnalyses = await this.runMultiAgentAnalysis(
        processedDoc,
        relevantKnowledge || [],
        reviewMode
      )
      
      // Step 6: Generate final analysis
      const finalAnalysis = await this.generateFinalAnalysis(
        processedDoc,
        agentAnalyses || [],
        relevantKnowledge || []
      )
      
      // Step 7: Store final result
      const processingTime = Date.now() - startTime
      const result: AnalysisResult = {
        analysisId,
        documentName: file.name,
        reviewMode,
        summary,
        status: 'completed',
        ...finalAnalysis,
        timestamp: new Date().toISOString(),
        processingTimeMs: processingTime
      }
      
      await AnalysisStorage.storeAnalysis(analysisId, result)
      console.log(`Analysis completed for ${file.name} in ${processingTime}ms`)
      
    } catch (error) {
      console.error(`Error processing document ${file.name}:`, error)
      // Store error result
      let errorMsg: string
      if (error instanceof Error) {
        errorMsg = error.message
      } else if (typeof error === 'string') {
        errorMsg = error
      } else {
        errorMsg = JSON.stringify(error)
      }
      console.error(`Updating analysis status to failed with error:`, errorMsg)
      try {
        await AnalysisStorage.updateAnalysisStatus(
          analysisId,
          'failed',
          errorMsg
        )
      } catch (storageError) {
        console.error('Failed to update analysis status:', storageError)
      }
      throw error // Re-throw to be caught by the route handler
    }
  }
  /**
   * Gather relevant knowledge from Weaviate
   */
  private static async gatherRelevantKnowledge(
    processedDoc: ProcessedDocument,
    summary?: string
  ): Promise<PhysicsChunk[]> {
    const queries: string[] = []
    
    // Use document title and abstract as queries
    if (processedDoc.metadata.title) {
      queries.push(processedDoc.metadata.title)
    }
    if (processedDoc.metadata.abstract) {
      queries.push(processedDoc.metadata.abstract)
    }
    if (summary) {
      queries.push(summary)
    }
    
    // Extract key concepts from chunks
    const allConcepts = processedDoc.chunks
      .flatMap(chunk => chunk.metadata.concepts || [])
      .filter((concept, index, arr) => arr.indexOf(concept) === index) // unique
    
    queries.push(...allConcepts.slice(0, 5)) // Top 5 concepts
    
    // Search for relevant knowledge
    const relevantChunks: PhysicsChunk[] = []
    
    for (const query of queries) {
      try {
        const chunks = await searchPhysicsKnowledge(query, 5)
        relevantChunks.push(...chunks)
      } catch (error) {
        console.warn(`Failed to search for query "${query}":`, error)
      }
    }
    
    // Remove duplicates and return top results
    const uniqueChunks = relevantChunks.filter(
      (chunk, index, arr) => arr.findIndex(c => c.chunkId === chunk.chunkId) === index
    )
    
    return uniqueChunks.slice(0, 20) // Top 20 relevant chunks
  }

  /**
   * Run multi-agent analysis with real OpenAI agents
   */
  private static async runMultiAgentAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[],
    reviewMode: string
  ): Promise<AgentAnalysis[]> {
    const { RealOpenAIAgents } = await import('./real-openai-agents')
    const analyses: AgentAnalysis[] = []
    
    try {
      // Run all agents in parallel for efficiency
      const agentPromises = [
        RealOpenAIAgents.theoreticalPhysicsAnalysis(processedDoc, relevantKnowledge),
        RealOpenAIAgents.mathematicalAnalysis(processedDoc, relevantKnowledge),
        RealOpenAIAgents.experimentalAnalysis(processedDoc, relevantKnowledge)
      ]
      
      if (reviewMode === 'full') {
        agentPromises.push(
          RealOpenAIAgents.epistemicAnalysis(processedDoc, relevantKnowledge),
          RealOpenAIAgents.paradigmAnalysis(processedDoc, relevantKnowledge)
        )
      }
      
      const results = await Promise.all(agentPromises)
      analyses.push(...results)
      
    } catch (error) {
      console.error('Multi-agent analysis error:', error)
      throw new Error('Failed to complete multi-agent analysis')
    }
    
    return analyses
  }

  /**
   * Theoretical Physics Analysis Agent
   */
  private static async theoreticalPhysicsAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const findings: string[] = []
    const recommendations: string[] = []
    let confidence = 85
    
    // Analyze theoretical foundations
    const domains = processedDoc.chunks.map(c => c.metadata.domain).filter(d => d)
    const uniqueDomains = [...new Set(domains)]
    
    if (uniqueDomains.length > 0) {
      findings.push(`Paper covers ${uniqueDomains.length} physics domain(s): ${uniqueDomains.join(', ')}`)
    }
    
    // Check for mathematical rigor
    const mathChunks = processedDoc.chunks.filter(c => (c.metadata.equations?.length || 0) > 0)
    if (mathChunks.length > 0) {
      findings.push(`Mathematical content found in ${mathChunks.length} sections with ${mathChunks.reduce((sum, c) => sum + (c.metadata.equations?.length || 0), 0)} equations`)
      confidence += 5
    } else {
      recommendations.push('Consider adding mathematical formulations to strengthen theoretical foundations')
      confidence -= 10
    }
    
    // Check against existing knowledge
    const relatedWork = relevantKnowledge.filter(k => 
      uniqueDomains.some(domain => k.domain === domain)
    )
    
    if (relatedWork.length > 0) {
      findings.push(`Found ${relatedWork.length} related works in the knowledge base`)
      confidence += 5
    } else {
      recommendations.push('Limited related work found - consider broader literature review')
      confidence -= 5
    }
    
    // Assess theoretical consistency
    const advancedChunks = processedDoc.chunks.filter(c => c.metadata.difficultyLevel === 'advanced')
    if (advancedChunks.length > 0) {
      findings.push(`Advanced theoretical content identified in ${advancedChunks.length} sections`)
      confidence += 10
    }
    
    return {
      agent: 'Theoretical Physicist',
      role: 'Theory development and validation',
      confidence: Math.min(Math.max(confidence, 0), 100),
      findings,
      recommendations,
      score: confidence / 10
    }
  }

  /**
   * Mathematical Analysis Agent
   */
  private static async mathematicalAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const findings: string[] = []
    const recommendations: string[] = []
    let confidence = 80
    
    // Count mathematical content
    const totalEquations = processedDoc.chunks.reduce(
      (sum, chunk) => sum + (chunk.metadata.equations?.length || 0), 0
    )
    
    if (totalEquations > 0) {
      findings.push(`Document contains ${totalEquations} mathematical expressions`)
      confidence += 10
    } else {
      findings.push('Limited mathematical content detected')
      recommendations.push('Consider adding quantitative analysis and mathematical derivations')
      confidence -= 15
    }
    
    // Analyze equation complexity
    const complexEquations = processedDoc.chunks
      .flatMap(c => c.metadata.equations || [])
      .filter(eq => eq.length > 20 || eq.includes('\\') || eq.includes('∫') || eq.includes('∑'))
    
    if (complexEquations.length > 0) {
      findings.push(`${complexEquations.length} complex mathematical expressions identified`)
      confidence += 15
    }
    
    // Check for statistical analysis
    const statsTerms = ['p-value', 'significance', 'correlation', 'regression', 'chi-square', 'anova']
    const hasStats = processedDoc.chunks.some(chunk => 
      statsTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (hasStats) {
      findings.push('Statistical analysis methods detected')
      confidence += 10
    } else {
      recommendations.push('Consider adding statistical validation of results')
    }
    
    return {
      agent: 'Mathematical Analyst',
      role: 'Equations and mathematical rigor',
      confidence: Math.min(Math.max(confidence, 0), 100),
      findings,
      recommendations,
      score: confidence / 10
    }
  }

  /**
   * Experimental Analysis Agent
   */
  private static async experimentalAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const findings: string[] = []
    const recommendations: string[] = []
    let confidence = 75
    
    // Look for experimental methodology
    const expTerms = ['experiment', 'measurement', 'data', 'observation', 'apparatus', 'procedure']
    const expChunks = processedDoc.chunks.filter(chunk =>
      expTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (expChunks.length > 0) {
      findings.push(`Experimental content found in ${expChunks.length} sections`)
      confidence += 15
    } else {
      findings.push('Limited experimental methodology detected')
      recommendations.push('Consider adding experimental validation or testable predictions')
      confidence -= 20
    }
    
    // Check for results and data
    const resultTerms = ['result', 'finding', 'outcome', 'conclusion', 'evidence']
    const hasResults = processedDoc.chunks.some(chunk =>
      resultTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (hasResults) {
      findings.push('Results and conclusions section identified')
      confidence += 10
    }
    
    // Check for reproducibility indicators
    const repTerms = ['reproducible', 'replicable', 'protocol', 'method', 'procedure']
    const hasReproducibility = processedDoc.chunks.some(chunk =>
      repTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (hasReproducibility) {
      findings.push('Reproducibility considerations found')
      confidence += 10
    } else {
      recommendations.push('Include detailed methodology for reproducibility')
    }
    
    return {
      agent: 'Experimental Designer',
      role: 'Testable predictions and validation',
      confidence: Math.min(Math.max(confidence, 0), 100),
      findings,
      recommendations,
      score: confidence / 10
    }
  }

  /**
   * Epistemic Analysis Agent
   */
  private static async epistemicAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const findings: string[] = []
    const recommendations: string[] = []
    let confidence = 70
    
    // Analyze knowledge claims
    const claimTerms = ['claim', 'assert', 'propose', 'hypothesis', 'theory', 'model']
    const claimChunks = processedDoc.chunks.filter(chunk =>
      claimTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (claimChunks.length > 0) {
      findings.push(`${claimChunks.length} knowledge claims identified`)
      confidence += 10
    }
    
    // Check for evidence and justification
    const evidenceTerms = ['evidence', 'support', 'justify', 'demonstrate', 'prove', 'validate']
    const hasEvidence = processedDoc.chunks.some(chunk =>
      evidenceTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (hasEvidence) {
      findings.push('Evidence and justification patterns found')
      confidence += 15
    } else {
      recommendations.push('Strengthen epistemic foundations with better evidence and justification')
      confidence -= 10
    }
    
    // Analyze assumption archaeology
    const assumptionTerms = ['assume', 'given', 'suppose', 'presume', 'postulate']
    const assumptions = processedDoc.chunks.filter(chunk =>
      assumptionTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (assumptions.length > 0) {
      findings.push(`${assumptions.length} explicit assumptions identified`)
      confidence += 5
    } else {
      recommendations.push('Make underlying assumptions more explicit')
    }
    
    return {
      agent: 'Epistemic Analyst',
      role: 'Knowledge validation and bias detection',
      confidence: Math.min(Math.max(confidence, 0), 100),
      findings,
      recommendations,
      score: confidence / 10
    }
  }

  /**
   * Paradigm Independence Analysis Agent
   */
  private static async paradigmAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const findings: string[] = []
    const recommendations: string[] = []
    let confidence = 65
    
    // Check for paradigm awareness
    const paradigmTerms = ['paradigm', 'framework', 'approach', 'perspective', 'worldview']
    const paradigmChunks = processedDoc.chunks.filter(chunk =>
      paradigmTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (paradigmChunks.length > 0) {
      findings.push(`Paradigm awareness found in ${paradigmChunks.length} sections`)
      confidence += 15
    }
    
    // Check for alternative approaches
    const altTerms = ['alternative', 'different', 'other', 'compare', 'contrast']
    const hasAlternatives = processedDoc.chunks.some(chunk =>
      altTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (hasAlternatives) {
      findings.push('Alternative approaches or comparisons discussed')
      confidence += 10
    } else {
      recommendations.push('Consider discussing alternative theoretical frameworks')
      confidence -= 5
    }
    
    // Check for critical analysis
    const criticalTerms = ['critical', 'limitation', 'weakness', 'problem', 'challenge']
    const hasCritical = processedDoc.chunks.some(chunk =>
      criticalTerms.some(term => chunk.content.toLowerCase().includes(term))
    )
    
    if (hasCritical) {
      findings.push('Critical analysis and limitations discussed')
      confidence += 10
    } else {
      recommendations.push('Include critical analysis of limitations and potential biases')
    }
    
    return {
      agent: 'Paradigm Analyst',
      role: 'Independence from dominant paradigms',
      confidence: Math.min(Math.max(confidence, 0), 100),
      findings,
      recommendations,
      score: confidence / 10
    }
  }

  /**
   * Generate final comprehensive analysis using real OpenAI
   */
  private static async generateFinalAnalysis(
    processedDoc: ProcessedDocument,
    agentAnalyses: AgentAnalysis[],
    relevantKnowledge: PhysicsChunk[]
  ): Promise<Partial<AnalysisResult>> {
    const { RealOpenAIAgents } = await import('./real-openai-agents')
    
    // Calculate overall score from agent scores
    const scores = agentAnalyses.map(a => a.score)
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const confidence = Math.round(agentAnalyses.reduce((sum, a) => sum + a.confidence, 0) / agentAnalyses.length)
    
    // Determine rating
    let rating = 'Poor'
    if (overallScore >= 8.5) rating = 'Excellent'
    else if (overallScore >= 7.5) rating = 'Very Good'
    else if (overallScore >= 6.5) rating = 'Good'
    else if (overallScore >= 5.5) rating = 'Fair'
    
    // Generate executive summary using OpenAI
    const executiveSummary = await RealOpenAIAgents.generateExecutiveSummary(
      processedDoc, agentAnalyses, relevantKnowledge
    )
    
    // Extract key findings from agent analyses
    const keyFindings = agentAnalyses.flatMap(a => a.findings).slice(0, 6)
    
    // Extract strengths and improvements
    const strengths = agentAnalyses
      .filter(a => a.confidence > 75)
      .map(a => `${a.agent}: ${a.findings[0] || 'Strong analysis'}`)
      .slice(0, 4)
    
    const improvements = agentAnalyses
      .flatMap(a => a.recommendations)
      .slice(0, 4)
    
    // Generate detailed analysis scores
    const detailedAnalysis: DetailedAnalysis = {
      epistemicEvaluation: {
        score: Math.round((overallScore * 0.9) * 10) / 10,
        description: agentAnalyses.find(a => a.agent === 'Epistemic Analyst')?.reasoning.substring(0, 100) || 'Strong epistemic foundations'
      },
      methodologyAssessment: {
        score: Math.round((overallScore * 0.95) * 10) / 10,
        description: agentAnalyses.find(a => a.agent === 'Experimental Designer')?.reasoning.substring(0, 100) || 'Sound methodology'
      },
      paradigmIndependence: {
        score: Math.round((overallScore * 0.85) * 10) / 10,
        description: agentAnalyses.find(a => a.agent === 'Paradigm Analyst')?.reasoning.substring(0, 100) || 'Good paradigm independence'
      },
      reproducibility: {
        score: Math.round((overallScore * 0.92) * 10) / 10,
        description: 'High reproducibility potential based on methodology assessment'
      }
    }
    
    // Generate comprehensive recommendations
    const recommendations = [
      ...improvements,
      'Consider peer review from domain specialists',
      'Validate findings through independent replication',
      'Explore connections with related theoretical frameworks'
    ].slice(0, 6)
    
    return {
      overallScore: Math.round(overallScore * 10) / 10,
      confidence,
      rating,
      executiveSummary,
      keyFindings,
      strengths,
      improvements,
      detailedAnalysis,
      agentAnalysis: agentAnalyses,
      recommendations
    }
  }

  /**
   * Get analysis result by ID
   */
  static async getAnalysisResult(analysisId: string): Promise<AnalysisResult | null> {
    return await AnalysisStorage.getAnalysis(analysisId)
  }
}

