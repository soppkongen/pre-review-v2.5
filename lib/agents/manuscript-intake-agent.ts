import { BaseAgent, AgentCapabilities, AnalysisContext, AnalysisResult } from './base-agent'
import { RealDocumentProcessor, ProcessedDocument } from '../real-document-processor'
import { storeResearchPaper, ResearchPaper } from '../weaviate'

export class ManuscriptIntakeAgent extends BaseAgent {
  private documentProcessor: typeof RealDocumentProcessor

  constructor() {
    const capabilities: AgentCapabilities = {
      canAnalyzeTheory: false,
      canAnalyzeMath: false,
      canAnalyzeExperiment: false,
      canCoordinate: false,
      canValidateRelevance: false
    }

    super('manuscript-intake', 'Manuscript Intake Agent', 'Document processing and standardization', capabilities)
    this.documentProcessor = RealDocumentProcessor
  }

  async analyze(context: AnalysisContext): Promise<AnalysisResult> {
    const startTime = Date.now()
    
    try {
      // Process the document
      const file = context.metadata?.file
      if (!file) {
        throw new Error('File object is required for document processing')
      }
      const processedDoc = await this.documentProcessor.processFile(file)
      
      // Store document chunks in Weaviate
      await this.documentProcessor.storeDocumentChunks(processedDoc)
      
      // Store research paper metadata
      const researchPaper: ResearchPaper = {
        title: processedDoc.metadata.title || file.name,
        authors: processedDoc.metadata.authors || [],
        abstract: processedDoc.metadata.abstract || '',
        content: processedDoc.content,
        field: this.classifyField(processedDoc.content),
        keywords: processedDoc.metadata.keywords || [],
        uploadDate: new Date().toISOString(),
        fileType: processedDoc.metadata.fileType
      }
      
      const paperResult = await storeResearchPaper(researchPaper)
      
      // Generate quality assessment
      const qualityAssessment = this.assessDocumentQuality(processedDoc)
      
      const processingTime = Date.now() - startTime
      const confidence = this.calculateProcessingConfidence(processedDoc, qualityAssessment)

      return {
        agentId: this.id,
        analysisType: 'document_intake',
        result: JSON.stringify({
          documentId: processedDoc.id,
          paperId: paperResult.id,
          chunksCreated: processedDoc.chunks.length,
          qualityAssessment,
          metadata: processedDoc.metadata,
          processingTimeMs: processingTime
        }),
        confidence,
        timestamp: new Date(),
        metadata: {
          chunksStored: processedDoc.chunks.length,
          documentLength: processedDoc.content.length,
          fileType: processedDoc.metadata.fileType
        },
        recommendations: this.generateRecommendations(processedDoc, qualityAssessment),
        issues: this.identifyIssues(processedDoc, qualityAssessment)
      }
    } catch (error) {
      return {
        agentId: this.id,
        analysisType: 'document_intake',
        result: `Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        timestamp: new Date(),
        issues: ['Document processing failed']
      }
    }
  }

  validateInput(context: AnalysisContext): boolean {
    return !!(context.metadata?.file)
  }

  getRequiredCapabilities(): string[] {
    return ['document_processing', 'text_extraction', 'metadata_analysis']
  }

  private classifyField(content: string): string {
    const lowerContent = content.toLowerCase()
    
    const fieldKeywords = {
      'theoretical_physics': ['theory', 'theoretical', 'quantum field', 'string theory', 'gauge theory'],
      'experimental_physics': ['experiment', 'measurement', 'data', 'observation', 'detector'],
      'condensed_matter': ['solid state', 'crystal', 'superconductor', 'semiconductor', 'phonon'],
      'particle_physics': ['particle', 'accelerator', 'collider', 'quark', 'lepton', 'boson'],
      'astrophysics': ['star', 'galaxy', 'cosmic', 'universe', 'dark matter', 'black hole'],
      'quantum_mechanics': ['quantum', 'wave function', 'entanglement', 'superposition', 'measurement'],
      'relativity': ['relativity', 'spacetime', 'gravity', 'general relativity', 'special relativity'],
      'thermodynamics': ['entropy', 'temperature', 'heat', 'thermal', 'statistical mechanics']
    }

    let maxScore = 0
    let bestField = 'general_physics'

    for (const [field, keywords] of Object.entries(fieldKeywords)) {
      const score = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi')
        const matches = lowerContent.match(regex)
        return acc + (matches ? matches.length : 0)
      }, 0)

      if (score > maxScore) {
        maxScore = score
        bestField = field
      }
    }

    return bestField
  }

  private assessDocumentQuality(doc: ProcessedDocument): any {
    const quality = {
      completeness: this.assessCompleteness(doc),
      formatting: this.assessFormatting(doc),
      readability: this.assessReadability(doc),
      structure: this.assessStructure(doc),
      overallScore: 0
    }

    quality.overallScore = (quality.completeness + quality.formatting + quality.readability + quality.structure) / 4
    return quality
  }

  private assessCompleteness(doc: ProcessedDocument): number {
    let score = 0.5 // Base score
    
    if (doc.metadata.title) score += 0.1
    if (doc.metadata.authors && doc.metadata.authors.length > 0) score += 0.1
    if (doc.metadata.abstract) score += 0.1
    if (doc.content.length > 1000) score += 0.1
    if (doc.chunks.length > 5) score += 0.1
    
    return Math.min(score, 1)
  }

  private assessFormatting(doc: ProcessedDocument): number {
    const content = doc.content
    let score = 0.5
    
    // Check for proper sections
    if (content.includes('Abstract') || content.includes('Introduction')) score += 0.1
    if (content.includes('Conclusion') || content.includes('Results')) score += 0.1
    if (content.includes('References') || content.includes('Bibliography')) score += 0.1
    
    // Check for mathematical content
    if (doc.chunks.some(chunk => chunk.hasMathematicalContent)) score += 0.2
    
    return Math.min(score, 1)
  }

  private assessReadability(doc: ProcessedDocument): number {
    const avgChunkLength = doc.chunks.reduce((sum, chunk) => sum + chunk.content.length, 0) / doc.chunks.length
    
    // Optimal chunk length is around 500-1500 characters
    if (avgChunkLength >= 500 && avgChunkLength <= 1500) return 0.9
    if (avgChunkLength >= 300 && avgChunkLength <= 2000) return 0.7
    return 0.5
  }

  private assessStructure(doc: ProcessedDocument): number {
    let score = 0.5
    
    // Check for logical structure in chunks
    const hasIntroduction = doc.chunks.some(chunk => 
      chunk.content.toLowerCase().includes('introduction') || 
      chunk.content.toLowerCase().includes('background')
    )
    const hasConclusion = doc.chunks.some(chunk => 
      chunk.content.toLowerCase().includes('conclusion') || 
      chunk.content.toLowerCase().includes('summary')
    )
    
    if (hasIntroduction) score += 0.2
    if (hasConclusion) score += 0.2
    if (doc.chunks.length >= 10) score += 0.1 // Sufficient detail
    
    return Math.min(score, 1)
  }

  private calculateProcessingConfidence(doc: ProcessedDocument, quality: any): number {
    const factors = [
      doc.chunks.length > 0 ? 1 : 0, // Successfully created chunks
      quality.overallScore, // Document quality
      doc.metadata.extractionMethod === 'direct-read' ? 0.9 : 0.7, // Extraction reliability
      doc.content.length > 500 ? 1 : 0.5 // Sufficient content
    ]
    
    return this.calculateConfidence(factors)
  }

  private generateRecommendations(doc: ProcessedDocument, quality: any): string[] {
    const recommendations: string[] = []
    
    if (quality.completeness < 0.7) {
      recommendations.push('Consider adding missing metadata (title, authors, abstract)')
    }
    
    if (quality.formatting < 0.7) {
      recommendations.push('Improve document structure with clear sections')
    }
    
    if (doc.chunks.length < 5) {
      recommendations.push('Document may be too short for comprehensive analysis')
    }
    
    if (!doc.chunks.some(chunk => chunk.hasMathematicalContent)) {
      recommendations.push('Consider adding mathematical formulations if applicable')
    }
    
    return recommendations
  }

  private identifyIssues(doc: ProcessedDocument, quality: any): string[] {
    const issues: string[] = []
    
    if (quality.overallScore < 0.5) {
      issues.push('Low overall document quality detected')
    }
    
    if (doc.chunks.length === 0) {
      issues.push('Failed to create document chunks')
    }
    
    if (doc.content.length < 100) {
      issues.push('Document content is too short')
    }
    
    if (!doc.metadata.title) {
      issues.push('Missing document title')
    }
    
    return issues
  }
}

