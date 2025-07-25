import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface KnowledgePair {
  id: string;
  problem: string;
  solution: string;
  confidenceScore: number;
  validated: boolean;
}

interface KnowledgePairModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair?: KnowledgePair | null;
}

export default function KnowledgePairModal({ isOpen, onClose, pair }: KnowledgePairModalProps) {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [validated, setValidated] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (pair) {
      setProblem(pair.problem);
      setSolution(pair.solution);
      setConfidenceScore(pair.confidenceScore * 100);
      setValidated(pair.validated);
    } else {
      setProblem("");
      setSolution("");
      setConfidenceScore(0);
      setValidated(false);
    }
  }, [pair, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!pair?.id) throw new Error("No pair ID");
      return apiRequest("PATCH", `/api/knowledge-pairs/${pair.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-pairs"] });
      toast({
        title: "Success",
        description: "Knowledge pair updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update knowledge pair",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      problem,
      solution,
      confidenceScore: confidenceScore / 100,
      validated,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Knowledge Pair</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="problem" className="text-sm font-medium text-gray-700">
              Problem
            </Label>
            <Textarea
              id="problem"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe the problem..."
              rows={3}
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="solution" className="text-sm font-medium text-gray-700">
              Solution
            </Label>
            <Textarea
              id="solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Describe the solution..."
              rows={3}
              className="mt-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="confidence" className="text-sm font-medium text-gray-700">
                Confidence Score
              </Label>
              <Input
                id="confidence"
                type="number"
                min="0"
                max="100"
                value={confidenceScore}
                onChange={(e) => setConfidenceScore(Number(e.target.value))}
                placeholder="0-100"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select value={validated ? "validated" : "pending"} onValueChange={(value) => setValidated(value === "validated")}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
