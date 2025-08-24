import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  MessageSquare, 
  Edit, 
  Flag, 
  Trash2, 
  Check, 
  Search,
  ExternalLink,
  Tag,
  Calendar,
  TrendingUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import KnowledgePairModal from "@/components/knowledge-pair-modal";

export default function KnowledgePairs() {
  const [selectedPair, setSelectedPair] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("votes");
  const [expandedPair, setExpandedPair] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledgePairs, isLoading } = useQuery({
    queryKey: ["/api/knowledge-pairs"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, voteType }: { id: string; voteType: 'upvote' | 'downvote' }) => {
      return apiRequest("POST", `/api/knowledge-pairs/${id}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-pairs"] });
      toast({
        title: "Success",
        description: "Vote recorded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    },
  });

  const viewMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/knowledge-pairs/${id}/view`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/knowledge-pairs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-pairs"] });
      toast({
        title: "Success",
        description: "Knowledge pair deleted successfully",
      });
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/knowledge-pairs/${id}`, { validated: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-pairs"] });
      toast({
        title: "Success",
        description: "Knowledge pair validated successfully",
      });
    },
  });

  const filteredAndSortedPairs = (knowledgePairs as any[] || []).filter((pair: any) => {
    const matchesSearch = !searchTerm ||
      pair.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.solution.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "validated" && pair.validated) ||
      (statusFilter === "pending" && !pair.validated && pair.confidence_score >= 0.7) ||
      (statusFilter === "flagged" && pair.confidence_score < 0.7);
    
    return matchesSearch && matchesStatus;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "votes":
        return ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0));
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "views":
        return (b.views || 0) - (a.views || 0);
      default:
        return 0;
    }
  }) || [];

  const handleVote = (id: string, voteType: 'upvote' | 'downvote') => {
    voteMutation.mutate({ id, voteType });
  };

  const handleViewPair = (id: string) => {
    if (expandedPair !== id) {
      viewMutation.mutate(id);
      setExpandedPair(id);
    } else {
      setExpandedPair(null);
    }
  };

  const handleEdit = (pair: any) => {
    setSelectedPair(pair);
    setIsModalOpen(true);
  };

  const handleValidate = (id: string) => {
    validateMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this knowledge pair?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Knowledge Base</h2>
            <p className="text-gray-600">Community-driven problem-solution repository</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            {filteredAndSortedPairs.length} questions
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Sort Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search problems, solutions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-knowledge-pairs"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="votes">Most Voted</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Pairs List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading knowledge base...</p>
          </div>
        ) : filteredAndSortedPairs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No knowledge pairs found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedPairs.map((pair: any) => (
              <Card key={pair.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Voting Section */}
                    <div className="flex flex-col items-center gap-2 min-w-[60px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(pair.id, 'upvote')}
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                        disabled={voteMutation.isPending}
                        data-testid={`upvote-${pair.id}`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="font-bold text-lg text-gray-700">
                        {(pair.upvotes || 0) - (pair.downvotes || 0)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(pair.id, 'downvote')}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        disabled={voteMutation.isPending}
                        data-testid={`downvote-${pair.id}`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {pair.views || 0}
                        </div>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h3 
                          className="text-lg font-semibold text-blue-600 cursor-pointer hover:text-blue-800 line-clamp-2"
                          onClick={() => handleViewPair(pair.id)}
                          data-testid={`problem-${pair.id}`}
                        >
                          {pair.problem}
                        </h3>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(pair)}
                            data-testid={`edit-${pair.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!pair.validated && pair.confidence_score >= 0.7 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleValidate(pair.id)}
                              disabled={validateMutation.isPending}
                              data-testid={`validate-${pair.id}`}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(pair.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`delete-${pair.id}`}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Tags */}
                      {pair.tags && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {pair.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Meta Information */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(pair.created_at).toLocaleDateString()}
                        </div>
                        <Badge
                          variant={pair.validated ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {pair.validated ? "✓ Validated" : `${Math.round(pair.confidence_score * 100)}% confidence`}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {pair.source_platform}
                        </Badge>
                      </div>

                      {/* Expanded Solution */}
                      {expandedPair === pair.id && (
                        <div className="mt-4">
                          <Separator className="mb-4" />
                          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                              <Check className="h-4 w-4" />
                              Accepted Solution:
                            </h4>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{pair.solution}</p>
                          </div>
                          
                          {/* Related Questions */}
                          <RelatedQuestions pairId={pair.id} />
                        </div>
                      )}

                      {/* Preview when collapsed */}
                      {expandedPair !== pair.id && (
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {pair.solution.substring(0, 150)}...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <KnowledgePairModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        knowledgePair={selectedPair}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedPair(null);
          queryClient.invalidateQueries({ queryKey: ["/api/knowledge-pairs"] });
        }}
      />
    </div>
  );
}

// Related Questions Component
function RelatedQuestions({ pairId }: { pairId: string }) {
  const [relatedPairs, setRelatedPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const response = await apiRequest("GET", `/api/knowledge-pairs/${pairId}/related`);
        setRelatedPairs(response || []);
      } catch (error) {
        console.error('Failed to fetch related pairs:', error);
        setRelatedPairs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [pairId]);

  if (loading) return (
    <div className="mt-4 text-sm text-gray-500">
      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
      Loading related questions...
    </div>
  );

  if (relatedPairs.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <ExternalLink className="h-4 w-4" />
        Related Questions:
      </h5>
      <div className="space-y-3">
        {relatedPairs.map((related) => (
          <div key={related.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <span className="text-sm font-medium text-gray-600">
                {(related.upvotes || 0) - (related.downvotes || 0)}
              </span>
              <span className="text-xs text-gray-400">votes</span>
            </div>
            <div className="flex-1">
              <h6 className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer line-clamp-2">
                {related.problem}
              </h6>
              <div className="flex items-center gap-2 mt-1">
                {related.tags?.slice(0, 2).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                <span className="text-xs text-gray-500">{related.views || 0} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}