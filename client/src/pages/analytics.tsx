import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Activity,
  Clock,
  Target,
  Zap,
  Eye,
  ThumbsUp,
  Calendar,
  Filter
} from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [platform, setPlatform] = useState("all");

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics", timeRange, platform],
  });

  const { data: performanceMetrics } = useQuery({
    queryKey: ["/api/analytics/performance", timeRange],
  });

  const { data: userEngagement } = useQuery({
    queryKey: ["/api/analytics/engagement", timeRange],
  });

  const { data: knowledgeBaseMetrics } = useQuery({
    queryKey: ["/api/analytics/knowledge-base", timeRange],
  });

  // Mock data for demonstration
  const mockAnalytics = {
    overview: {
      totalMessages: 1248,
      messagesChange: 12.5,
      knowledgePairsExtracted: 156,
      extractionChange: 8.3,
      averageConfidence: 0.87,
      confidenceChange: 3.2,
      userEngagement: 342,
      engagementChange: 15.7
    },
    messagesByDay: [
      { date: "2025-01-18", slack: 45, telegram: 32, total: 77 },
      { date: "2025-01-19", slack: 52, telegram: 28, total: 80 },
      { date: "2025-01-20", slack: 38, telegram: 41, total: 79 },
      { date: "2025-01-21", slack: 61, telegram: 35, total: 96 },
      { date: "2025-01-22", slack: 47, telegram: 39, total: 86 },
      { date: "2025-01-23", slack: 53, telegram: 44, total: 97 },
      { date: "2025-01-24", slack: 49, telegram: 37, total: 86 }
    ],
    extractionsByConfidence: [
      { name: "High (80%+)", value: 67, color: "#22c55e" },
      { name: "Medium (60-80%)", value: 52, color: "#f59e0b" },
      { name: "Low (<60%)", value: 37, color: "#ef4444" }
    ],
    platformActivity: [
      { platform: "Slack", messages: 745, extractions: 89, avgConfidence: 0.85 },
      { platform: "Telegram", messages: 503, extractions: 67, avgConfidence: 0.89 }
    ],
    topChannels: [
      { name: "#engineering", messages: 234, extractions: 28, platform: "slack" },
      { name: "#frontend", messages: 189, extractions: 22, platform: "slack" },
      { name: "@devhelp", messages: 178, extractions: 19, platform: "telegram" },
      { name: "#backend", messages: 156, extractions: 18, platform: "slack" },
      { name: "@architecture", messages: 145, extractions: 15, platform: "telegram" }
    ],
    hourlyActivity: [
      { hour: "00:00", messages: 12, extractions: 2 },
      { hour: "02:00", messages: 8, extractions: 1 },
      { hour: "04:00", messages: 5, extractions: 0 },
      { hour: "06:00", messages: 15, extractions: 3 },
      { hour: "08:00", messages: 45, extractions: 8 },
      { hour: "10:00", messages: 67, extractions: 12 },
      { hour: "12:00", messages: 58, extractions: 9 },
      { hour: "14:00", messages: 72, extractions: 14 },
      { hour: "16:00", messages: 83, extractions: 16 },
      { hour: "18:00", messages: 61, extractions: 11 },
      { hour: "20:00", messages: 42, extractions: 7 },
      { hour: "22:00", messages: 28, extractions: 4 }
    ]
  };

  const mockPerformance = {
    responseTime: {
      average: 245,
      change: -12.3
    },
    accuracy: {
      rate: 0.923,
      change: 2.1
    },
    uptime: {
      percentage: 99.87,
      change: 0.02
    },
    apiCalls: {
      total: 2847,
      change: 18.5
    }
  };

  const mockEngagement = {
    votingActivity: [
      { date: "2025-01-18", upvotes: 23, downvotes: 4 },
      { date: "2025-01-19", upvotes: 31, downvotes: 6 },
      { date: "2025-01-20", upvotes: 28, downvotes: 3 },
      { date: "2025-01-21", upvotes: 35, downvotes: 7 },
      { date: "2025-01-22", upvotes: 42, downvotes: 5 },
      { date: "2025-01-23", upvotes: 38, downvotes: 8 },
      { date: "2025-01-24", upvotes: 41, downvotes: 6 }
    ],
    searchQueries: [
      { query: "react performance", count: 23 },
      { query: "database optimization", count: 18 },
      { query: "async javascript", count: 15 },
      { query: "docker deployment", count: 12 },
      { query: "api security", count: 10 }
    ],
    userRetention: {
      daily: 78,
      weekly: 65,
      monthly: 52
    }
  };

  const data = analytics || mockAnalytics;
  const perfData = performanceMetrics || mockPerformance;
  const engagementData = userEngagement || mockEngagement;

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Bot performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="slack">Slack Only</SelectItem>
                <SelectItem value="telegram">Telegram Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold">{data.overview.totalMessages.toLocaleString()}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(data.overview.messagesChange)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Knowledge Pairs</p>
                      <p className="text-2xl font-bold">{data.overview.knowledgePairsExtracted}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(data.overview.extractionChange)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                      <p className="text-2xl font-bold">{(data.overview.averageConfidence * 100).toFixed(1)}%</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(data.overview.confidenceChange)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">User Engagement</p>
                      <p className="text-2xl font-bold">{data.overview.userEngagement}</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(data.overview.engagementChange)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Message Volume by Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.messagesByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Extraction Quality Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.extractionsByConfidence}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.extractionsByConfidence.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Platform Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Activity Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.platformActivity.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant={platform.platform === "Slack" ? "default" : "secondary"}>
                          {platform.platform}
                        </Badge>
                        <div>
                          <p className="font-medium">{platform.messages} messages</p>
                          <p className="text-sm text-gray-600">{platform.extractions} extractions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{(platform.avgConfidence * 100).toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">avg confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Time</p>
                      <p className="text-2xl font-bold">{perfData.responseTime.average}ms</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(perfData.responseTime.change)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
                      <p className="text-2xl font-bold">{(perfData.accuracy.rate * 100).toFixed(1)}%</p>
                    </div>
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(perfData.accuracy.change)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Uptime</p>
                      <p className="text-2xl font-bold">{perfData.uptime.percentage}%</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(perfData.uptime.change)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Calls</p>
                      <p className="text-2xl font-bold">{perfData.apiCalls.total.toLocaleString()}</p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mt-2">
                    {formatChange(perfData.apiCalls.change)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#3b82f6" name="Messages" />
                    <Bar dataKey="extractions" fill="#10b981" name="Extractions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voting Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData.votingActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="upvotes" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="downvotes" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Retention</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Active Users</span>
                    <span className="text-lg font-bold">{engagementData.userRetention.daily}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weekly Retention</span>
                    <span className="text-lg font-bold">{engagementData.userRetention.weekly}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Retention</span>
                    <span className="text-lg font-bold">{engagementData.userRetention.monthly}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Search Queries */}
            <Card>
              <CardHeader>
                <CardTitle>Most Searched Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {engagementData.searchQueries.map((query, index) => (
                    <div key={query.query} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium">{query.query}</span>
                      </div>
                      <Badge variant="secondary">{query.count} searches</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Base Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            {/* Top Channels */}
            <Card>
              <CardHeader>
                <CardTitle>Most Active Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topChannels.map((channel, index) => (
                    <div key={channel.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{channel.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={channel.platform === "slack" ? "default" : "secondary"} className="text-xs">
                              {channel.platform}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{channel.messages} messages</p>
                        <p className="text-sm text-gray-600">{channel.extractions} extractions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}