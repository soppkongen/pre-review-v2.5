"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Activity,
  Database,
  FileText,
  Brain,
  Server,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"

interface SystemStats {
  knowledge: {
    totalEntries: number
    topicDistribution: Array<{ value: string; occurs: number }>
    difficultyDistribution: Array<{ value: string; occurs: number }>
  }
  documents: {
    totalDocuments: number
    recentUploads: number
    fileTypes: Record<string, number>
  }
  analysis: {
    totalAnalyses: number
    recentAnalyses: number
    agentDistribution: Record<string, number>
    averageScore: number
  }
  system: {
    uptime: number
    memoryUsage: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
    nodeVersion: string
    platform: string
  }
}

interface HealthStatus {
  status: string
  checks: {
    weaviate: boolean
    openai: boolean
    system: boolean
  }
  details: {
    uptime: number
    memoryUsage: {
      used: number
      total: number
      percentage: number
    }
    nodeVersion: string
    platform: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSystemData = async () => {
    try {
      setLoading(true)

      // Fetch system stats
      const statsResponse = await fetch("/api/system/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      // Fetch health status
      const healthResponse = await fetch("/api/system/health")
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        setHealth(healthData)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch system data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`
  }

  const getStatusBadge = (status: boolean, label: string) => (
    <Badge variant={status ? "default" : "destructive"} className="flex items-center gap-1">
      {status ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </Badge>
  )

  if (loading && !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading system dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Dashboard</h1>
          <p className="text-muted-foreground">Monitor your Pre-Review Physics platform performance and health</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button onClick={fetchSystemData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Real-time system health monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="font-medium">Overall Status</span>
                </div>
                <Badge
                  variant={health.status === "healthy" ? "default" : "destructive"}
                  className="flex items-center gap-1 w-fit"
                >
                  {health.status === "healthy" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {health.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="font-medium">Services</span>
                <div className="space-y-1">
                  {getStatusBadge(health.checks.weaviate, "Weaviate")}
                  {getStatusBadge(health.checks.openai, "OpenAI")}
                  {getStatusBadge(health.checks.system, "System")}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-medium">Memory Usage</span>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{health.details.memoryUsage.used}MB</span>
                    <span>{health.details.memoryUsage.total}MB</span>
                  </div>
                  <Progress value={health.details.memoryUsage.percentage} className="h-2" />
                  <span className="text-xs text-muted-foreground">{health.details.memoryUsage.percentage}% used</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-medium">System Info</span>
                <div className="text-sm space-y-1">
                  <div>Uptime: {formatUptime(health.details.uptime)}</div>
                  <div>Node: {health.details.nodeVersion}</div>
                  <div>Platform: {health.details.platform}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.knowledge.totalEntries || 0}</div>
                <p className="text-xs text-muted-foreground">Physics concepts and explanations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Research Papers</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.documents.totalDocuments || 0}</div>
                <p className="text-xs text-muted-foreground">+{stats?.documents.recentUploads || 0} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Analyses</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.analysis.totalAnalyses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Avg score: {stats?.analysis.averageScore.toFixed(1) || "0.0"}/10
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats ? formatUptime(stats.system.uptime) : "0h 0m"}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.system.platform} {stats?.system.nodeVersion}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Physics topics in the knowledge base</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.knowledge.topicDistribution.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{topic.value}</span>
                      <Badge variant="secondary">{topic.occurs}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Difficulty Levels</CardTitle>
                <CardDescription>Content difficulty distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.knowledge.difficultyDistribution.map((difficulty, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{difficulty.value}</span>
                      <Badge variant="outline">{difficulty.occurs}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Statistics</CardTitle>
                <CardDescription>Uploaded research papers overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Documents</span>
                    <Badge>{stats?.documents.totalDocuments || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recent Uploads (7 days)</span>
                    <Badge variant="secondary">{stats?.documents.recentUploads || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Types</CardTitle>
                <CardDescription>Distribution of uploaded file formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.documents.fileTypes &&
                    Object.entries(stats.documents.fileTypes).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm uppercase">{type}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Overview</CardTitle>
                <CardDescription>Multi-agent analysis statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Analyses</span>
                    <Badge>{stats?.analysis.totalAnalyses || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Recent Analyses (7 days)</span>
                    <Badge variant="secondary">{stats?.analysis.recentAnalyses || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Score</span>
                    <Badge variant="outline">{stats?.analysis.averageScore.toFixed(1) || "0.0"}/10</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agent Activity</CardTitle>
                <CardDescription>Analysis distribution by agent type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.analysis.agentDistribution &&
                    Object.entries(stats.analysis.agentDistribution).map(([agent, count]) => (
                      <div key={agent} className="flex items-center justify-between">
                        <span className="text-sm">{agent}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Resource usage and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="font-medium">Memory Usage</span>
                  <div className="text-2xl font-bold">
                    {stats ? formatBytes(stats.system.memoryUsage.heapUsed) : "0MB"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {stats ? formatBytes(stats.system.memoryUsage.heapTotal) : "0MB"} allocated
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-medium">System Uptime</span>
                  <div className="text-2xl font-bold">{stats ? formatUptime(stats.system.uptime) : "0h 0m"}</div>
                  <div className="text-sm text-muted-foreground">Since last restart</div>
                </div>

                <div className="space-y-2">
                  <span className="font-medium">Platform</span>
                  <div className="text-2xl font-bold">{stats?.system.platform || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">{stats?.system.nodeVersion || "Unknown version"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
