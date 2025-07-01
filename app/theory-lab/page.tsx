"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function TheoryLabPage() {
  const [content, setContent] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!content.trim()) return
    
    setLoading(true)
    try {
      // This will connect to your Weaviate knowledge base for suggestions
      const response = await fetch("/api/theory/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      })
      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Theory Lab</h1>
        <p className="text-gray-600">Develop and refine your theoretical ideas with AI assistance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Theory</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your theoretical ideas, concepts, or hypotheses..."
              className="min-h-[400px] mb-4"
            />
            <Button 
              onClick={handleAnalyze} 
              disabled={loading}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {loading ? "Analyzing..." : "Get AI Suggestions"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded">
                    {suggestion}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  Enter your theory above and click "Get AI Suggestions" to receive feedback
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
