import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Pre-Review</h1>
          <p className="text-xl text-gray-600">
            Addressing the crisis in academic peer review through epistemic counterintelligence
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Pre-Review was created to address a fundamental crisis in academic publishing: the systematic rejection of
              paradigm-shifting research due to institutional bias and paradigm lock-in.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Our mission is to provide researchers with fair, transparent, and scientifically rigorous evaluation that
              separates genuine scientific merit from conformity to established paradigms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Related Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              Pre-Review is part of the{" "}
              <Link href="#" className="text-teal-600 hover:underline">
                People's Intelligence Project
              </Link>{" "}
              ecosystem.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-teal-200">
                <CardHeader>
                  <CardTitle className="text-lg text-teal-700">Words Mimir</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Analyze text for emotional manipulation and logical fallacies.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-teal-200">
                <CardHeader>
                  <CardTitle className="text-lg text-teal-700">Reality Checker</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Advanced AI-powered analysis for content examination.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Join the Epistemic Revolution</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Help us create a future where scientific innovation is evaluated on merit, not paradigm conformity.
            </p>
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link href="/submit">Submit Your Paper</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
