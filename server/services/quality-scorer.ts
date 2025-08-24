// Import OpenAI functions - using direct OpenAI API calls for quality scoring
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key"
});

const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;

export interface QualityMetrics {
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

export interface ScoringContext {
  problem: string;
  solution: string;
  sourceContext?: string;
  platform?: string;
  channelName?: string;
  messageLength?: number;
  hasCodeExamples?: boolean;
  hasLinks?: boolean;
  upvotes?: number;
  downvotes?: number;
  views?: number;
}

export class QualityScorer {
  private readonly CONFIDENCE_THRESHOLDS = {
    HIGH: 0.85,
    MEDIUM: 0.7,
    LOW: 0.5
  };

  private readonly QUALITY_WEIGHTS = {
    clarity: 0.2,
    completeness: 0.25,
    accuracy: 0.25,
    relevance: 0.15,
    actionability: 0.15
  };

  async scoreKnowledgePair(context: ScoringContext): Promise<QualityMetrics> {
    try {
      // Run multiple scoring approaches in parallel
      const [
        aiScoring,
        heuristicScoring,
        communityScoring
      ] = await Promise.all([
        this.getAIQualityScoring(context),
        this.getHeuristicScoring(context),
        this.getCommunityScoring(context)
      ]);

      // Combine scores with weighted average
      const combinedMetrics = this.combineScores(aiScoring, heuristicScoring, communityScoring);
      
      // Determine auto-validation
      combinedMetrics.autoValidated = this.shouldAutoValidate(combinedMetrics);
      
      return combinedMetrics;
    } catch (error) {
      console.error('Error in quality scoring:', error);
      return this.getFallbackScoring(context);
    }
  }

  private async getAIQualityScoring(context: ScoringContext): Promise<Partial<QualityMetrics>> {
    if (!isOpenAIConfigured) {
      return {};
    }

    const prompt = `Analyze this problem-solution pair for quality and provide detailed scoring:

Problem: "${context.problem}"
Solution: "${context.solution}"
Source: ${context.platform} - ${context.channelName || 'unknown'}

Rate each aspect from 0.0 to 1.0 and provide reasoning:

1. Clarity: Is the problem clearly stated and solution easy to understand?
2. Completeness: Does the solution fully address the problem?
3. Accuracy: Is the solution technically correct and current?
4. Relevance: How relevant is this solution to the stated problem?
5. Actionability: Can someone follow this solution to solve their problem?
6. Technical Depth: How detailed and thorough is the technical content?

Also identify any flags or issues:
- Outdated information
- Security concerns
- Missing context
- Incomplete solution
- Unclear instructions

Respond with JSON in this format:
{
  "clarity": 0.8,
  "completeness": 0.9,
  "accuracy": 0.85,
  "relevance": 0.95,
  "actionability": 0.8,
  "technicalDepth": 0.7,
  "reasoning": "Detailed explanation of scoring",
  "flags": ["any issues found"],
  "suggestedImprovements": ["specific suggestions"]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a quality assessment expert. Analyze the given problem-solution pair and respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const aiMetrics = JSON.parse(response.choices[0].message.content || '{}');


      return {
        ...aiMetrics,
        qualityScore: this.calculateQualityScore(aiMetrics)
      };
    } catch (error) {
      console.error('AI scoring failed:', error);
      return {};
    }
  }

  private getHeuristicScoring(context: ScoringContext): Partial<QualityMetrics> {
    const metrics: any = {};
    const flags: string[] = [];

    // Problem clarity scoring
    const problemLength = context.problem.length;
    const hasQuestionWords = /\b(how|what|why|when|where|which)\b/i.test(context.problem);
    const isSpecific = /\b(error|bug|issue|problem|failed|not working)\b/i.test(context.problem);
    
    metrics.clarity = Math.min(1.0, 
      (problemLength > 20 ? 0.3 : 0.1) +
      (hasQuestionWords ? 0.3 : 0.0) +
      (isSpecific ? 0.4 : 0.2)
    );

    // Solution completeness
    const solutionLength = context.solution.length;
    const hasSteps = /\b(step|first|then|next|finally)\b/i.test(context.solution) || 
                     /^\d+\.|\n\d+\.|\n-\s/m.test(context.solution);
    const hasCodeExample = context.hasCodeExamples || /```|`[^`]+`|\bcode\b/i.test(context.solution);
    const hasExplanation = /\b(because|reason|explanation|why)\b/i.test(context.solution);

    metrics.completeness = Math.min(1.0,
      (solutionLength > 50 ? 0.3 : 0.1) +
      (hasSteps ? 0.3 : 0.1) +
      (hasCodeExample ? 0.2 : 0.0) +
      (hasExplanation ? 0.2 : 0.0)
    );

    // Technical depth
    const technicalTerms = (context.solution.match(/\b(function|method|class|variable|array|object|API|database|server|client|configuration|implementation)\b/gi) || []).length;
    metrics.technicalDepth = Math.min(1.0, technicalTerms * 0.1);

    // Actionability
    const hasActionWords = /\b(install|run|execute|create|add|remove|update|configure|set|use|try|check)\b/i.test(context.solution);
    const hasCommands = /\$|npm|pip|git|cd |mkdir|touch|ls |cp |mv /i.test(context.solution);
    
    metrics.actionability = Math.min(1.0,
      (hasActionWords ? 0.4 : 0.1) +
      (hasCommands ? 0.3 : 0.0) +
      (hasSteps ? 0.3 : 0.1)
    );

    // Quality flags
    if (solutionLength < 30) flags.push('Solution too brief');
    if (problemLength < 10) flags.push('Problem unclear');
    if (!hasActionWords && !hasCodeExample) flags.push('Not actionable');
    if (context.solution.includes('TODO') || context.solution.includes('...')) flags.push('Incomplete solution');

    metrics.flags = flags;
    metrics.reasoning = `Heuristic analysis: Problem clarity ${(metrics.clarity * 100).toFixed(0)}%, Solution completeness ${(metrics.completeness * 100).toFixed(0)}%`;

    return metrics;
  }

  private getCommunityScoring(context: ScoringContext): Partial<QualityMetrics> {
    const upvotes = context.upvotes || 0;
    const downvotes = context.downvotes || 0;
    const views = context.views || 0;

    if (upvotes + downvotes === 0) {
      return { relevance: 0.5 }; // Neutral when no community input
    }

    const voteRatio = upvotes / (upvotes + downvotes);
    const engagementScore = Math.min(1.0, (upvotes + downvotes) / 10); // Normalize to 10 votes = max engagement
    const viewScore = Math.min(1.0, views / 100); // Normalize to 100 views = max

    return {
      relevance: voteRatio,
      accuracy: voteRatio > 0.8 ? 0.9 : voteRatio > 0.6 ? 0.7 : 0.5,
      communityEngagement: engagementScore,
      popularity: viewScore
    };
  }

  private combineScores(ai: Partial<QualityMetrics>, heuristic: Partial<QualityMetrics>, community: Partial<QualityMetrics>): QualityMetrics {
    const combined: any = {
      clarity: this.weightedAverage([ai.clarity, heuristic.clarity], [0.7, 0.3]),
      completeness: this.weightedAverage([ai.completeness, heuristic.completeness], [0.6, 0.4]),
      accuracy: this.weightedAverage([ai.accuracy, heuristic.accuracy, community.accuracy], [0.4, 0.3, 0.3]),
      relevance: this.weightedAverage([ai.relevance, community.relevance], [0.5, 0.5]),
      actionability: this.weightedAverage([ai.actionability, heuristic.actionability], [0.6, 0.4]),
      technicalDepth: this.weightedAverage([ai.technicalDepth, heuristic.technicalDepth], [0.7, 0.3]),
      flags: [...(ai.flags || []), ...(heuristic.flags || [])],
      suggestedImprovements: ai.suggestedImprovements || [],
      reasoning: this.combineReasoning(ai.reasoning, heuristic.reasoning)
    };

    // Calculate overall scores
    combined.qualityScore = this.calculateQualityScore(combined);
    combined.confidenceScore = this.calculateConfidenceScore(combined, ai, heuristic, community);

    return combined;
  }

  private weightedAverage(values: (number | undefined)[], weights: number[]): number {
    const validValues = values.map((v, i) => ({ value: v, weight: weights[i] }))
                             .filter(item => item.value !== undefined);
    
    if (validValues.length === 0) return 0.5;

    const totalWeight = validValues.reduce((sum, item) => sum + item.weight, 0);
    const weightedSum = validValues.reduce((sum, item) => sum + (item.value! * item.weight), 0);

    return weightedSum / totalWeight;
  }

  private calculateQualityScore(metrics: any): number {
    return (
      (metrics.clarity || 0.5) * this.QUALITY_WEIGHTS.clarity +
      (metrics.completeness || 0.5) * this.QUALITY_WEIGHTS.completeness +
      (metrics.accuracy || 0.5) * this.QUALITY_WEIGHTS.accuracy +
      (metrics.relevance || 0.5) * this.QUALITY_WEIGHTS.relevance +
      (metrics.actionability || 0.5) * this.QUALITY_WEIGHTS.actionability
    );
  }

  private calculateConfidenceScore(combined: any, ai: any, heuristic: any, community: any): number {
    let confidence = combined.qualityScore;

    // Boost confidence if multiple sources agree
    const sourceAgreement = this.calculateSourceAgreement([ai, heuristic, community]);
    confidence *= (0.7 + sourceAgreement * 0.3);

    // Reduce confidence for flagged issues
    const flagPenalty = Math.min(0.3, combined.flags.length * 0.1);
    confidence -= flagPenalty;

    // Community validation boost
    if (community.accuracy && community.accuracy > 0.8) {
      confidence += 0.1;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private calculateSourceAgreement(sources: any[]): number {
    // Calculate how much the different scoring sources agree
    const validSources = sources.filter(s => Object.keys(s).length > 0);
    if (validSources.length < 2) return 0.5;

    // Compare quality scores if available
    const scores = validSources.map(s => s.qualityScore || this.calculateQualityScore(s)).filter(s => s > 0);
    if (scores.length < 2) return 0.5;

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    
    // Lower variance = higher agreement
    return Math.max(0, 1 - variance * 4);
  }

  private shouldAutoValidate(metrics: QualityMetrics): boolean {
    return (
      metrics.confidenceScore >= this.CONFIDENCE_THRESHOLDS.HIGH &&
      metrics.qualityScore >= this.CONFIDENCE_THRESHOLDS.MEDIUM &&
      metrics.flags.length === 0 &&
      metrics.accuracy >= 0.8 &&
      metrics.completeness >= 0.7
    );
  }

  private combineReasoning(aiReasoning?: string, heuristicReasoning?: string): string {
    const parts = [aiReasoning, heuristicReasoning].filter(Boolean);
    return parts.length > 0 ? parts.join(' | ') : 'Automated quality assessment completed';
  }

  private getFallbackScoring(context: ScoringContext): QualityMetrics {
    // Simple fallback when AI is not available
    const heuristic = this.getHeuristicScoring(context);
    const community = this.getCommunityScoring(context);

    return {
      confidenceScore: 0.6,
      qualityScore: 0.6,
      clarity: heuristic.clarity || 0.6,
      completeness: heuristic.completeness || 0.6,
      accuracy: community.accuracy || 0.6,
      relevance: community.relevance || 0.6,
      actionability: heuristic.actionability || 0.6,
      technicalDepth: heuristic.technicalDepth || 0.5,
      reasoning: 'Fallback scoring - AI unavailable',
      autoValidated: false,
      flags: heuristic.flags || [],
      suggestedImprovements: ['Consider adding more detail', 'Add code examples if applicable']
    };
  }

  // Public method to update scores based on community feedback
  updateWithCommunityFeedback(
    existingMetrics: QualityMetrics, 
    upvotes: number, 
    downvotes: number, 
    views: number
  ): QualityMetrics {
    const context: ScoringContext = {
      problem: '', // Not needed for community update
      solution: '',
      upvotes,
      downvotes,
      views
    };

    const communityScoring = this.getCommunityScoring(context);
    
    // Blend community feedback with existing scores
    return {
      ...existingMetrics,
      relevance: this.weightedAverage([existingMetrics.relevance, communityScoring.relevance], [0.6, 0.4]),
      accuracy: this.weightedAverage([existingMetrics.accuracy, communityScoring.accuracy], [0.7, 0.3]),
      confidenceScore: this.weightedAverage([existingMetrics.confidenceScore, communityScoring.relevance || 0.5], [0.8, 0.2])
    };
  }
}

export const qualityScorer = new QualityScorer();