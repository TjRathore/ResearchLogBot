import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Flag, Trash2, Check, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import KnowledgePairModal from "@/components/knowledge-pair-modal";

export default function KnowledgePairs() {
  const [selectedPair, setSelectedPair] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledgePairs, isLoading } = useQuery({
    queryKey: ["/api/knowledge-pairs"],
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete knowledge pair",
        variant: "destructive",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate knowledge pair",
        variant: "destructive",
      });
    },
  });

  const flagMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/knowledge-pairs/${id}`, { validated: false, confidenceScore: 0.3 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-pairs"] });
      toast({
        title: "Success",
        description: "Knowledge pair flagged for review",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to flag knowledge pair",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (pair: any) => {
    setSelectedPair(pair);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this knowledge pair?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleValidate = (id: string) => {
    validateMutation.mutate(id);
  };

  const handleFlag = (id: string) => {
    flagMutation.mutate(id);
  };

  const filteredPairs = (knowledgePairs as any[] || []).filter((pair: any) => {
    const matchesSearch = 
      pair.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.solution.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "validated" && pair.validated) ||
      (statusFilter === "pending" && !pair.validated && pair.confidenceScore >= 0.7) ||
      (statusFilter === "flagged" && pair.confidenceScore < 0.7);
    
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Knowledge Pairs Management</h2>
            <p className="text-gray-600">Review and manage extracted problem-solution pairs</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Knowledge Pairs</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Input
                    placeholder="Search knowledge pairs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredPairs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {(knowledgePairs as any[] || []).length === 0 
                  ? "No knowledge pairs found. Start sending messages to your bots to generate knowledge pairs."
                  : "No knowledge pairs match your current filters."
                }
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Problem & Solution</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPairs.map((pair: any) => (
                    <TableRow key={pair.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="max-w-sm">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Problem: {pair.problem}
                          </p>
                          <p className="text-sm text-gray-600">
                            Solution: {pair.solution}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            pair.sourceMessage?.platform === 'slack' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {pair.sourceMessage?.platform || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(pair.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                (pair.confidenceScore || 0) >= 0.8 ? 'bg-green-500' :
                                (pair.confidenceScore || 0) >= 0.6 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.round((pair.confidenceScore || 0) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {Math.round((pair.confidenceScore || 0) * 100)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          pair.validated ? "default" :
                          (pair.confidenceScore || 0) >= 0.7 ? "secondary" : "destructive"
                        }>
                          {pair.validated ? "Validated" :
                           (pair.confidenceScore || 0) >= 0.7 ? "Pending Review" : "Flagged"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!pair.validated && (pair.confidenceScore || 0) >= 0.7 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleValidate(pair.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Validate"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(pair)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFlag(pair.id)}
                            className="text-amber-600 hover:text-amber-800"
                            title="Flag"
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(pair.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          {filteredPairs.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  Showing {filteredPairs.length} of {(knowledgePairs as any[] || []).length} results
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-blue-500 text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <KnowledgePairModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPair(null);
        }}
        pair={selectedPair}
      />
    </div>
  );
}
