import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function FAQPage() {
    const faqs = [
        {
            question: "How does Pre-Review differ from traditional peer review?",
            answer: "Pre-Review uses multi-agent AI systems to evaluate papers based on scientific merit rather than paradigm conformity. Our epistemic archaeology approach uncovers hidden biases and institutional assumptions that traditional peer review often misses.",
        },
        {
            question: "What file formats do you support?",
            answer: "We support PDF, LaTeX (.tex), and Microsoft Word (.docx) files up to 10MB in size.",
        },
        {
            question: "How long does the review process take?",
            answer: "Quick reviews typically complete within 15-30 minutes, while full epistemic analysis can take 1-2 hours depending on paper complexity.",
        },
        {
            question: "Is my research data secure?",
            answer: "Yes. All papers are processed securely with encryption, and we automatically delete your content after analysis. We never store or share your research.",
        },
        {
            question: "What is epistemic archaeology?",
            answer: "Epistemic archaeology is our method of tracing the historical and institutional origins of scientific assumptions, revealing how paradigm lock-in affects research evaluation.",
        },
    ];
    return (<div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Everything you need to know about Pre-Review</p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (<Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{faq.answer}</p>
              </CardContent>
            </Card>))}
        </div>
      </div>
    </div>);
}
