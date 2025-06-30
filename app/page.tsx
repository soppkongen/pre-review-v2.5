import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Users, FileSearch, Shield, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Serious review for serious thinkers.</h1>
          <p className="text-xl text-gray-600 mb-8">Peer review meets epistemic counterintelligence.</p>
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
            <Link href="/submit">Start Review →</Link>
          </Button>
        </div>
      </section>

      {/* How Pre-Review Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How Pre-Review Works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our multi-agent system provides comprehensive analysis that goes beyond traditional peer review
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <Upload className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Submit Your Paper</h3>
                <p className="text-gray-600">Upload PDF, LaTeX, or DOCX files for comprehensive analysis</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <Users className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Epistemic Evaluation</h3>
                <p className="text-gray-600">Multi-agent system evaluates scientific merit and epistemic integrity</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <FileSearch className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Detailed Report</h3>
                <p className="text-gray-600">Receive comprehensive analysis with actionable insights</p>
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

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Data Privacy</h3>
                <p className="text-gray-600">Your papers are processed securely and deleted after analysis</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <Award className="h-12 w-12 text-teal-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Scientific Rigor</h3>
                <p className="text-gray-600">Rigorous evaluation based on merit, not paradigm conformity</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
