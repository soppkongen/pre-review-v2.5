import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Serious review for serious thinkers.
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Peer review using advanced intelligence.
          </p>
          
          <Button size="lg" className="bg-teal-700 hover:bg-teal-800">
            Start Review
          </Button>
        </div>
      </section>

      {/* How Pre-Review Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How Pre-Review Works</h2>
          <p className="text-gray-600 text-center mb-12">
            Our multi-agent system provides comprehensive analysis that goes beyond traditional peer review.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Submit Your Paper</h3>
                <p className="text-gray-600">
                  Upload PDF, arXiv or DOI files for comprehensive analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Epistemic Evaluation</h3>
                <p className="text-gray-600">
                  Multi-agent system evaluates scientific rigor and methodology.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Detailed Report</h3>
                <p className="text-gray-600">
                  Receive comprehensive analysis with actionable insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Built on Trust & Transparency</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Data Privacy</h3>
                <p className="text-gray-600">
                  Your papers are processed securely and never stored or shared.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Scientific Rigor</h3>
                <p className="text-gray-600">
                  Rigorous evaluation based on merit, not paradigm conformity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
