import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, MessageSquare, CheckCircle } from "lucide-react";
export default function HomePage() {
    return (<div className="bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Serious review for serious thinkers.
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Peer review meets epistemic counterintelligence.
          </p>

          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3">
            <Link href="/submit">Start Review →</Link>
          </Button>
        </div>
      </section>

      {/* How Pre-Review Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">How Pre-Review Works</h2>
          <p className="text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Our multi-agent system provides comprehensive analysis that goes beyond traditional peer review
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-8 w-8 text-teal-600"/>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Your Paper</h3>
                <p className="text-gray-600">
                  Upload PDF, LaTeX, or DOCX files for comprehensive analysis
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-teal-600"/>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Epistemic Evaluation</h3>
                <p className="text-gray-600">
                  Multi-agent system evaluates methodology and paradigm independence
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-teal-600"/>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Report</h3>
                <p className="text-gray-600">
                  Receive comprehensive analysis with actionable insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Theory Lab Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Develop Your Theories</h2>
          <p className="text-xl text-gray-600 mb-8">
            Interactive space for developing research theories with AI assistance. 
            Transform ideas into well-structured, scientifically grounded papers ready for peer review.
          </p>
          <Button asChild variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50">
            <Link href="/theory-lab">Enter Theory Lab</Link>
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-8">
            Can't find the answer you're looking for? We're here to help.
          </p>
          <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
            <Link href="/about">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>);
}
