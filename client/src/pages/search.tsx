import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [botResponse, setBotResponse] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 10 }),
      });
      
      const searchResults = await response.json();
      setResults(searchResults);
      
      // Generate sample bot response
      if (searchResults.length > 0) {
        const mockResponse = `Based on our knowledge base, here are the most relevant solutions for "${query}":

${searchResults.slice(0, 3).map((result: any, index: number) => 
  `**${index + 1}. ${result.problem}**
${result.solution}
*Confidence: ${Math.round((result.similarity || 0) * 100)}%*`
).join('\n\n')}

Sources: ${searchResults.length} knowledge pairs found`;
        setBotResponse(mockResponse);
      } else {
        setBotResponse(`I couldn't find relevant information for "${query}". Try rephrasing your question or ask about a different topic.`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setBotResponse("Sorry, I encountered an error while searching. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Search & Query Testing</h2>
            <p className="text-gray-600">Test semantic search and bot response generation</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Search Interface */}
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4 mb-6">
              <Input
                placeholder="Ask a question or search for knowledge (e.g., 'How to handle API timeouts?')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-lg"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !query.trim()}
                className="bg-blue-500 hover:bg-blue-600 px-8"
              >
                <SearchIcon className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Results */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
              <p className="text-sm text-gray-600">Semantic similarity matches from knowledge base</p>
            </div>
            <CardContent className="p-6">
              {results.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  {query ? "No results found. Try a different search term." : "Enter a search query to see results"}
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="text-xs">
                          Similarity: {Math.round((result.similarity || 0) * 100)}%
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Problem</span>
                          <p className="text-sm font-medium text-gray-900">{result.problem}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Solution</span>
                          <p className="text-sm text-gray-700">{result.solution}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Confidence: {Math.round((result.confidenceScore || 0) * 100)}%</span>
                          <Badge variant={result.validated ? "default" : "outline"} className="text-xs">
                            {result.validated ? "Validated" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bot Response Preview */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Bot Response Preview</h3>
              <p className="text-sm text-gray-600">How the bot would respond to this query</p>
            </div>
            <CardContent className="p-6">
              {botResponse ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 text-white p-2 rounded-lg flex-shrink-0">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
                            {botResponse}
                          </pre>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Response generated • {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  Perform a search to see how the bot would respond
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search Tips */}
        <Card>
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Search Tips</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Semantic Search</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Search by meaning, not just keywords</li>
                  <li>• Ask natural questions like "How to fix memory leaks?"</li>
                  <li>• Related concepts will be found automatically</li>
                  <li>• Similarity scores show relevance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Best Practices</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Be specific about the problem context</li>
                  <li>• Include technology names when relevant</li>
                  <li>• Try different phrasings if no results</li>
                  <li>• Check confidence scores for reliability</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
