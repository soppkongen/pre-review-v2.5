import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Pre-Review</h3>
            <p className="text-sm text-gray-600">
              Epistemic counterintelligence for research papers. Fair, transparent, post-paradigm peer review.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/how-it-works" className="hover:text-gray-900">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-900">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Related Tools</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-gray-900">
                  People's Intelligence Project
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Words Mimir
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Reality Checker
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 People's Intelligence Project. All rights reserved.</p>
          <p className="text-sm text-gray-600 mt-2 md:mt-0">Built with epistemic integrity in mind.</p>
        </div>
      </div>
    </footer>
  )
}
