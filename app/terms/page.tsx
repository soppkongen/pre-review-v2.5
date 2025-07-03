import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Pre-Review's epistemic counterintelligence platform, you accept and agree 
              to be bound by the terms and provision of this agreement. If you do not agree to abide by the 
              above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
            <p className="text-gray-700 leading-relaxed">
              Pre-Review provides AI-powered analysis and review services for research papers, manuscripts, 
              and academic content. Our multi-agent system offers epistemic evaluation, paradigm independence 
              analysis, and comprehensive peer review assistance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Ensure you have the right to upload and analyze the content you submit</li>
              <li>Use the platform for legitimate academic and research purposes</li>
              <li>Respect intellectual property rights and academic integrity</li>
              <li>Not attempt to reverse engineer or misuse our AI systems</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              You retain all rights to your research content. Pre-Review does not claim ownership of any 
              materials you upload. Our analysis and insights are provided as a service to assist your 
              research process.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to maintain high availability of our services but cannot guarantee uninterrupted access. 
              We reserve the right to modify, suspend, or discontinue any aspect of the service with or without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Pre-Review provides analysis and insights as a research tool. Our AI-generated reviews and 
              suggestions should be considered as one input among many in your research process. We are not 
              liable for any decisions made based on our analysis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Academic Integrity</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform is designed to enhance and support the peer review process, not replace human 
              judgment. Users are responsible for ensuring their use of our services complies with their 
              institution's academic integrity policies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective immediately 
              upon posting. Your continued use of the service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms of Service, please contact us through our platform 
              or visit our About page for more information.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

