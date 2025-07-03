import mammoth from 'mammoth'
import { v4 as uuidv4 } from 'uuid'

export interface DocumentChunk {
  id: string
  content: string
  metadata: {
    source: string
    page?: number
    section?: string
    chunkIndex: number
    totalChunks: number
    domain?: string
    concepts?: string[]
    equations?: string[]
    difficultyLevel?: string
  }
}

export interface ProcessedDocument {
  chunks: DocumentChunk[]
  metadata: {
    fileName: string
    fileType: string
    totalPages?: number
    wordCount: number
    processingTime: number
    title?: string
    authors?: string[]
    abstract?: string
  }
}

// Physics domain classification
const PHYSICS_DOMAINS = {
  'quantum': ['quantum', 'qubit', 'entanglement', 'superposition', 'wave function', 'schrödinger', 'heisenberg'],
  'relativity': ['relativity', 'spacetime', 'einstein', 'lorentz', 'minkowski', 'geodesic', 'metric'],
  'thermodynamics': ['entropy', 'temperature', 'heat', 'thermal', 'boltzmann', 'carnot', 'gibbs'],
  'electromagnetism': ['electromagnetic', 'electric', 'magnetic', 'maxwell', 'field', 'charge', 'current'],
  'mechanics': ['force', 'momentum', 'energy', 'newton', 'lagrangian', 'hamiltonian', 'dynamics'],
  'optics': ['light', 'photon', 'laser', 'interference', 'diffraction', 'refraction', 'wavelength'],
  'particle': ['particle', 'fermion', 'boson', 'quark', 'lepton', 'hadron', 'standard model'],
  'cosmology': ['universe', 'cosmic', 'galaxy', 'dark matter', 'dark energy', 'big bang', 'redshift'],
  'condensed': ['solid state', 'crystal', 'phonon', 'superconductor', 'semiconductor', 'band gap'],
  'nuclear': ['nuclear', 'radioactive', 'fission', 'fusion', 'isotope', 'decay', 'binding energy']
}

// Mathematical content patterns
const MATH_PATTERNS = [
  /\\[a-zA-Z]+\{[^}]*\}/g, // LaTeX commands
  /\$[^$]+\$/g, // Inline math
  /\$\$[^$]+\$\$/g, // Display math
  /\\begin\{[^}]+\}[\s\S]*?\\end\{[^}]+\}/g, // LaTeX environments
  /[∫∑∏∂∇∆∞±≤≥≠≈∈∉⊂⊃∪∩]/g, // Mathematical symbols
  /[a-zA-Z]\s*=\s*[^,\s]+/g, // Simple equations
]

export class RealDocumentProcessor {
  private static readonly CHUNK_SIZE = 1000 // characters per chunk
  private static readonly CHUNK_OVERLAP = 200 // overlap between chunks

  /**
   * Process a file and extract text content with real parsing
   */
 static async processFile(file: File): Promise<ProcessedDocument> {
  const startTime = Date.now()
  
  try {
    let text: string = '';
    let totalPages: number | undefined;
    let title: string | undefined;
    let authors: string[] | undefined;
    let abstract: string | undefined;

    // Extract text based on file type
    if (file.type === 'application/pdf') {
      try {
        const result = await this.processPDF(file)
        text = result.text
        totalPages = result.pages
      } catch (error) {
        console.error('PDF processing error:', error)
        throw new Error('Failed to process PDF file')
      }
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        text = await this.processDocx(file)
      } catch (error) {
        console.error('DOCX processing error:', error)
        throw new Error('Failed to process DOCX file')
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.tex')) {
      try {
        const result = await this.processText(file)
        text = result.text
        title = result.title
        authors = result.authors
        abstract = result.abstract
      } catch (error) {
        console.error('Text processing error:', error)
        throw new Error('Failed to process text file')
      }
    } else {
      throw new Error(`Unsupported file type: ${file.type}`)
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text content extracted from file')
    }

    // Clean and normalize text
    text = this.cleanText(text)

    // Extract metadata from text if not already extracted
    if (!title) {
      title = this.extractTitle(text)
    }
    if (!authors) {
      authors = this.extractAuthors(text)
    }
    if (!abstract) {
      abstract = this.extractAbstract(text)
    }

    // Create intelligent chunks
    const chunks = this.createIntelligentChunks(text, file.name)
    
    if (!chunks || chunks.length === 0) {
      throw new Error('Failed to create document chunks')
    }

    const processingTime = Date.now() - startTime

    return {
      chunks,
      metadata: {
        fileName: file.name,
        fileType: file.type,
        totalPages,
        wordCount: text.split(/\s+/).length,
        processingTime,
        title,
        authors,
        abstract
      }
    }
  } catch (error) {
    console.error('Document processing error:', error)
    // Return a minimal valid document structure instead of throwing
    return {
      chunks: [{
        id: `${file.name}-error-chunk`,
        content: 'Error processing document',
        metadata: {
          source: file.name,
          chunkIndex: 0,
          totalChunks: 1
        }
      }],
      metadata: {
        fileName: file.name,
        fileType: file.type,
        wordCount: 0,
        processingTime: Date.now() - startTime
      }
    }
  }
}

  /**
   * Process PDF file with real PDF parsing
   */
private static async processPDF(file: File): Promise<{ text: string; pages: number }> {
  const buffer = await file.arrayBuffer()
  
  // Dynamic import to prevent debug mode during build
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(Buffer.from(buffer))
  
  return {
    text: data.text,
    pages: data.numpages
  }
}


  /**
   * Process DOCX file with real DOCX parsing
   */
  private static async processDocx(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
    return result.value
  }

  /**
   * Process text/LaTeX file with metadata extraction
   */
  private static async processText(file: File): Promise<{ text: string; title?: string; authors?: string[]; abstract?: string }> {
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

    return { text, title, authors, abstract }
  }

  /**
   * Clean and normalize text
   */
  private static cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with processing
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Trim
      .trim()
  }

  /**
   * Create intelligent chunks with physics domain analysis
   */
  private static createIntelligentChunks(text: string, fileName: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    
    // First, try to split by sections if it's an academic paper
    const sections = this.extractSections(text)
    
    if (Object.keys(sections).length > 1) {
      // Process each section separately
      let chunkIndex = 0
      for (const [sectionName, sectionText] of Object.entries(sections)) {
        const sectionChunks = this.createChunksFromText(sectionText, fileName, chunkIndex, sectionName)
        chunks.push(...sectionChunks)
        chunkIndex += sectionChunks.length
      }
    } else {
      // Fall back to sentence-based chunking
      chunks.push(...this.createChunksFromText(text, fileName, 0))
    }
    
    // Update total chunks count and add physics analysis
    chunks.forEach((chunk, index) => {
      chunk.metadata.totalChunks = chunks.length
      chunk.metadata.chunkIndex = index
      
      // Add physics domain analysis
      chunk.metadata.domain = this.classifyPhysicsDomain(chunk.content)
      chunk.metadata.concepts = this.extractPhysicsConcepts(chunk.content)
      chunk.metadata.equations = this.extractMathematicalContent(chunk.content)
      chunk.metadata.difficultyLevel = this.assessDifficultyLevel(chunk.content)
    })
    
    return chunks
  }

  /**
   * Create chunks from text with overlap
   */
  private static createChunksFromText(text: string, fileName: string, startIndex: number, section?: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    let currentChunk = ''
    let chunkIndex = startIndex
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim()
      if (!sentence) continue
      
      // Check if adding this sentence would exceed chunk size
      if (currentChunk.length + sentence.length > this.CHUNK_SIZE && currentChunk.length > 0) {
        // Create chunk
        chunks.push({
          id: `${fileName}-chunk-${chunkIndex}`,
          content: currentChunk.trim(),
          metadata: {
            source: fileName,
            chunkIndex,
            totalChunks: 0, // Will be updated later
            section
          }
        })
        
        // Start new chunk with overlap
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-Math.floor(this.CHUNK_OVERLAP / 6)) // Approximate word overlap
        currentChunk = overlapWords.join(' ') + ' ' + sentence
        chunkIndex++
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence
      }
    }
    
    // Add final chunk if there's content
    if (currentChunk.trim()) {
      chunks.push({
        id: `${fileName}-chunk-${chunkIndex}`,
        content: currentChunk.trim(),
        metadata: {
          source: fileName,
          chunkIndex,
          totalChunks: 0,
          section
        }
      })
    }
    
    return chunks
  }

  /**
   * Extract sections from academic paper
   */
  private static extractSections(text: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {}
    
    // Common academic paper sections
    const sectionPatterns = [
      { name: 'abstract', pattern: /(?:abstract|summary)\s*:?\s*(.*?)(?=\n\s*(?:introduction|keywords|1\.|background|method))/is },
      { name: 'introduction', pattern: /(?:introduction|1\.?\s*introduction)\s*:?\s*(.*?)(?=\n\s*(?:2\.|background|method|related work|literature))/is },
      { name: 'methodology', pattern: /(?:method|methodology|approach|2\.)\s*:?\s*(.*?)(?=\n\s*(?:3\.|result|experiment|evaluation|analysis))/is },
      { name: 'results', pattern: /(?:result|finding|3\.)\s*:?\s*(.*?)(?=\n\s*(?:4\.|discussion|conclusion|analysis))/is },
      { name: 'discussion', pattern: /(?:discussion|analysis|4\.)\s*:?\s*(.*?)(?=\n\s*(?:5\.|conclusion|summary|reference))/is },
      { name: 'conclusion', pattern: /(?:conclusion|summary|5\.)\s*:?\s*(.*?)(?=\n\s*(?:reference|acknowledgment|appendix|bibliography))/is }
    ]
    
    for (const { name, pattern } of sectionPatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].trim().length > 100) { // Only include substantial sections
        sections[name] = match[1].trim()
      }
    }
    
    // If no sections found, return the whole text
    if (Object.keys(sections).length === 0) {
      sections['full_text'] = text
    }
    
    return sections
  }

  /**
   * Extract title from text
   */
  private static extractTitle(text: string): string | undefined {
    // Try various title patterns
    const titlePatterns = [
      /^(.{10,100})\n\n/m, // First line if followed by double newline
      /title:\s*(.+)/i,
      /^(.{10,80})$/m // First substantial line
    ]
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const title = match[1].trim()
        if (title.length > 10 && title.length < 200) {
          return title
        }
      }
    }
    
    return undefined
  }

  /**
   * Extract authors from text
   */
  private static extractAuthors(text: string): string[] | undefined {
    const authorPatterns = [
      /authors?:\s*(.+)/i,
      /by\s+(.+?)(?:\n|$)/i
    ]
    
    for (const pattern of authorPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const authorsText = match[1].trim()
        // Split by common separators
        const authors = authorsText.split(/[,;&]/).map(a => a.trim()).filter(a => a.length > 2)
        if (authors.length > 0) {
          return authors
        }
      }
    }
    
    return undefined
  }

  /**
   * Extract abstract from text
   */
  private static extractAbstract(text: string): string | undefined {
    const abstractPatterns = [
      /abstract\s*:?\s*(.*?)(?=\n\s*(?:introduction|keywords|1\.|background))/is,
      /summary\s*:?\s*(.*?)(?=\n\s*(?:introduction|keywords|1\.|background))/is
    ]
    
    for (const pattern of abstractPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const abstract = match[1].trim()
        if (abstract.length > 50 && abstract.length < 2000) {
          return abstract
        }
      }
    }
    
    return undefined
  }

  /**
   * Classify physics domain
   */
  private static classifyPhysicsDomain(content: string): string {
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

  /**
   * Extract physics concepts
   */
  private static extractPhysicsConcepts(content: string): string[] {
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

  /**
   * Extract mathematical content
   */
  private static extractMathematicalContent(content: string): string[] {
    const equations: string[] = []
    
    MATH_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        equations.push(...matches)
      }
    })
    
    return [...new Set(equations)] // Remove duplicates
  }

  /**
   * Assess difficulty level
   */
  private static assessDifficultyLevel(content: string): string {
    const lowerContent = content.toLowerCase()
    
    // Advanced physics terms
    const advancedTerms = [
      'tensor', 'manifold', 'gauge', 'symmetry', 'renormalization', 'topology',
      'group theory', 'lie algebra', 'differential geometry', 'field theory'
    ]
    
    // Intermediate physics terms
    const intermediateTerms = [
      'derivative', 'integral', 'matrix', 'vector', 'differential', 'eigenvalue',
      'fourier', 'laplacian', 'gradient', 'divergence'
    ]
    
    const advancedCount = advancedTerms.reduce((acc, term) => 
      acc + (lowerContent.includes(term) ? 1 : 0), 0)
    const intermediateCount = intermediateTerms.reduce((acc, term) => 
      acc + (lowerContent.includes(term) ? 1 : 0), 0)
    
    if (advancedCount > 2) return 'advanced'
    if (intermediateCount > 2 || advancedCount > 0) return 'intermediate'
    return 'beginner'
  }
}

