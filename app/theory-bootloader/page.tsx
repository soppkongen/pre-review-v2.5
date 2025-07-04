"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Upload, Mic, FileText, ArrowRight, Lightbulb, Target, Map, Zap } from "lucide-react"
import Link from "next/link"

export default function TheoryBootloaderPage() {
  const [concept, setConcept] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!concept.trim()) return
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisResults(null)
    try {
      // Call real backend API for theory analysis
      const response = await fetch('/api/theory-lab/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: concept })
      })
      const data = await response.json()
      if (data.success && data.response) {
        setAnalysisResults(data.response)
      } else {
        setAnalysisResults({ error: data.error || 'Analysis failed.' })
      }
    } catch (error) {
      setAnalysisResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(100)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Theory Bootloader</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform loose concepts and ideas into structured theoretical frameworks. Input your thoughts in any format
            and let our AI help you develop them into research-ready theories.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Concept Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="text">Text Input</TabsTrigger>
                    <TabsTrigger value="voice">Voice Input</TabsTrigger>
                    <TabsTrigger value="file">File Upload</TabsTrigger>
                    <TabsTrigger value="sketch">Sketch</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder="Describe your concept, theory, or idea in any format. You can include equations, references, or just rough thoughts..."
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      className="min-h-[200px] text-base"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{concept.length} characters</span>
                      <Button
                        onClick={handleAnalyze}
                        disabled={!concept.trim() || isAnalyzing}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isAnalyzing ? "Analyzing..." : "Analyze Concept"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="voice" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Click to start voice recording</p>
                      <Button variant="outline">
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="file" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Upload concept documents, notes, or research drafts</p>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="sketch" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">Sketch interface coming soon</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Analysis in Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={analysisProgress} className="mb-4" />
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className={analysisProgress >= 20 ? "text-green-600" : ""}>✓ Parsing concept structure...</div>
                    <div className={analysisProgress >= 40 ? "text-green-600" : ""}>✓ Identifying key domains...</div>
                    <div className={analysisProgress >= 60 ? "text-green-600" : ""}>✓ Mapping to knowledge base...</div>
                    <div className={analysisProgress >= 80 ? "text-green-600" : ""}>
                      ✓ Generating recommendations...
                    </div>
                    <div className={analysisProgress >= 100 ? "text-green-600" : ""}>✓ Analysis complete!</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {analysisResults && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Core Idea */}
                  <div>
                    <h3 className="font-semibold mb-2">Core Idea Identified</h3>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{analysisResults.coreIdea}</p>
                    <div className="mt-2">
                      <Badge variant="secondary">Confidence: {(analysisResults.confidence * 100).toFixed(0)}%</Badge>
                    </div>
                  </div>

                  {/* Domains */}
                  <div>
                    <h3 className="font-semibold mb-2">Related Physics Domains</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.domains.map((domain: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Knowledge Gaps */}
                  <div>
                    <h3 className="font-semibold mb-2">Identified Knowledge Gaps</h3>
                    <ul className="space-y-2">
                      {analysisResults.gaps.map((gap: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          <span className="text-gray-700">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Research Suggestions */}
                  <div>
                    <h3 className="font-semibold mb-2">Research Direction Suggestions</h3>
                    <ul className="space-y-2">
                      {analysisResults.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">→</span>
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Related Theories */}
                  <div>
                    <h3 className="font-semibold mb-2">Related Theories</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.relatedTheories.map((theory: string, index: number) => (
                        <Badge key={index} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          {theory}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t">
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href="/theory-lab">
                        Continue in Theory Lab
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <Button variant="outline">Export Analysis</Button>
                    <Button variant="outline">Refine Concept</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example Concepts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3 bg-transparent"
                  onClick={() =>
                    setConcept(
                      "What if quantum entanglement could be used to transmit information faster than light through manipulation of vacuum energy fluctuations?",
                    )
                  }
                >
                  <div>
                    <div className="font-medium text-sm">Quantum Communication</div>
                    <div className="text-xs text-gray-500">FTL information transfer via entanglement</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3 bg-transparent"
                  onClick={() =>
                    setConcept(
                      "Could dark matter be explained by extra-dimensional gravitational effects that only manifest at galactic scales?",
                    )
                  }
                >
                  <div>
                    <div className="font-medium text-sm">Dark Matter Theory</div>
                    <div className="text-xs text-gray-500">Extra-dimensional gravity hypothesis</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-left justify-start h-auto p-3 bg-transparent"
                  onClick={() =>
                    setConcept(
                      "Time dilation effects near black holes might create closed timelike curves that could explain quantum measurement collapse",
                    )
                  }
                >
                  <div>
                    <div className="font-medium text-sm">Quantum Gravity</div>
                    <div className="text-xs text-gray-500">Time loops and measurement problem</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Process Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Process Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-sm">Input Concept</div>
                      <div className="text-xs text-gray-500">Describe your idea in any format</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-sm">AI Analysis</div>
                      <div className="text-xs text-gray-500">Multi-agent concept mapping</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-sm">Structure & Refine</div>
                      <div className="text-xs text-gray-500">Identify gaps and directions</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-medium text-sm">Theory Lab</div>
                      <div className="text-xs text-gray-500">Interactive development</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• Be as specific as possible about your core idea</p>
                <p>• Include any relevant equations or mathematical concepts</p>
                <p>• Mention related theories or phenomena you're thinking about</p>
                <p>• Don't worry about perfect formatting - rough ideas work great</p>
                <p>• The more context you provide, the better the analysis</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
