import Link from "next/link";
export default function PrivacyPage() {
    return (<div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Pre-Review ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              epistemic counterintelligence platform for research paper analysis.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Research Papers and Content</h3>
                <p className="text-gray-700 leading-relaxed">
                  We process research papers, manuscripts, and related content that you upload for analysis. 
                  This content is processed securely using AI analysis and is not stored permanently on our servers.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We collect information about how you interact with our platform, including analysis requests, 
                  chat interactions with our AI agents, and platform usage patterns.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Provide epistemic analysis and peer review services</li>
              <li>Improve our AI agents and analysis capabilities</li>
              <li>Ensure platform security and prevent misuse</li>
              <li>Communicate with you about our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Your research content is processed securely using AI analysis. All data is encrypted in transit 
              and at rest. We implement appropriate technical and organizational measures to protect your information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              Research papers and analysis results are automatically deleted after processing. We do not store 
              or share your research content. Conversation logs with AI agents may be retained for service 
              improvement purposes but are anonymized.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us through our platform 
              or visit our About page for more information.
            </p>
          </section>
        </div>
      </div>
    </div>);
}
