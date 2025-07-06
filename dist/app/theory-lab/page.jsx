'use client';
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Brain, Calculator, Users, Target, } from "lucide-react";
export default function TheoryLabPage() {
    const [messages, setMessages] = useState([
        {
            id: "1",
            role: "assistant",
            content: "Welcome to Theory Lab! I'm here to help you develop your research theories. You can start by describing your concept, uploading files, or asking questions about your research.",
            agent: "Research Coordinator",
            timestamp: new Date(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const agents = [
        {
            id: "coordinator",
            name: "Research Coordinator",
            specialty: "Project management and direction",
            color: "bg-blue-500",
            icon: Users,
            active: true,
        },
        {
            id: "theorist",
            name: "Theoretical Physicist",
            specialty: "Theory development and validation",
            color: "bg-purple-500",
            icon: Brain,
            active: true,
        },
        {
            id: "mathematician",
            name: "Mathematical Analyst",
            specialty: "Equations and mathematical rigor",
            color: "bg-green-500",
            icon: Calculator,
            active: true,
        },
        {
            id: "experimenter",
            name: "Experimental Designer",
            specialty: "Testable predictions and validation",
            color: "bg-orange-500",
            icon: Target,
            active: false,
        },
    ];
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading)
            return;
        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: inputMessage,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);
        try {
            const response = await fetch('/api/theory-lab/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversationId: 'theory-lab-session',
                    analysisType: 'theory_development'
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            const data = await response.json();
            if (data.success && data.response) {
                const aiMessage = {
                    id: data.response.id,
                    role: "assistant",
                    content: data.response.content,
                    agent: data.response.agent,
                    timestamp: new Date(data.response.timestamp),
                };
                setMessages(prev => [...prev, aiMessage]);
            }
            else {
                throw new Error(data.error || 'Unknown error');
            }
        }
        catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
                agent: "System",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    return (<div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Theory Lab</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Interactive space for developing research theories with AI assistance. 
            Transform ideas into well-structured, scientifically grounded papers ready for peer review.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* AI Agents Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5"/>
                  AI Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agents.map((agent) => {
            const Icon = agent.icon;
            return (<div key={agent.id} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${agent.active ? 'bg-green-500' : 'bg-gray-300'}`}/>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.specialty}</div>
                      </div>
                    </div>);
        })}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5"/>
                  Theory Development Chat
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (<div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${message.role === "user"
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-900"}`}>
                          {message.agent && (<div className="text-xs font-medium mb-1 opacity-75">
                              {message.agent}
                            </div>)}
                          <div className="text-sm">{message.content}</div>
                        </div>
                      </div>))}
                    {isLoading && (<div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="text-sm text-gray-600">Thinking...</div>
                        </div>
                      </div>)}
                  </div>
                  <div ref={messagesEndRef}/>
                </ScrollArea>

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea placeholder="Ask questions, share ideas, or request analysis..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 min-h-[60px] resize-none"/>
                    <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading} className="bg-teal-600 hover:bg-teal-700">
                      <Send className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>);
}
