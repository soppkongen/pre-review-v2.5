import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PhysicsChunk, storePhysicsChunk } from './weaviate'

// Document processing interfaces
export interface ProcessedDocument {
  id: string
  filename: string
  content: string
  metadata: DocumentMetadata
  chunks: PhysicsChunk[]
}

export interface DocumentMetadata {
  title?: string
  authors?: string[]
  abstract?: string
  keywords?: string[]
  fileType: string
  pageCount?: number
  extractionMethod: string
}

export interface ChunkingOptions {
  maxChunkSize: number
  overlapSize: number
  preserveStructure: boolean
}

// Default chunking options
const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  maxChunkSize: 1000,
  overlapSize: 200,
  preserveStructure: true
}

// Physics domain classification
const PHYSICS_DOMAINS = {
  'quantum': ['quantum', 'qubit', 'entanglement', 'superposition', 'wave function', 'schrödinger'],
  'relativity': ['relativity', 'spacetime', 'einstein', 'lorentz', 'minkowski', 'geodesic'],
  'thermodynamics': ['entropy', 'temperature', 'heat', 'thermal', 'boltzmann', 'carnot'],
  'electromagnetism': ['electromagnetic', 'electric', 'magnetic', 'maxwell', 'field', 'charge'],
  'mechanics': ['force', 'momentum', 'energy', 'newton', 'lagrangian', 'hamiltonian'],
  'optics': ['light', 'photon', 'laser', 'interference', 'diffraction', 'refraction'],
  'particle': ['particle', 'fermion', 'boson', 'quark', 'lepton', 'hadron'],
  'cosmology': ['universe', 'cosmic', 'galaxy', 'dark matter', 'dark energy', 'big bang'],
  'condensed': ['solid state', 'crystal', 'phonon', 'superconductor', 'semiconductor'],
  'nuclear': ['nuclear', 'radioactive', 'fission', 'fusion', 'isotope', 'decay']
}

// Mathematical content detection
const MATH_PATTERNS = [
  /\\[a-zA-Z]+\{[^}]*\}/g, // LaTeX commands
  /\$[^$]+\$/g, // Inline math
  /\$\$[^$]+\$\$/g, // Display math
  /\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, // LaTeX environments
  /[∫∑∏∂∇∆∞±≤≥≠≈∈∉⊂⊃∪∩]/g, // Mathematical symbols
]

export class DocumentProcessor {
  private chunkingOptions: ChunkingOptions

  constructor(options: Partial<ChunkingOptions> = {}) {
    this.chunkingOptions = { ...DEFAULT_CHUNKING_OPTIONS, ...options }
  }

  // Main processing function for uploaded files
  async processDocument(file: File): Promise<ProcessedDocument> {
    let content: string = ''
    let metadata: DocumentMetadata
    const filename = file.name
    const fileType = file.type

    // Extract content based on file type
    if (fileType === 'application/pdf') {
      ({ content, metadata } = await this.processPDF(file))
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      ({ content, metadata } = await this.processDocx(file))
    } else if (fileType === 'text/plain' || filename.endsWith('.tex')) {
      ({ content, metadata } = await this.processText(file))
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }

    // Create chunks
    const chunks = await this.createChunks(content, filename, metadata)

    return {
      id: uuidv4(),
      filename,
      content,
      metadata,
      chunks
    }
  }

  // PDF processing using pdf-parse
  private async processPDF(file: File): Promise<{ content: string; metadata: DocumentMetadata }> {
    const buffer = await file.arrayBuffer()
    const pdfParse = (await import('pdf-parse')).default
    const data = await pdfParse(Buffer.from(buffer))
    return {
      content: data.text,
      metadata: {
        fileType: 'pdf',
        extractionMethod: 'pdf-parse',
        pageCount: data.numpages
      }
    }
  }

  // DOCX processing using mammoth
  private async processDocx(file: File): Promise<{ content: string; metadata: DocumentMetadata }> {
    const buffer = await file.arrayBuffer()
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return {
      content: result.value,
      metadata: {
        fileType: 'docx',
        extractionMethod: 'mammoth',
      }
    }
  }

  // Text or LaTeX processing
  private async processText(file: File): Promise<{ content: string; metadata: DocumentMetadata }> {
    const text = await file.text()
    let title: string | undefined
    let authors: string[] | undefined
    let abstract: string | undefined

    // Extract LaTeX metadata if it's a .tex file
    if (file.name.endsWith('.tex')) {
      const titleMatch = text.match(/\\title\{([^}]+)\}/)
      title = titleMatch ? titleMatch[1] : undefined
      const authorMatch = text.match(/\\author\{([^}]+)\}/)
      authors = authorMatch ? [authorMatch[1]] : undefined
      const abstractMatch = text.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/)
      abstract = abstractMatch ? abstractMatch[1].trim() : undefined
    }

    return {
      content: text,
      metadata: {
        fileType: file.type,
        extractionMethod: 'direct-read',
        title,
        authors,
        abstract
      }
    }
  }

  // Create chunks from content
  private async createChunks(content: string, sourceDocument: string, metadata: DocumentMetadata): Promise<PhysicsChunk[]> {
    const chunks: PhysicsChunk[] = []
    const sentences = this.splitIntoSentences(content)
    
    let currentChunk = ''
    let chunkIndex = 0

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      
      // Check if adding this sentence would exceed chunk size
      if (currentChunk.length + sentence.length > this.chunkingOptions.maxChunkSize && currentChunk.length > 0) {
        // Create chunk from current content
        const chunk = await this.createPhysicsChunk(
          currentChunk,
          sourceDocument,
          metadata,
          chunkIndex
        )
        chunks.push(chunk)
        
        // Start new chunk with overlap
        const overlapStart = Math.max(0, i - Math.floor(this.chunkingOptions.overlapSize / 100))
        currentChunk = sentences.slice(overlapStart, i + 1).join(' ')
        chunkIndex++
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence
      }
    }

    // Add final chunk if there's remaining content
    if (currentChunk.trim()) {
      const chunk = await this.createPhysicsChunk(
        currentChunk,
        sourceDocument,
        metadata,
        chunkIndex
      )
      chunks.push(chunk)
    }

    return chunks
  }

  // Create a physics chunk with metadata
  private async createPhysicsChunk(
    content: string,
    sourceDocument: string,
    metadata: DocumentMetadata,
    index: number
  ): Promise<PhysicsChunk> {
    const chunkId = `${sourceDocument}_chunk_${index}`
    
    // Analyze content for physics domains
    const domain = this.classifyPhysicsDomain(content)
    const subdomain = this.classifyPhysicsSubdomain(content, domain)
    
    // Extract mathematical content
    const equations = this.extractMathematicalContent(content)
    const hasMathematicalContent = equations.length > 0
    
    // Extract physics concepts
    const concepts = this.extractPhysicsConcepts(content)
    
    // Determine difficulty level
    const difficultyLevel = this.assessDifficultyLevel(content)
    
    // Determine content type
    const contentType = this.classifyContentType(content)

    return {
      chunkId,
      sourceDocument,
      content: content.trim(),
      domain,
      subdomain,
      contentType,
      difficultyLevel,
      priority: this.calculatePriority(content, concepts),
      hasMathematicalContent,
      equations,
      concepts,
      prerequisites: this.extractPrerequisites(content, concepts),
      extractionMethod: metadata.extractionMethod,
    }
  }

  // Utility functions
  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  }

  private classifyPhysicsDomain(content: string): string {
    const lowerContent = content.toLowerCase()
    let maxScore = 0
    let bestDomain = 'general'

    for (const [domain, keywords] of Object.entries(PHYSICS_DOMAINS)) {
      const score = keywords.reduce((acc, keyword) => {
        const regex = new RegExp(keyword, 'gi')
        const matches = lowerContent.match(regex)
        return acc + (matches ? matches.length : 0)
      }, 0)

      if (score > maxScore) {
        maxScore = score
        bestDomain = domain
      }
    }

    return bestDomain
  }

  private classifyPhysicsSubdomain(content: string, domain: string): string {
    // Simplified subdomain classification
    const lowerContent = content.toLowerCase()
    
    if (domain === 'quantum') {
      if (lowerContent.includes('field')) return 'quantum field theory'
      if (lowerContent.includes('information')) return 'quantum information'
      if (lowerContent.includes('computing')) return 'quantum computing'
    }
    
    return domain
  }

  private extractMathematicalContent(content: string): string[] {
    const equations: string[] = []
    
    MATH_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        equations.push(...matches)
      }
    })
    
    return [...new Set(equations)] // Remove duplicates
  }

  private extractPhysicsConcepts(content: string): string[] {
    const concepts: string[] = []
    const lowerContent = content.toLowerCase()
    
    // Extract concepts from all domains
    Object.values(PHYSICS_DOMAINS).flat().forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        concepts.push(keyword)
      }
    })
    
    return [...new Set(concepts)]
  }

  private assessDifficultyLevel(content: string): string {
    const lowerContent = content.toLowerCase()
    
    // Simple heuristic based on complexity indicators
    const advancedTerms = ['tensor', 'manifold', 'gauge', 'symmetry', 'renormalization']
    const intermediateTerms = ['derivative', 'integral', 'matrix', 'vector', 'differential']
    
    const advancedCount = advancedTerms.reduce((acc, term) => 
      acc + (lowerContent.includes(term) ? 1 : 0), 0)
    const intermediateCount = intermediateTerms.reduce((acc, term) => 
      acc + (lowerContent.includes(term) ? 1 : 0), 0)
    
    if (advancedCount > 2) return 'advanced'
    if (intermediateCount > 2) return 'intermediate'
    return 'beginner'
  }

  private classifyContentType(content: string): string {
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('theorem') || lowerContent.includes('proof')) return 'theorem'
    if (lowerContent.includes('experiment') || lowerContent.includes('measurement')) return 'experimental'
    if (lowerContent.includes('equation') || lowerContent.includes('formula')) return 'mathematical'
    if (lowerContent.includes('concept') || lowerContent.includes('definition')) return 'conceptual'
    
    return 'general'
  }

  private calculatePriority(content: string, concepts: string[]): number {
    // Simple priority calculation based on content richness
    const baseScore = Math.min(content.length / 100, 10)
    const conceptBonus = Math.min(concepts.length * 2, 10)
    const mathBonus = this.extractMathematicalContent(content).length > 0 ? 5 : 0
    
    return Math.round(baseScore + conceptBonus + mathBonus)
  }

  private extractPrerequisites(content: string, concepts: string[]): string[] {
    // Simplified prerequisite extraction
    const prerequisites: string[] = []
    
    if (concepts.includes('quantum')) {
      prerequisites.push('linear algebra', 'complex numbers')
    }
    if (concepts.includes('relativity')) {
      prerequisites.push('calculus', 'linear algebra')
    }
    if (concepts.includes('thermodynamics')) {
      prerequisites.push('calculus', 'statistics')
    }
    
    return prerequisites
  }

  // Store all chunks to Weaviate
  async storeDocumentChunks(processedDoc: ProcessedDocument): Promise<void> {
    for (const chunk of processedDoc.chunks) {
      try {
        await storePhysicsChunk(chunk)
        console.log(`Stored chunk: ${chunk.chunkId}`)
      } catch (error) {
        console.error(`Failed to store chunk ${chunk.chunkId}:`, error)
      }
    }
  }
}

