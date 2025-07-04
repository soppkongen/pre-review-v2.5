'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Download, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Users,
  Brain,
  Target,
  TrendingUp,
  Clock,
  ArrowLeft
} from "lucide-react"

interface AnalysisResult {
  analysisId: string
  documentName: string
  analysisType: string
  timestamp: string
  overallScore: number
  confidence: number
  summary: string
  keyFindings: string[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  agentResults: AgentResult[]
  detailedAnalysis: DetailedAnalysis
}

interface AgentResult {
  agentName: string
  role: string
  confidence: number
  findings: string[]
  recommendations: string[]
}

interface DetailedAnalysis {
  epistemicEvaluation: {
    score: number
    details: string
    issues: string[]
  }
  methodologyAssessment: {
    score: number
    details: string
    strengths: string[]
    concerns: string[]
  }
  paradigmIndependence: {
    score: number
    details: string
    biases: string[]
  }
  reproducibility: {
    score: number
    details: string
    factors: string[]
  }
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const analysisId = searchParams.get('id')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!analysisId || analysisId === 'undefined') {
      setError('No analysis ID provided')
      setLoading(false)
    } else {
      fetchResults(analysisId)
    }
  }, [analysisId])

  const fetchResults = async (id: string) => {
    try {
      const response = await fetch(`/api/analysis/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch results')
      }
      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return "default"
    if (score >= 6) return "secondary"
    return "destructive"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Loading Analysis Results...</h2>
            <p className="text-gray-600 mt-2">Please wait while we retrieve your analysis.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Error Loading Results</h2>
            <p className="text-gray-600 mt-2">{error || 'Results not found'}</p>
            <Link href="/submit">
              <Button className="mt-4">Submit New Analysis</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/submit">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submit
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              {new Date(results.timestamp).toLocaleString()}
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-lg text-gray-700">{results.documentName}</span>
                </div>
                <Badge variant="outline">{results.analysisType}</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(results.overallScore)}`}>
                  {results.overallScore}/10
                </div>
                <p className="text-sm text-gray-600 mt-1">Overall Score</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {Math.round(results.confidence * 100)}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Confidence</p>
              </div>
              <div className="text-center">
                <Badge variant={getScoreBadgeVariant(results.overallScore)} className="text-lg px-4 py-2">
                  {results.overallScore >= 8 ? 'Excellent' : results.overallScore >= 6 ? 'Good' : 'Needs Work'}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">Rating</p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Executive Summary</h3>
              <p className="text-gray-700 leading-relaxed">{results.summary}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{finding}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Strengths & Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                  <ul className="space-y-1">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-orange-700 mb-2">Areas for Improvement</h4>
                  <ul className="space-y-1">
                    {results.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Epistemic Evaluation</h4>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={results.detailedAnalysis.epistemicEvaluation.score * 10} className="flex-1" />
                  <span className={`font-semibold ${getScoreColor(results.detailedAnalysis.epistemicEvaluation.score)}`}>
                    {results.detailedAnalysis.epistemicEvaluation.score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{results.detailedAnalysis.epistemicEvaluation.details}</p>
                {results.detailedAnalysis.epistemicEvaluation.issues.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Issues to Address:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {results.detailedAnalysis.epistemicEvaluation.issues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Methodology Assessment</h4>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={results.detailedAnalysis.methodologyAssessment.score * 10} className="flex-1" />
                  <span className={`font-semibold ${getScoreColor(results.detailedAnalysis.methodologyAssessment.score)}`}>
                    {results.detailedAnalysis.methodologyAssessment.score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{results.detailedAnalysis.methodologyAssessment.details}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Paradigm Independence</h4>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={results.detailedAnalysis.paradigmIndependence.score * 10} className="flex-1" />
                  <span className={`font-semibold ${getScoreColor(results.detailedAnalysis.paradigmIndependence.score)}`}>
                    {results.detailedAnalysis.paradigmIndependence.score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{results.detailedAnalysis.paradigmIndependence.details}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Reproducibility</h4>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={results.detailedAnalysis.reproducibility.score * 10} className="flex-1" />
                  <span className={`font-semibold ${getScoreColor(results.detailedAnalysis.reproducibility.score)}`}>
                    {results.detailedAnalysis.reproducibility.score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{results.detailedAnalysis.reproducibility.details}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Results */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.agentResults.map((agent, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{agent.agentName}</h4>
                      <p className="text-sm text-gray-600">{agent.role}</p>
                    </div>
                    <Badge variant="outline">
                      {Math.round(agent.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Key Findings</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {agent.findings.map((finding, fIndex) => (
                          <li key={fIndex}>• {finding}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {agent.recommendations.map((rec, rIndex) => (
                          <li key={rIndex}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Recommendations for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/submit" className="flex-1">
            <Button className="w-full bg-teal-600 hover:bg-teal-700">
              Submit Another Paper
            </Button>
          </Link>
          <Link href="/theory-lab" className="flex-1">
            <Button variant="outline" className="w-full">
              Develop Theory Further
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
