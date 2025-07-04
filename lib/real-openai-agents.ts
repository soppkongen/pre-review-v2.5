import OpenAI from 'openai'
import { PhysicsChunk } from './weaviate'
import { ProcessedDocument } from './real-document-processor'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface AgentAnalysis {
  agent: string
  role: string
  confidence: number
  findings: string[]
  recommendations: string[]
  score: number
  reasoning: string
}

export class RealOpenAIAgents {
  /**
   * Theoretical Physics Agent - Real OpenAI Analysis
   */
  static async theoreticalPhysicsAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const prompt = `You are a world-class theoretical physicist analyzing a research paper. 

DOCUMENT ANALYSIS:
- Title: ${processedDoc.metadata.title || 'Untitled'}
- File: ${processedDoc.metadata.fileName}
- Word Count: ${processedDoc.metadata.wordCount}
- Domains: ${[...new Set(processedDoc.chunks.map(c => c.metadata.domain))].join(', ')}

DOCUMENT CONTENT SAMPLE:
${processedDoc.chunks.slice(0, 3).map(c => c.content.substring(0, 300)).join('\n\n')}

RELEVANT KNOWLEDGE FROM DATABASE:
${relevantKnowledge.slice(0, 3).map(k => `- ${k.domain}: ${k.content.substring(0, 200)}`).join('\n')}

MATHEMATICAL CONTENT:
${processedDoc.chunks.flatMap(c => c.metadata.equations || []).slice(0, 5).join(', ')}

Analyze this paper from a theoretical physics perspective. Provide:
1. Theoretical foundations assessment
2. Mathematical rigor evaluation  
3. Consistency with established physics
4. Novel theoretical contributions
5. Areas needing theoretical strengthening

Respond in JSON format:
{
  "score": number (1-10),
  "confidence": number (0-100),
  "findings": ["finding1", "finding2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "reasoning": "detailed explanation"
}`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const analysis = JSON.parse(content)
      
      return {
        agent: 'Theoretical Physicist',
        role: 'Theory development and validation',
        confidence: analysis.confidence,
        findings: analysis.findings,
        recommendations: analysis.recommendations,
        score: analysis.score,
        reasoning: analysis.reasoning
      }
    } catch (error) {
      console.error('Theoretical physics analysis error:', error)
      throw new Error('Failed to complete theoretical physics analysis')
    }
  }

  /**
   * Mathematical Analysis Agent - Real OpenAI Analysis
   */
  static async mathematicalAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const equations = processedDoc.chunks.flatMap(c => c.metadata.equations || [])
    
    const prompt = `You are a mathematical physicist specializing in rigorous mathematical analysis of physics papers.

DOCUMENT ANALYSIS:
- Mathematical equations found: ${equations.length}
- Equations: ${equations.slice(0, 10).join(', ')}
- Difficulty levels: ${[...new Set(processedDoc.chunks.map(c => c.metadata.difficultyLevel))].join(', ')}

DOCUMENT CONTENT:
${processedDoc.chunks.filter(c => (c.metadata.equations?.length || 0) > 0).slice(0, 2).map(c => c.content.substring(0, 400)).join('\n\n')}

MATHEMATICAL CONTEXT FROM DATABASE:
${relevantKnowledge.filter(k => k.hasMathematicalContent).slice(0, 2).map(k => `- ${k.content.substring(0, 200)}`).join('\n')}

Analyze the mathematical rigor and correctness. Evaluate:
1. Mathematical formulation quality
2. Equation derivation soundness
3. Statistical analysis appropriateness
4. Computational methods validity
5. Mathematical notation consistency

Respond in JSON format:
{
  "score": number (1-10),
  "confidence": number (0-100),
  "findings": ["finding1", "finding2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "reasoning": "detailed mathematical assessment"
}`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const analysis = JSON.parse(content)
      
      return {
        agent: 'Mathematical Analyst',
        role: 'Equations and mathematical rigor',
        confidence: analysis.confidence,
        findings: analysis.findings,
        recommendations: analysis.recommendations,
        score: analysis.score,
        reasoning: analysis.reasoning
      }
    } catch (error) {
      console.error('Mathematical analysis error:', error)
      throw new Error('Failed to complete mathematical analysis')
    }
  }

  /**
   * Experimental Design Agent - Real OpenAI Analysis
   */
  static async experimentalAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const prompt = `You are an experimental physicist expert in research methodology and experimental design.

DOCUMENT ANALYSIS:
- Title: ${processedDoc.metadata.title || 'Untitled'}
- Abstract: ${processedDoc.metadata.abstract?.substring(0, 300) || 'Not available'}

CONTENT ANALYSIS:
${processedDoc.chunks.slice(0, 4).map(c => c.content.substring(0, 250)).join('\n\n')}

EXPERIMENTAL CONTEXT FROM DATABASE:
${relevantKnowledge.slice(0, 3).map(k => `- ${k.sourceDocument}: ${k.content.substring(0, 150)}`).join('\n')}

Analyze the experimental methodology and design. Evaluate:
1. Experimental design quality
2. Data collection methods
3. Control variables and conditions
4. Measurement accuracy and precision
5. Reproducibility potential
6. Statistical validation

Respond in JSON format:
{
  "score": number (1-10),
  "confidence": number (0-100),
  "findings": ["finding1", "finding2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "reasoning": "detailed experimental assessment"
}`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const analysis = JSON.parse(content)
      
      return {
        agent: 'Experimental Designer',
        role: 'Testable predictions and validation',
        confidence: analysis.confidence,
        findings: analysis.findings,
        recommendations: analysis.recommendations,
        score: analysis.score,
        reasoning: analysis.reasoning
      }
    } catch (error) {
      console.error('Experimental analysis error:', error)
      throw new Error('Failed to complete experimental analysis')
    }
  }

  /**
   * Epistemic Analysis Agent - Real OpenAI Analysis
   */
  static async epistemicAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const prompt = `You are a philosopher of science specializing in epistemic analysis and knowledge validation.

DOCUMENT ANALYSIS:
- Title: ${processedDoc.metadata.title || 'Untitled'}
- Authors: ${processedDoc.metadata.authors?.join(', ') || 'Not specified'}

CONTENT FOR EPISTEMIC ANALYSIS:
${processedDoc.chunks.slice(0, 4).map(c => c.content.substring(0, 300)).join('\n\n')}

KNOWLEDGE BASE CONTEXT:
${relevantKnowledge.slice(0, 3).map(k => `- Domain ${k.domain}: ${k.content.substring(0, 200)}`).join('\n')}

Perform deep epistemic analysis. Evaluate:
1. Knowledge claims and their justification
2. Evidence quality and sufficiency
3. Assumption archaeology and hidden biases
4. Logical consistency and coherence
5. Paradigm independence
6. Epistemic foundations strength

Respond in JSON format:
{
  "score": number (1-10),
  "confidence": number (0-100),
  "findings": ["finding1", "finding2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "reasoning": "detailed epistemic assessment"
}`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const analysis = JSON.parse(content)
      
      return {
        agent: 'Epistemic Analyst',
        role: 'Knowledge validation and bias detection',
        confidence: analysis.confidence,
        findings: analysis.findings,
        recommendations: analysis.recommendations,
        score: analysis.score,
        reasoning: analysis.reasoning
      }
    } catch (error) {
      console.error('Epistemic analysis error:', error)
      throw new Error('Failed to complete epistemic analysis')
    }
  }

  /**
   * Paradigm Independence Agent - Real OpenAI Analysis
   */
  static async paradigmAnalysis(
    processedDoc: ProcessedDocument,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<AgentAnalysis> {
    const prompt = `You are a science studies expert specializing in paradigm analysis and scientific revolution theory.

DOCUMENT ANALYSIS:
- Title: ${processedDoc.metadata.title || 'Untitled'}
- Physics domains: ${[...new Set(processedDoc.chunks.map(c => c.metadata.domain))].join(', ')}

CONTENT FOR PARADIGM ANALYSIS:
${processedDoc.chunks.slice(0, 4).map(c => c.content.substring(0, 300)).join('\n\n')}

PARADIGM CONTEXT FROM DATABASE:
${relevantKnowledge.slice(0, 3).map(k => `- ${k.domain} paradigm: ${k.content.substring(0, 200)}`).join('\n')}

Analyze paradigm independence and revolutionary potential. Evaluate:
1. Independence from dominant paradigms
2. Challenge to existing frameworks
3. Alternative perspective adoption
4. Paradigm-transcendent thinking
5. Revolutionary vs normal science classification
6. Potential for paradigm shift

Respond in JSON format:
{
  "score": number (1-10),
  "confidence": number (0-100),
  "findings": ["finding1", "finding2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "reasoning": "detailed paradigm independence assessment"
}`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1500
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      const analysis = JSON.parse(content)
      
      return {
        agent: 'Paradigm Analyst',
        role: 'Independence from dominant paradigms',
        confidence: analysis.confidence,
        findings: analysis.findings,
        recommendations: analysis.recommendations,
        score: analysis.score,
        reasoning: analysis.reasoning
      }
    } catch (error) {
      console.error('Paradigm analysis error:', error)
      throw new Error('Failed to complete paradigm analysis')
    }
  }

  /**
   * Theory Lab Chat Agent - Real OpenAI Analysis
   */
  static async theoryLabChat(
    message: string,
    relevantKnowledge: PhysicsChunk[]
  ): Promise<{
    response: string
    confidence: number
    domains: string[]
  }> {
    const domains = [...new Set(relevantKnowledge.map(k => k.domain).filter(d => d && d !== 'general'))]
    
    const prompt = `You are a brilliant theoretical physicist and research mentor helping develop new physics theories.

USER QUERY: "${message}"

RELEVANT KNOWLEDGE FROM DATABASE:
${relevantKnowledge.slice(0, 5).map(k => `
Domain: ${k.domain}
Source: ${k.sourceDocument}
Content: ${k.content.substring(0, 300)}
Concepts: ${k.concepts?.join(', ') || 'None'}
${k.hasMathematicalContent ? `Equations: ${k.equations?.slice(0, 2).join(', ')}` : ''}
`).join('\n---\n')}

PHYSICS DOMAINS IDENTIFIED: ${domains.join(', ')}

Provide expert guidance for theory development. Include:
1. Analysis of the theoretical concept
2. Connections to existing physics knowledge
3. Mathematical framework suggestions
4. Experimental validation approaches
5. Next steps for development

Be specific, technical, and actionable. Reference the knowledge base findings.`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 2000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from OpenAI')

      // Calculate confidence based on knowledge base relevance
      const confidence = Math.min(95, 60 + (relevantKnowledge.length * 5))

      return {
        response: content,
        confidence,
        domains: domains as string[]
      }
    } catch (error) {
      console.error('Theory lab chat error:', error)
      throw new Error('Failed to process theory lab chat')
    }
  }

  /**
   * Generate Executive Summary - Real OpenAI Analysis
   */
  static async generateExecutiveSummary(
    processedDoc: ProcessedDocument,
    agentAnalyses: AgentAnalysis[],
    relevantKnowledge: PhysicsChunk[]
  ): Promise<string> {
    const prompt = `You are a senior research director creating an executive summary of a physics paper analysis.

DOCUMENT:
- Title: ${processedDoc.metadata.title || 'Untitled'}
- Authors: ${processedDoc.metadata.authors?.join(', ') || 'Not specified'}
- Word Count: ${processedDoc.metadata.wordCount}
- Domains: ${[...new Set(processedDoc.chunks.map(c => c.metadata.domain))].join(', ')}

AGENT ANALYSES:
${agentAnalyses.map(a => `
${a.agent} (Confidence: ${a.confidence}%, Score: ${a.score}/10):
Key Findings: ${a.findings.slice(0, 2).join('; ')}
Reasoning: ${a.reasoning.substring(0, 200)}
`).join('\n')}

KNOWLEDGE BASE CONNECTIONS: ${relevantKnowledge.length} relevant sources found

Create a concise, professional executive summary (2-3 sentences) that captures the essence of this analysis.`

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      })

      return response.choices[0]?.message?.content || 'Analysis completed with multi-agent evaluation.'
    } catch (error) {
      console.error('Executive summary generation error:', error)
      return 'Comprehensive multi-agent analysis completed with detailed findings and recommendations.'
    }
  }
}

