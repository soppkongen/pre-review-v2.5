"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Search, BookOpen, TrendingUp, Network, Clock } from "lucide-react";
export default function KnowledgeBasePage() {
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDomains, setSelectedDomains] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState("all");
    const [selectedContentType, setSelectedContentType] = useState("all");
    const [isSearching, setIsSearching] = useState(false); // Declare isSearching variable
    const domains = [
        "Quantum Mechanics",
        "Classical Mechanics",
        "Electromagnetism",
        "Thermodynamics",
        "Relativity",
        "Condensed Matter",
        "Particle Physics",
        "Astrophysics",
        "Optics",
        "Nuclear Physics",
    ];
    const handleSearch = async (query) => {
        if (!query.trim())
            return;
        setIsLoading(true);
        setSearchQuery(query);
        setIsSearching(true); // Set isSearching to true before fetching
        try {
            const response = await fetch(`/api/knowledge/search?q=${encodeURIComponent(query)}&limit=20`);
            const data = await response.json();
            if (data.success) {
                setSearchResults(data.results);
            }
            else {
                console.error("Search failed:", data.error);
            }
        }
        catch (error) {
            console.error("Search error:", error);
        }
        finally {
            setIsLoading(false);
            setIsSearching(false); // Set isSearching to false after fetching
        }
    };
    const handleExplain = async (concept) => {
        try {
            const response = await fetch("/api/knowledge/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ concept, difficulty: "intermediate" }),
            });
            const data = await response.json();
            if (data.success) {
                // Show explanation in a modal or expand section
                alert(data.explanation); // Temporary - replace with proper UI
            }
        }
        catch (error) {
            console.error("Explanation error:", error);
        }
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "introductory":
                return "default";
            case "intermediate":
                return "secondary";
            case "advanced":
                return "destructive";
            default:
                return "outline";
        }
    };
    const getDifficultyClassName = (difficulty) => {
        switch (difficulty) {
            case "introductory":
                return "bg-green-100 text-green-800";
            case "intermediate":
                return "bg-yellow-100 text-yellow-800";
            case "advanced":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (<div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white"/>
            </div>
            Physics Knowledge Base
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive physics knowledge base with advanced semantic search and intelligent filtering
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">115,000+</div>
              <div className="text-sm text-gray-500">Knowledge Chunks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">50+</div>
              <div className="text-sm text-gray-500">Physics Domains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">10,000+</div>
              <div className="text-sm text-gray-500">Equations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5,000+</div>
              <div className="text-sm text-gray-500">Concepts</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Search and Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5"/>
                  Search & Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Query</label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter concepts, equations, or keywords..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}/>
                    <Button onClick={() => handleSearch(searchQuery)} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      <Search className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Domain Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Physics Domains</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {domains.map((domain) => (<div key={domain} className="flex items-center space-x-2">
                        <Checkbox id={domain} checked={selectedDomains.includes(domain)} onCheckedChange={(checked) => {
                if (checked) {
                    setSelectedDomains([...selectedDomains, domain]);
                }
                else {
                    setSelectedDomains(selectedDomains.filter((d) => d !== domain));
                }
            }}/>
                        <label htmlFor={domain} className="text-sm">
                          {domain}
                        </label>
                      </div>))}
                  </div>
                </div>

                <Separator />

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All levels</SelectItem>
                      <SelectItem value="introductory">Introductory</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Type</label>
                  <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="textbook_chapter">Textbook Chapters</SelectItem>
                      <SelectItem value="research_paper">Research Papers</SelectItem>
                      <SelectItem value="lecture_notes">Lecture Notes</SelectItem>
                      <SelectItem value="problem_solution">Problem Solutions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Search Suggestions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Searches</label>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent" onClick={() => setSearchQuery("quantum entanglement")}>
                      Quantum Entanglement
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent" onClick={() => setSearchQuery("Einstein field equations")}>
                      Einstein Field Equations
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent" onClick={() => setSearchQuery("Schrödinger equation")}>
                      Schrödinger Equation
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent" onClick={() => setSearchQuery("thermodynamic laws")}>
                      Thermodynamic Laws
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="results">Search Results</TabsTrigger>
                <TabsTrigger value="concepts">Concept Map</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="network">Knowledge Graph</TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-4">
                {isSearching ? (<Card>
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Searching knowledge base...</p>
                    </CardContent>
                  </Card>) : searchResults.length > 0 ? (<div className="space-y-4">
                    <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
                    {searchResults.map((result, index) => (<Card key={result.id || index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary">{result.domain}</Badge>
                          <Badge variant={getDifficultyColor(result.difficulty)} className={getDifficultyClassName(result.difficulty)}>{result.difficulty}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{result.contentType}</p>
                        <p className="mb-3">{result.content.substring(0, 300)}...</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleExplain(result.concepts[0] || result.title)}>
                            Explain Concept
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </div>
                      </Card>))}
                  </div>) : (<Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Search</h3>
                      <p className="text-gray-600 mb-4">
                        Enter keywords, concepts, or equations to explore our physics knowledge base
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery("quantum mechanics")}>
                          Quantum Mechanics
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery("relativity")}>
                          Relativity
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery("thermodynamics")}>
                          Thermodynamics
                        </Badge>
                        <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery("electromagnetism")}>
                          Electromagnetism
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>)}
              </TabsContent>

              <TabsContent value="concepts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5"/>
                      Concept Relationship Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Network className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <p className="text-gray-600">Interactive concept map will be displayed here</p>
                        <p className="text-sm text-gray-500 mt-2">Showing relationships between physics concepts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5"/>
                      Historical Development Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <p className="text-gray-600">Timeline visualization will be displayed here</p>
                        <p className="text-sm text-gray-500 mt-2">Showing historical development of physics concepts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="network" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5"/>
                      Knowledge Graph Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <p className="text-gray-600">Knowledge graph visualization will be displayed here</p>
                        <p className="text-sm text-gray-500 mt-2">Interactive network of connected knowledge</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>);
}
