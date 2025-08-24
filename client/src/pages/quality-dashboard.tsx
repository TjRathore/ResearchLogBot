import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap,
  Target,
  Award,
  Activity
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QualityStats {
  totalPairs: number;
  averageQuality: number;
  averageConfidence: number;
  autoValidatedCount: number;
  flaggedCount: number;
  recentlyUpdated: number;
  topQualityPairs: Array<{
    id: string;
    problem: string;
    qualityScore: number;
    confidenceScore: number;
  }>;
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export default function QualityDashboard() {
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchSize, setBatchSize] = useState("10");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: knowledgePairs, isLoading: pairsLoading } = useQuery({
    queryKey: ["/api/knowledge-pairs"],
  });

  const batchCalculateMutation = useMutation({
    mutationFn: async (limit: number) => {
      return apiRequest("POST", "/api/quality/batch-calculate", { limit });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge-pairs"] });
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${data.processed} knowledge pairs`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process batch quality calculation",
        variant: "destructive",
      });
    },
  });

  const handleBatchCalculate = async () => {
    setBatchProcessing(true);
    try {
      await batchCalculateMutation.mutateAsync(parseInt(batchSize));
    } finally {
      setBatchProcessing(false);
    }
  };

  // Calculate quality statistics from knowledge pairs
  const calculateQualityStats = (): QualityStats => {
    if (!knowledgePairs || knowledgePairs.length === 0) {
      return {
        totalPairs: 0,
        averageQuality: 0,
        averageConfidence: 0,
        autoValidatedCount: 0,
        flaggedCount: 0,
        recentlyUpdated: 0,
        topQualityPairs: [],
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
      };
    }

    const pairs = knowledgePairs as any[];
    const totalPairs = pairs.length;

    // Calculate averages
    const avgConfidence = pairs.reduce((sum, pair) => sum + (pair.confidence_score || 0.5), 0) / totalPairs;
    
    // Estimate quality score from confidence and other factors
    const avgQuality = pairs.reduce((sum, pair) => {
      const score = Math.min(
        (pair.confidence_score || 0.5) * 
        (1 + (pair.upvotes || 0) * 0.1 - (pair.downvotes || 0) * 0.1)
      , 1);
      return sum + score;
    }, 0) / totalPairs;

    const autoValidatedCount = pairs.filter(pair => pair.validated).length;
    const flaggedCount = pairs.filter(pair => pair.confidence_score < 0.7).length;
    
    // Recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentlyUpdated = pairs.filter(pair => 
      new Date(pair.updated_at || pair.created_at) > weekAgo
    ).length;

    // Top quality pairs
    const topQualityPairs = [...pairs]
      .map(pair => ({
        id: pair.id,
        problem: pair.problem,
        qualityScore: Math.min((pair.confidence_score || 0.5) * (1 + (pair.upvotes || 0) * 0.1), 1),
        confidenceScore: pair.confidence_score || 0.5
      }))
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 5);

    // Quality distribution
    const distribution = pairs.reduce(
      (acc, pair) => {
        const score = pair.confidence_score || 0.5;
        if (score >= 0.9) acc.excellent++;
        else if (score >= 0.75) acc.good++;
        else if (score >= 0.6) acc.fair++;
        else acc.poor++;
        return acc;
      },
      { excellent: 0, good: 0, fair: 0, poor: 0 }
    );

    return {
      totalPairs,
      averageQuality: avgQuality,
      averageConfidence: avgConfidence,
      autoValidatedCount,
      flaggedCount,
      recentlyUpdated,
      topQualityPairs,
      qualityDistribution: distribution
    };
  };

  const stats = calculateQualityStats();

  if (pairsLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-500">Loading quality dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quality Dashboard</h2>
            <p className="text-gray-600">Monitor and improve knowledge base quality</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Batch size"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-24"
                min="1"
                max="100"
                data-testid="batch-size-input"
              />
              <Button
                onClick={handleBatchCalculate}
                disabled={batchProcessing}
                data-testid="batch-calculate"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${batchProcessing ? 'animate-spin' : ''}`} />
                {batchProcessing ? "Processing..." : "Batch Recalculate"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pairs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPairs}</div>
              <p className="text-xs text-muted-foreground">
                Knowledge pairs in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.averageQuality * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall quality score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Validated</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.autoValidatedCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPairs > 0 ? ((stats.autoValidatedCount / stats.totalPairs) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.flaggedCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Flagged for review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quality Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">{stats.qualityDistribution.excellent}</div>
                  <div className="text-sm text-gray-600">Excellent (90%+)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{stats.qualityDistribution.good}</div>
                  <div className="text-sm text-gray-600">Good (75-89%)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-600">{stats.qualityDistribution.fair}</div>
                  <div className="text-sm text-gray-600">Fair (60-74%)</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{stats.qualityDistribution.poor}</div>
                  <div className="text-sm text-gray-600">Poor (&lt;60%)</div>
                </div>
              </div>

              {stats.totalPairs > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Excellent</span>
                    <span>{((stats.qualityDistribution.excellent / stats.totalPairs) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.qualityDistribution.excellent / stats.totalPairs) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Good</span>
                    <span>{((stats.qualityDistribution.good / stats.totalPairs) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.qualityDistribution.good / stats.totalPairs) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Fair</span>
                    <span>{((stats.qualityDistribution.fair / stats.totalPairs) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.qualityDistribution.fair / stats.totalPairs) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Poor</span>
                    <span>{((stats.qualityDistribution.poor / stats.totalPairs) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.qualityDistribution.poor / stats.totalPairs) * 100} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Quality Pairs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Quality Knowledge Pairs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topQualityPairs.map((pair, index) => (
                <div key={pair.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{pair.problem}</p>
                      <p className="text-sm text-gray-500">ID: {pair.id.substring(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="mb-1">
                      {(pair.qualityScore * 100).toFixed(0)}%
                    </Badge>
                    <p className="text-xs text-gray-500">
                      Confidence: {(pair.confidenceScore * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.recentlyUpdated}</div>
                <p className="text-sm text-gray-600">pairs updated in last 7 days</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  {(stats.averageConfidence * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">avg confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}