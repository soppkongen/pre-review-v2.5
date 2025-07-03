import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Pre-Review</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Epistemic counterintelligence for research papers. Fair, transparent, post-paradigm peer review.
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              Pre-Review addresses a fundamental crisis in academic publishing: the systematic rejection of 
              paradigm-shifting research due to institutional bias and paradigm lock-in.
            </p>
            <p>
              Our mission is to provide researchers with fair, transparent, and scientifically rigorous evaluation 
              that separates genuine scientific merit from conformity to established paradigms.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Does this work for all scientific fields?</AccordionTrigger>
              <AccordionContent>
                While our system is designed with physics in mind, the epistemic analysis principles apply 
                across scientific disciplines. We evaluate methodology, logical consistency, and paradigm 
                independence regardless of field.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How does the multi-agent system work?</AccordionTrigger>
              <AccordionContent>
                Our system employs specialized AI agents that evaluate different aspects of your research: 
                methodology, mathematical consistency, citation analysis, and paradigm independence. Each 
                agent provides independent analysis that is then synthesized into a comprehensive report.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Is my research data secure?</AccordionTrigger>
              <AccordionContent>
                Yes. Your papers are processed securely and automatically deleted after analysis. We never 
                store or share your research content. All processing is done in isolated environments with 
                strict data protection protocols.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Are there other tools for critical thinking and analysis?</AccordionTrigger>
              <AccordionContent>
                Pre-Review is part of the People's Intelligence Project ecosystem, which includes Words Mimir 
                (text analysis for emotional manipulation) and Reality Checker (advanced content examination). 
                All tools focus on promoting clear thinking and reducing bias.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact */}
        <Card className="bg-gray-50 border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? We're here to help.
            </p>
            <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
              <Link href="mailto:contact@prev.t-pip.no">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

