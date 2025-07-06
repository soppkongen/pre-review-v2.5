import Link from "next/link";
export function Footer() {
    return (<footer className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.webp" alt="Pre-Review" className="h-8 w-8"/>
              <span className="font-semibold text-gray-900">Pre-Review</span>
            </div>
            <p className="text-sm text-gray-600">
              Epistemic counterintelligence for research papers. Fair, transparent, post-paradigm peer review.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Review Paper
                </Link>
              </li>
              <li>
                <Link href="/theory-lab" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Theory Lab
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Related Tools */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Tools</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.t-pip.no/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  The People's Intelligence Project
                </a>
              </li>
              <li>
                <a href="https://wordsmimir.t-pip.no/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Words Mimir
                </a>
              </li>
              <li>
                <a href="https://realitychecker.t-pip.no/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                  Reality Checker
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">© 2025 People's Intelligence Project. All rights reserved.</p>
          <p className="text-sm text-gray-600 mt-2 md:mt-0">Built with epistemic integrity in mind.</p>
        </div>
      </div>
    </footer>);
}
