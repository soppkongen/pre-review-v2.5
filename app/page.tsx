import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, FileSearch, Shield, Award, Brain, Search, MessageSquare, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">AI-Powered Physics Research Assistant</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Revolutionary multi-agent system for comprehensive epistemic analysis, theory development, and research
            validation powered by advanced physics knowledge base.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/submit">Start Pre-Review Analysis →</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Link href="/theory-bootloader">Launch Theory Bootloader</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 bg-transparent"
            >
              <Link href="/theory-lab">Enter Theory Lab</Link>
            </Button>
          </div>

          {/* Quick Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Try a Quick Knowledge Base Search</h3>
            <div className="flex gap-2">
              <Input placeholder="Search physics concepts, equations, or theories..." className="flex-1" />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Search through 115,000+ physics knowledge chunks with semantic understanding
            </p>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comprehensive Research Workflow</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            From initial concept to publication-ready analysis, our integrated system supports every stage of physics
            research
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pre-Review Analysis */}
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <FileSearch className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Pre-Review Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Upload research papers for comprehensive epistemic analysis that goes beyond traditional peer review.
                </p>
                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                  <li>• Multi-agent evaluation system</li>
                  <li>• Paradigm independence analysis</li>
                  <li>• Mathematical consistency checking</li>
                  <li>• Citation and methodology review</li>
                </ul>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/submit">Try Demo Analysis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Theory Bootloader */}
            <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Theory Bootloader</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Transform loose concepts and ideas into structured theoretical frameworks ready for development.
                </p>
                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                  <li>• Concept mapping and analysis</li>
                  <li>• Gap identification</li>
                  <li>• Research direction suggestions</li>
                  <li>• Seamless Theory Lab integration</li>
                </ul>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/theory-bootloader">Start Bootloader</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Theory Lab */}
            <Card className="border-purple-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Theory Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Interactive research environment with AI agents specialized in different aspects of physics.
                </p>
                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                  <li>• Multi-agent conversation system</li>
                  <li>• Real-time theory development</li>
                  <li>• LaTeX equation support</li>
                  <li>• Reference management</li>
                </ul>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/theory-lab">Enter Lab</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Knowledge Base Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Physics Knowledge Base</h2>
          <p className="text-gray-600 text-center mb-12">
            Explore our comprehensive physics knowledge base with advanced semantic search
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Search Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Advanced Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Search concepts, equations, or theories..." />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    Quantum Mechanics
                  </Button>
                  <Button variant="outline" size="sm">
                    Relativity
                  </Button>
                  <Button variant="outline" size="sm">
                    Thermodynamics
                  </Button>
                  <Button variant="outline" size="sm">
                    Electromagnetism
                  </Button>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/knowledge-base">Explore Knowledge Base</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Knowledge Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Knowledge Base Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">115,000+</div>
                    <div className="text-sm text-gray-500">Knowledge Chunks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">50+</div>
                    <div className="text-sm text-gray-500">Physics Domains</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">10,000+</div>
                    <div className="text-sm text-gray-500">Equations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">5,000+</div>
                    <div className="text-sm text-gray-500">Concepts</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Continuously updated with the latest physics research and validated theoretical frameworks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Built on Trust & Transparency</h2>
          <p className="text-gray-600 text-center mb-12">
            Your research deserves evaluation free from institutional bias and paradigm lock-in
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Data Privacy</h3>
                <p className="text-gray-600">
                  Your papers are processed securely and deleted after analysis. We never store or share your research.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Scientific Rigor</h3>
                <p className="text-gray-600">
                  Rigorous evaluation based on merit, not paradigm conformity. Our multi-agent system ensures
                  comprehensive analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Open Science</h3>
                <p className="text-gray-600">
                  Promoting open scientific discourse and challenging institutional gatekeeping in academic publishing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Research?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the epistemic revolution and experience research evaluation based on scientific merit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/submit">Start Free Analysis</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
