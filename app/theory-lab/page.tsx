
'use client';


import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Send,
  Brain,
  Calculator,
  Search,
  FileText,
  Download,
  Settings,
  Users,
  Lightbulb,
  Zap,
  Target,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  agent?: string
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  specialty: string
  color: string
  icon: any
  active: boolean
}

interface AnalysisResult {
  agentId: string
  analysis: string
  timestamp: string
}

export default function TheoryLabPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to Theory Lab! I'm your research assistant. I can help you develop theories, analyze concepts, and explore physics problems. What would you like to work on today?",
      agent: "coordinator",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const agents: Agent[] = [
    {
      id: "coordinator",
      name: "Research Coordinator",
      specialty: "Project management and direction",
      color: "bg-blue-600",
      icon: Target,
      active: true,
    },
    {
      id: "theorist",
      name: "Theoretical Physicist",
      specialty: "Theory development and validation",
      color: "bg-purple-600",
      icon: Brain,
      active: true,
    },
    {
      id: "mathematician",
      name: "Mathematical Analyst",
      specialty: "Equations and mathematical rigor",
      color: "bg-green-600",
      icon: Calculator,
      active: true,
    },
    {
      id: "experimentalist",
      name: "Experimental Designer",
      specialty: "Testable predictions and validation",
      color: "bg-orange-600",
      icon: Zap,
      active: false,
    },
    {
      id: "historian",
      name: "Physics Historian",
      specialty: "Historical context and precedents",
      color: "bg-indigo-600",
      icon: Search,
      active: false,
    },
  ]

  // Cleanup function for EventSource
  const cleanupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupEventSource()
    }
  }, [cleanupEventSource])

  const startAnalysis = useCallback(async (paperContent: string, paperTitle: string) => {
    // Cleanup any existing connections
    cleanupEventSource()
    
    setIsAnalyzing(true)
    setAnalysisResults([])

    try {
      const url = `/api/analysis/stream?paperContent=${encodeURIComponent(paperContent)}&paperTitle=${encodeURIComponent(paperTitle)}`
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      // Set timeout to prevent infinite connections
      timeoutRef.current = setTimeout(() => {
        cleanupEventSource()
        setIsAnalyzing(false)
        console.warn("Analysis timeout - connection closed")
      }, 300000) // 5 minute timeout

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "analysis-chunk") {
            setAnalysisResults((prev) => {
              const updated = [...prev]
              const existingIndex = updated.findIndex((r) => r.agentId === data.agentId)

              if (existingIndex >= 0) {
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  analysis: updated[existingIndex].analysis + data.chunk
                }
              } else {
                updated.push({
                  agentId: data.agentId,
                  analysis: data.chunk,
                  timestamp: data.timestamp,
                })
              }

              return updated
            })
          } else if (data.type === "analysis-complete") {
            setIsAnalyzing(false)
            cleanupEventSource()
          } else if (data.type === "error") {
            console.error("Analysis error:", data.error)
            setIsAnalyzing(false)
            cleanupEventSource()
          }
        } catch (parseError) {
          console.error("Failed to parse event data:", parseError)
        }
      }

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error)
        setIsAnalyzing(false)
        cleanupEventSource()
      }

    } catch (error) {
      console.error("Analysis start error:", error)
      setIsAnalyzing(false)
      cleanupEventSource()
    }
  }, [cleanupEventSource])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response with proper cleanup
    const responses = [
      {
        agent: "theorist",
        content:
          "That's a fascinating concept! From a theoretical perspective, we need to consider the fundamental symmetries involved. The mathematical framework would likely require extending current field theory to account for these new interactions.",
      },
      {
        agent: "mathematician",
        content:
          "Let me work through the mathematical implications. If we assume a Lagrangian of the form L = ψ†(iγμDμ - m)ψ + additional terms, we need to ensure gauge invariance and renormalizability.",
      },
      {
        agent: "coordinator",
        content:
          "Based on the theoretical and mathematical analysis, I suggest we focus on three key areas: 1) Developing the mathematical formalism, 2) Identifying testable predictions, and 3) Connecting to existing experimental data.",
      },
    ]

    // Use timeout with cleanup
    const responseTimeout = setTimeout(() => {
      responses.forEach((response, index) => {
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + index).toString(),
            role: "assistant",
            content: response.content,
            agent: response.agent,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, assistantMessage])

          if (index === responses.length - 1) {
            setIsTyping(false)
          }
        }, (index + 1) * 1500)
      })
    }, 1000)

    // Cleanup timeout on unmount
    return () => clearTimeout(responseTimeout)
  }, [inputMessage, isTyping])

  const getAgentInfo = useCallback((agentId: string) => {
    return agents.find((agent) => agent.id === agentId) || agents[0]
  }, [agents])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                Theory Lab
              </h1>
              <p className="text-gray-600 mt-1">Interactive research environment with specialized AI agents</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Session
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Research Conversation</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {agents.filter((a) => a.active).length} agents active
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-full">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                          {message.role === "assistant" && message.agent && (
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className={`w-6 h-6 ${getAgentInfo(message.agent).color} rounded-full flex items-center justify-center`}
                              >
                                {(() => {
                                  const IconComponent = getAgentInfo(message.agent).icon
                                  return <IconComponent className="h-3 w-3 text-white" />
                                })()}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {getAgentInfo(message.agent).name}
                              </span>
                              <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                            </div>
                          )}
                          <div
                            className={`rounded-lg p-3 ${
                              message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Describe your theory, ask questions, or request analysis..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        LaTeX
                      </Button>
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-1" />
                        Reference
                      </Button>
                    </div>
                    <span className="text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Agents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  AI Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-8 h-8 ${agent.color} rounded-full flex items-center justify-center`}>
                      <agent.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.specialty}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${agent.active ? "bg-green-500" : "bg-gray-300"}`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Research Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Research Context</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="current" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="current">Current</TabsTrigger>
                    <TabsTrigger value="references">References</TabsTrigger>
                  </TabsList>

                  <TabsContent value="current" className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Active Topics</h4>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          Quantum Field Theory
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Gauge Invariance
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Renormalization
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-sm mb-2">Key Equations</h4>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">L = ψ†(iγμDμ - m)ψ</div>
                    </div>
                  </TabsContent>

                  <TabsContent value="references" className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium">Weinberg, S. (1995)</div>
                          <div>The Quantum Theory of Fields</div>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium">Peskin & Schroeder (1995)</div>
                          <div>An Introduction to Quantum Field Theory</div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResults.map((result) => (
                      <div key={result.agentId} className="p-3 bg-gray-50 rounded">
                        <div className="font-medium text-sm mb-1">{getAgentInfo(result.agentId).name}</div>
                        <div className="text-xs text-gray-600">{result.analysis.substring(0, 100)}...</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
