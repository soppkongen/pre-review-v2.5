import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Users } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with the Pre-Review team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input placeholder="What's this about?" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea placeholder="Tell us more..." className="min-h-[120px]" />
              </div>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">Send Message</Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="h-6 w-6 text-teal-600" />
                  <h3 className="font-semibold">Email Support</h3>
                </div>
                <p className="text-gray-600 text-sm">For technical issues and general inquiries</p>
                <p className="text-teal-600 font-medium">support@pre-review.org</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-6 w-6 text-teal-600" />
                  <h3 className="font-semibold">Research Collaboration</h3>
                </div>
                <p className="text-gray-600 text-sm">Interested in collaborating or contributing to the project?</p>
                <p className="text-teal-600 font-medium">research@pre-review.org</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="h-6 w-6 text-teal-600" />
                  <h3 className="font-semibold">Community</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Join our community of researchers working toward epistemic integrity
                </p>
                <Button variant="outline" className="mt-2 bg-transparent">
                  Join Discord
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
