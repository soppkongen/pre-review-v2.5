import { v4 as uuidv4 } from 'uuid'

export interface AgentMessage {
  id: string
  from: string
  to: string
  type: string
  content: any
  timestamp: Date
  priority: number
}

export interface AgentCapabilities {
  canAnalyzeTheory: boolean
  canAnalyzeMath: boolean
  canAnalyzeExperiment: boolean
  canCoordinate: boolean
  canValidateRelevance: boolean
}

export interface AnalysisContext {
  documentId: string
  userQuery?: string
  analysisType: string
  previousResults?: any[]
  metadata?: any
}

export interface AnalysisResult {
  agentId: string
  analysisType: string
  result: string
  confidence: number
  timestamp: Date
  metadata?: any
  recommendations?: string[]
  issues?: string[]
}

export abstract class BaseAgent {
  protected id: string
  protected name: string
  protected specialty: string
  protected capabilities: AgentCapabilities
  protected messageQueue: AgentMessage[] = []
  protected isActive: boolean = true

  constructor(id: string, name: string, specialty: string, capabilities: AgentCapabilities) {
    this.id = id
    this.name = name
    this.specialty = specialty
    this.capabilities = capabilities
  }

  // Abstract methods that must be implemented by specific agents
  abstract analyze(context: AnalysisContext): Promise<AnalysisResult>
  abstract validateInput(context: AnalysisContext): boolean
  abstract getRequiredCapabilities(): string[]

  // Message handling
  async receiveMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message)
    await this.processMessage(message)
  }

  protected async processMessage(message: AgentMessage): Promise<void> {
    console.log(`${this.name} received message: ${message.type}`)
    
    switch (message.type) {
      case 'ANALYSIS_REQUEST':
        await this.handleAnalysisRequest(message)
        break
      case 'COORDINATION_REQUEST':
        await this.handleCoordinationRequest(message)
        break
      case 'VALIDATION_REQUEST':
        await this.handleValidationRequest(message)
        break
      default:
        console.warn(`Unknown message type: ${message.type}`)
    }
  }

  protected async handleAnalysisRequest(message: AgentMessage): Promise<void> {
    try {
      const context: AnalysisContext = message.content
      
      if (!this.validateInput(context)) {
        await this.sendMessage(message.from, 'ANALYSIS_ERROR', {
          error: 'Invalid input for analysis',
          agentId: this.id
        })
        return
      }

      const result = await this.analyze(context)
      
      await this.sendMessage(message.from, 'ANALYSIS_RESULT', result)
    } catch (error) {
      await this.sendMessage(message.from, 'ANALYSIS_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error',
        agentId: this.id
      })
    }
  }

  protected async handleCoordinationRequest(message: AgentMessage): Promise<void> {
    // Default coordination handling - can be overridden
    console.log(`${this.name} handling coordination request`)
  }

  protected async handleValidationRequest(message: AgentMessage): Promise<void> {
    // Default validation handling - can be overridden
    console.log(`${this.name} handling validation request`)
  }

  protected async sendMessage(to: string, type: string, content: any, priority: number = 1): Promise<void> {
    const message: AgentMessage = {
      id: uuidv4(),
      from: this.id,
      to,
      type,
      content,
      timestamp: new Date(),
      priority
    }

    // In a real implementation, this would use a message broker
    console.log(`${this.name} sending message to ${to}: ${type}`)
  }

  // Utility methods
  protected calculateConfidence(factors: number[]): number {
    if (factors.length === 0) return 0
    const average = factors.reduce((sum, factor) => sum + factor, 0) / factors.length
    return Math.max(0, Math.min(1, average))
  }

  protected extractKeyTerms(text: string): string[] {
    // Simple key term extraction
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || []
    const frequency: { [key: string]: number } = {}
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1
    })
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }

  protected assessComplexity(text: string): number {
    const complexTerms = [
      'quantum', 'relativistic', 'thermodynamic', 'electromagnetic',
      'tensor', 'manifold', 'gauge', 'symmetry', 'renormalization',
      'hamiltonian', 'lagrangian', 'eigenvalue', 'eigenvector'
    ]
    
    const lowerText = text.toLowerCase()
    const complexCount = complexTerms.reduce((count, term) => 
      count + (lowerText.includes(term) ? 1 : 0), 0)
    
    return Math.min(complexCount / 5, 1) // Normalize to 0-1
  }

  // Getters
  getId(): string { return this.id }
  getName(): string { return this.name }
  getSpecialty(): string { return this.specialty }
  getCapabilities(): AgentCapabilities { return this.capabilities }
  isAgentActive(): boolean { return this.isActive }

  // Control methods
  activate(): void { this.isActive = true }
  deactivate(): void { this.isActive = false }
}

