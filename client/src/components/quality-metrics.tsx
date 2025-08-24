import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle,
  Target,
  TrendingUp,
  Brain,
  Zap,
  RefreshCw,
  BarChart3,
  Eye,
  Flag
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QualityMetrics {
  confidenceScore: number;
  qualityScore: number;
  clarity: number;
  completeness: number;
  accuracy: number;
  relevance: number;
  actionability: number;
  technicalDepth: number;
  reasoning: string;
  autoValidated: boolean;
  flags: string[];
  suggestedImprovements: string[];
}

interface QualityMetricsProps {
  pairId: string;
  onMetricsUpdate?: (metrics: QualityMetrics) => void;
}

export default function QualityMetrics({ pairId, onMetricsUpdate }: QualityMetricsProps) {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, [pairId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", `/api/knowledge-pairs/${pairId}/quality-metrics`);
      setMetrics(response);
      onMetricsUpdate?.(response);
    } catch (error) {
      console.error('Failed to fetch quality metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load quality metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recalculateMetrics = async () => {
    try {
      setCalculating(true);
      const response = await apiRequest("POST", `/api/knowledge-pairs/${pairId}/calculate-quality`);
      setMetrics(response);
      onMetricsUpdate?.(response);
      toast({
        title: "Success",
        description: "Quality metrics updated successfully",
      });
    } catch (error) {
      console.error('Failed to calculate quality metrics:', error);
      toast({
        title: "Error",
        description: "Failed to calculate quality metrics",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-gray-500">Loading quality metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No quality metrics available</p>
            <Button onClick={recalculateMetrics} disabled={calculating}>
              <Brain className="h-4 w-4 mr-2" />
              {calculating ? "Calculating..." : "Calculate Quality Metrics"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number): string => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quality Metrics
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={recalculateMetrics}
            disabled={calculating}
            data-testid="recalculate-metrics"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? "Calculating..." : "Recalculate"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.qualityScore)}`}>
              {(metrics.qualityScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Quality Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.confidenceScore)}`}>
              {(metrics.confidenceScore * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
        </div>

        {/* Auto-validation Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
          {metrics.autoValidated ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Badge variant="default" className="bg-green-600">Auto-Validated</Badge>
              <span className="text-sm text-gray-600">This pair meets auto-validation criteria</span>
            </>
          ) : (
            <>
              <Eye className="h-5 w-5 text-orange-500" />
              <Badge variant="secondary">Requires Review</Badge>
              <span className="text-sm text-gray-600">Manual review recommended</span>
            </>
          )}
        </div>

        <Separator />

        {/* Detailed Metrics */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Detailed Analysis
          </h4>
          
          <div className="space-y-3">
            {[
              { label: "Clarity", score: metrics.clarity, icon: Eye },
              { label: "Completeness", score: metrics.completeness, icon: CheckCircle },
              { label: "Accuracy", score: metrics.accuracy, icon: Target },
              { label: "Relevance", score: metrics.relevance, icon: TrendingUp },
              { label: "Actionability", score: metrics.actionability, icon: Zap },
              { label: "Technical Depth", score: metrics.technicalDepth, icon: Brain },
            ].map(({ label, score, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{label}</span>
                    <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getProgressColor(score)}`}
                      style={{ width: `${score * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags and Issues */}
        {metrics.flags && metrics.flags.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <Flag className="h-4 w-4 text-red-500" />
                Issues Found
              </h4>
              <div className="space-y-2">
                {metrics.flags.map((flag, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border-l-4 border-red-400">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Suggested Improvements */}
        {metrics.suggestedImprovements && metrics.suggestedImprovements.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Suggested Improvements
              </h4>
              <div className="space-y-2">
                {metrics.suggestedImprovements.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span className="text-sm text-blue-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* AI Reasoning */}
        {metrics.reasoning && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Analysis Details
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded">
                {metrics.reasoning}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}