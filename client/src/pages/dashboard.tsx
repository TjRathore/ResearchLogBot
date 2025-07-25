import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Brain, MessageSquare, Target, Hash, FolderSync, Bell, Search, HelpCircle, Flag, ArrowUp } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [botResponse, setBotResponse] = useState("");

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: knowledgePairs, isLoading: pairsLoading } = useQuery({
    queryKey: ["/api/knowledge-pairs"],
  });

  const handleTestSearch = async () => {
    if (!searchQuery) return;
    
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 3 }),
      });
      
      const results = await response.json();
      setSearchResults(results);
      
      // Generate bot response preview
      if (results.length > 0) {
        const mockResponse = `Based on our knowledge base, here are several approaches to handle ${searchQuery}:

1. **${results[0]?.problem}:** ${results[0]?.solution}
${results[1] ? `2. **${results[1]?.problem}:** ${results[1]?.solution}` : ""}
${results[2] ? `3. **${results[2]?.problem}:** ${results[2]?.solution}` : ""}

Sources: ${results.length} knowledge pairs • Confidence: ${Math.round((results[0]?.similarity || 0) * 100)}%`;
        setBotResponse(mockResponse);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const recentPairs = (knowledgePairs as any[] || []).slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600">Monitor your AI research bot performance and knowledge base</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <FolderSync className="mr-2 h-4 w-4" />
              FolderSync Now
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Knowledge Pairs</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? "..." : (stats as any)?.knowledgePairs || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Brain className="text-2xl text-blue-500" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">
                <ArrowUp className="inline h-3 w-3 mr-1" />
                +{(stats as any)?.validated || 0} validated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Processed</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? "..." : (stats as any)?.messagesProcessed || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <MessageSquare className="text-2xl text-green-500" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">
                <ArrowUp className="inline h-3 w-3 mr-1" />
                Real-time processing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Extraction Accuracy</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? "..." : `${(stats as any)?.accuracy || 0}%`}
                  </p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <Target className="text-2xl text-amber-500" />
                </div>
              </div>
              <p className="text-sm text-amber-600 mt-2">
                <ArrowUp className="inline h-3 w-3 mr-1" />
                Improving
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Channels</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? "..." : (stats as any)?.activeChannels || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Hash className="text-2xl text-purple-500" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Slack & Telegram</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Knowledge Pairs */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Knowledge Pairs</h3>
                <Button variant="link" size="sm">View All</Button>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              {pairsLoading ? (
                <div>Loading...</div>
              ) : recentPairs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No knowledge pairs found. Messages will be processed automatically when received.
                </div>
              ) : (
                recentPairs.map((pair: any, index: number) => (
                  <div key={pair.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={pair.validated ? "default" : "secondary"}>
                        {pair.validated ? "Validated" : "Pending Review"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(pair.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Problem: {pair.problem}
                    </p>
                    <p className="text-sm text-gray-600">
                      Solution: {pair.solution}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>Confidence: {Math.round((pair.confidenceScore || 0) * 100)}%</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Bot Performance */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Bot Performance</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Response Time</span>
                  <span className="text-sm text-gray-900 font-semibold">1.2s avg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Query Success Rate</span>
                  <span className="text-sm text-gray-900 font-semibold">94.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "94%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Extraction Quality</span>
                  <span className="text-sm text-gray-900 font-semibold">{(stats as any)?.accuracy || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats as any)?.accuracy || 0}%` }}></div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Bot Commands</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">/ask How to handle API rate limits?</span>
                    <span className="text-green-600">✓ Answered</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">/search database optimization</span>
                    <span className="text-green-600">✓ 5 results</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">/ask React state management</span>
                    <span className="text-green-600">✓ Answered</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Testing Interface */}
        <Card className="mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Search & Query Testing</h3>
            <p className="text-sm text-gray-600 mt-1">Test bot queries using semantic search and fallback mechanisms</p>
          </div>
          <CardContent className="p-6">
            <div className="flex space-x-4 mb-6">
              <Input
                placeholder="Type your query here (e.g., 'How to handle API timeouts?')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleTestSearch} className="bg-blue-500 hover:bg-blue-600">
                <Search className="mr-2 h-4 w-4" />
                Test Search
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Search Results */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Search Results</h4>
                <div className="space-y-3">
                  {searchResults.length === 0 ? (
                    <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
                      No search performed yet
                    </div>
                  ) : (
                    searchResults.map((pair: any, index: number) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-blue-600 font-medium">
                            Similarity: {(pair.similarity || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(pair.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Problem: {pair.problem}
                        </p>
                        <p className="text-sm text-gray-600">
                          Solution: {pair.solution}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Generated Response */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Bot Response Preview</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  {botResponse ? (
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-500 text-white p-2 rounded-lg">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                            {botResponse}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Perform a search to see the bot response preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot Commands Reference */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bot Commands Reference</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-500 text-white p-3 rounded-lg inline-flex mb-3">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">/ask</h4>
                <p className="text-sm text-gray-600">Ask a question and get AI-powered answers from the knowledge base</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  /ask How to optimize database queries?
                </code>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="bg-green-500 text-white p-3 rounded-lg inline-flex mb-3">
                  <Search className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">/search</h4>
                <p className="text-sm text-gray-600">Search through knowledge pairs using semantic similarity</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  /search memory leaks
                </code>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="bg-purple-500 text-white p-3 rounded-lg inline-flex mb-3">
                  <Flag className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">/flag</h4>
                <p className="text-sm text-gray-600">Flag incorrect or low-quality knowledge pairs for review</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                  /flag [message_id]
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
