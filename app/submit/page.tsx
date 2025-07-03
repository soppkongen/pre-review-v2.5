'use client'

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Info, Loader2 } from "lucide-react"

export default function SubmitPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState("")
  const [reviewMode, setReviewMode] = useState("full")
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('summary', summary)
      formData.append('reviewMode', reviewMode)

      const response = await fetch('/api/analysis/start', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      
      // Redirect to results page with analysis ID
      router.push(`/results?id=${result.analysisId}`)
      
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit analysis. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Paper for Review</h1>
          <p className="text-gray-600">Upload your research paper for comprehensive epistemic analysis</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Paper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-8 w-8 text-teal-600" />
                  <span className="text-lg font-medium">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg mb-2">Drag and drop your paper here, or click to browse</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports PDF, LaTeX, and Word documents (.docx)
                    <br />
                    Maximum file size: 10MB
                  </p>
                </>
              )}
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.tex,.docx"
                onChange={handleFileSelect}
              />
              <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                Browse Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Paper Summary (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="In 1-2 sentences, describe your paper's core idea..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-sm text-gray-500 mt-2">{summary.length}/500 characters</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Review Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={reviewMode} onValueChange={setReviewMode}>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="quick" id="quick" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="quick" className="text-base font-medium">
                      Quick Review
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Focus on scientific validity, mathematical consistency, logical coherence, empirical basis
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border-2 border-teal-200 bg-teal-50 rounded-lg">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="text-base font-medium">
                      Full Review (Recommended)
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Includes epistemic analysis, paradigm independence, bias detection, assumption archaeology
                    </p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">
                Your paper is processed securely using AI analysis. All data is encrypted and automatically deleted
                after processing. We do not store or share your research content.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-teal-600 hover:bg-teal-700" 
            disabled={!file || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Start Review'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
