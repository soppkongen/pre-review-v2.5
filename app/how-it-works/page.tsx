import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Search, BarChart3, Calculator, Brain } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How Pre-Review Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our revolutionary multi-agent system goes beyond traditional peer review to provide comprehensive epistemic
            analysis of your research papers.
          </p>
        </div>

        {/* Epistemic Counterintelligence */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Epistemic Counterintelligence</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Pre-Review employs a sophisticated multi-agent architecture that operates simultaneously at multiple
              levels of analysis. Unlike traditional peer review that focuses solely on scientific validity, our system
              conducts deep epistemic archaeology to uncover the hidden assumptions, paradigm dependencies, and
              institutional biases that shape scientific evaluation.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              This revolutionary approach addresses the paradigm conformity crisis that has led to the systematic
              rejection of breakthrough theories like Eric Weinstein's Geometric Unity and other paradigm-shifting
              research. By separating scientific merit from institutional capture, we create a pathway for genuine
              scientific innovation.
            </p>
          </CardContent>
        </Card>

        {/* The Analysis Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">The Analysis Process</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <FileText className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Paper Ingestion</h3>
                <p className="text-sm text-gray-600">
                  Advanced parsing extracts text, equations, references, and structural elements from your paper
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <Users className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Multi-Agent Analysis</h3>
                <p className="text-sm text-gray-600">
                  Specialized agents work in parallel to evaluate different aspects of your research
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <Search className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Epistemic Archaeology</h3>
                <p className="text-sm text-gray-600">
                  Deep analysis traces assumptions back to their institutional and ideological origins
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <BarChart3 className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Report Generation</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive analysis compiled into actionable insights and recommendations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Multi-Agent Architecture */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Multi-Agent Architecture</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-teal-600" />
                  Mathematical Analysis Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Evaluate mathematical rigor, consistency, and validity of equations and proofs.
                </p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Key Capabilities:</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Equation verification</li>
                    <li>• Proof validation</li>
                    <li>• Consistency checking</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-teal-600" />
                  Theoretical Coherence Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Assess logical structure, conceptual coherence, and argument validity.
                </p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Key Capabilities:</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Logic analysis</li>
                    <li>• Conceptual mapping</li>
                    <li>• Argument structure</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
