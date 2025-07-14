import { BaseAgent, Task, ResearchContext, AgentResult } from './framework/BaseAgent';

export class AnalysisAgent extends BaseAgent {
  constructor() {
    super('analysis-agent', 'AnalysisAgent', [
      'data-synthesis',
      'pattern-recognition',
      'contradiction-detection',
      'gap-identification',
      'insight-generation'
    ]);
  }

  async execute(task: Task, context: ResearchContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      switch (task.type) {
        case 'analyze-sources':
          return await this.analyzeSources(task, context);
        case 'identify-patterns':
          return await this.identifyPatterns(task, context);
        case 'detect-contradictions':
          return await this.detectContradictions(task, context);
        case 'find-gaps':
          return await this.findKnowledgeGaps(task, context);
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        metadata: {
          processingTime: Date.now() - startTime,
          confidence: 0
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private async analyzeSources(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { sources } = task.payload;
    
    const analysis = {
      sourceDistribution: this.analyzeSourceDistribution(sources),
      credibilityAnalysis: this.analyzeCredibility(sources),
      temporalAnalysis: this.analyzeTemporalDistribution(sources),
      topicalCoverage: this.analyzeTopicalCoverage(sources, context.originalQuery),
      keyFindings: this.extractKeyFindings(sources),
      emergingThemes: this.identifyEmergingThemes(sources)
    };

    return {
      success: true,
      data: analysis,
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.85,
        nextActions: ['generate-insights', 'identify-gaps']
      }
    };
  }

  private async identifyPatterns(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { findings } = task.payload;
    
    const patterns = {
      trends: this.identifyTrends(findings),
      correlations: this.findCorrelations(findings),
      causality: this.analyzeCausality(findings),
      cyclical: this.detectCyclicalPatterns(findings)
    };

    return {
      success: true,
      data: patterns,
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.75,
        nextActions: ['synthesize-insights']
      }
    };
  }

  private async detectContradictions(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { sources } = task.payload;
    
    const contradictions = this.findContradictions(sources);
    const resolutions = this.proposeResolutions(contradictions);

    return {
      success: true,
      data: {
        contradictions,
        resolutions,
        reliability: this.assessReliability(contradictions, sources)
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.8,
        nextActions: ['verify-claims']
      }
    };
  }

  private async findKnowledgeGaps(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { sources, originalQuery } = task.payload;
    
    const gaps = {
      topicalGaps: this.identifyTopicalGaps(sources, originalQuery),
      temporalGaps: this.identifyTemporalGaps(sources),
      perspectiveGaps: this.identifyPerspectiveGaps(sources),
      methodologicalGaps: this.identifyMethodologicalGaps(sources)
    };

    return {
      success: true,
      data: gaps,
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.8,
        nextActions: ['suggest-additional-searches']
      }
    };
  }

  private analyzeSourceDistribution(sources: any[]): any {
    const distribution = sources.reduce((acc, source) => {
      acc[source.sourceType] = (acc[source.sourceType] || 0) + 1;
      return acc;
    }, {});

    return {
      byType: distribution,
      diversity: Object.keys(distribution).length,
      dominantType: Object.entries(distribution).sort(([,a], [,b]) => (b as number) - (a as number))[0]
    };
  }

  private analyzeCredibility(sources: any[]): any {
    const scores = sources.map(s => s.credibilityScore);
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      average: avg,
      distribution: {
        high: scores.filter(s => s > 0.8).length,
        medium: scores.filter(s => s >= 0.6 && s <= 0.8).length,
        low: scores.filter(s => s < 0.6).length
      },
      recommendation: avg > 0.7 ? 'high-confidence' : avg > 0.5 ? 'moderate-confidence' : 'low-confidence'
    };
  }

  private analyzeTemporalDistribution(sources: any[]): any {
    const now = new Date();
    const periods = {
      recent: 0,    // < 30 days
      current: 0,   // < 6 months
      relevant: 0,  // < 2 years
      historical: 0 // > 2 years
    };

    sources.forEach(source => {
      if (!source.publishDate) return;
      
      const date = new Date(source.publishDate);
      const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 30) periods.recent++;
      else if (daysDiff < 180) periods.current++;
      else if (daysDiff < 730) periods.relevant++;
      else periods.historical++;
    });

    return periods;
  }

  private analyzeTopicalCoverage(sources: any[], query: string): any {
    const queryTerms = query.toLowerCase().split(' ');
    const coverage = queryTerms.map(term => {
      const mentionCount = sources.filter(source => 
        (source.title + ' ' + source.snippet).toLowerCase().includes(term)
      ).length;
      
      return {
        term,
        coverage: mentionCount / sources.length,
        mentions: mentionCount
      };
    });

    return {
      termCoverage: coverage,
      overallCoverage: coverage.reduce((sum, item) => sum + item.coverage, 0) / coverage.length,
      gaps: coverage.filter(item => item.coverage < 0.3).map(item => item.term)
    };
  }

  private extractKeyFindings(sources: any[]): string[] {
    const findings: string[] = [];
    
    sources.forEach(source => {
      const snippet = source.snippet.toLowerCase();
      
      // Look for key indicators
      if (snippet.includes('study found') || snippet.includes('research shows')) {
        findings.push(`Research: ${source.snippet.split('.')[0]}.`);
      }
      
      if (snippet.includes('according to') || snippet.includes('experts say')) {
        findings.push(`Expert opinion: ${source.snippet.split('.')[0]}.`);
      }
      
      // Extract numerical data
      const numbers = snippet.match(/\d+(?:\.\d+)?%|\$\d+(?:,\d{3})*|\d+(?:,\d{3})*/g);
      if (numbers && numbers.length > 0) {
        findings.push(`Data point: ${source.snippet.split('.')[0]}.`);
      }
    });

    return [...new Set(findings)].slice(0, 10);
  }

  private identifyEmergingThemes(sources: any[]): string[] {
    const themes = new Map<string, number>();
    
    sources.forEach(source => {
      const text = (source.title + ' ' + source.snippet).toLowerCase();
      
      // Simple keyword extraction (in real implementation, use NLP)
      const words = text.split(/\s+/).filter(word => word.length > 4);
      words.forEach(word => {
        themes.set(word, (themes.get(word) || 0) + 1);
      });
    });

    return Array.from(themes.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([theme]) => theme);
  }

  private identifyTrends(findings: any[]): any[] {
    // Simplified trend identification
    return findings.filter(finding => 
      finding.content && (
        finding.content.includes('increasing') ||
        finding.content.includes('growing') ||
        finding.content.includes('declining') ||
        finding.content.includes('trend')
      )
    );
  }

  private findCorrelations(findings: any[]): any[] {
    // Simplified correlation detection
    return findings.filter(finding =>
      finding.content && (
        finding.content.includes('related to') ||
        finding.content.includes('associated with') ||
        finding.content.includes('correlation')
      )
    );
  }

  private analyzeCausality(findings: any[]): any[] {
    return findings.filter(finding =>
      finding.content && (
        finding.content.includes('because') ||
        finding.content.includes('due to') ||
        finding.content.includes('caused by') ||
        finding.content.includes('results in')
      )
    );
  }

  private detectCyclicalPatterns(findings: any[]): any[] {
    return findings.filter(finding =>
      finding.content && (
        finding.content.includes('cycle') ||
        finding.content.includes('seasonal') ||
        finding.content.includes('periodic') ||
        finding.content.includes('recurring')
      )
    );
  }

  private findContradictions(sources: any[]): any[] {
    const contradictions: any[] = [];
    
    // Simple contradiction detection (compare opposing statements)
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const source1 = sources[i];
        const source2 = sources[j];
        
        if (this.areContradictory(source1.snippet, source2.snippet)) {
          contradictions.push({
            source1: source1,
            source2: source2,
            type: 'factual-disagreement'
          });
        }
      }
    }
    
    return contradictions;
  }

  private areContradictory(text1: string, text2: string): boolean {
    // Simplified contradiction detection
    const opposites = [
      ['increase', 'decrease'],
      ['rise', 'fall'],
      ['positive', 'negative'],
      ['effective', 'ineffective'],
      ['successful', 'unsuccessful']
    ];
    
    return opposites.some(([word1, word2]) =>
      (text1.includes(word1) && text2.includes(word2)) ||
      (text1.includes(word2) && text2.includes(word1))
    );
  }

  private proposeResolutions(contradictions: any[]): any[] {
    return contradictions.map(contradiction => ({
      contradiction,
      resolution: this.suggestResolution(contradiction),
      confidence: this.assessContradictionConfidence(contradiction)
    }));
  }

  private suggestResolution(contradiction: any): string {
    const cred1 = contradiction.source1.credibilityScore;
    const cred2 = contradiction.source2.credibilityScore;
    
    if (Math.abs(cred1 - cred2) > 0.2) {
      return `Trust higher credibility source (${cred1 > cred2 ? 'source 1' : 'source 2'})`;
    }
    
    return 'Seek additional sources for clarification';
  }

  private assessContradictionConfidence(contradiction: any): number {
    const credDiff = Math.abs(
      contradiction.source1.credibilityScore - 
      contradiction.source2.credibilityScore
    );
    
    return credDiff > 0.3 ? 0.8 : 0.5;
  }

  private assessReliability(contradictions: any[], sources: any[]): any {
    const contradictionRate = contradictions.length / sources.length;
    
    return {
      rate: contradictionRate,
      assessment: contradictionRate < 0.1 ? 'high' : 
                 contradictionRate < 0.3 ? 'moderate' : 'low',
      recommendation: contradictionRate > 0.3 ? 
        'Seek additional verification' : 
        'Information appears consistent'
    };
  }

  private identifyTopicalGaps(sources: any[], query: string): string[] {
    const queryTerms = query.toLowerCase().split(' ');
    const gaps: string[] = [];
    
    queryTerms.forEach(term => {
      const coverage = sources.filter(source =>
        (source.title + ' ' + source.snippet).toLowerCase().includes(term)
      ).length;
      
      if (coverage < sources.length * 0.3) {
        gaps.push(`Limited coverage of "${term}"`);
      }
    });
    
    return gaps;
  }

  private identifyTemporalGaps(sources: any[]): string[] {
    const gaps: string[] = [];
    const now = new Date();
    
    const recentSources = sources.filter(source => {
      if (!source.publishDate) return false;
      const date = new Date(source.publishDate);
      const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < 90;
    });
    
    if (recentSources.length < sources.length * 0.3) {
      gaps.push('Limited recent information (last 3 months)');
    }
    
    return gaps;
  }

  private identifyPerspectiveGaps(sources: any[]): string[] {
    const gaps: string[] = [];
    const sourceTypes = new Set(sources.map(s => s.sourceType));
    
    if (!sourceTypes.has('academic')) {
      gaps.push('Missing academic/research perspectives');
    }
    
    if (!sourceTypes.has('government')) {
      gaps.push('Missing official/government sources');
    }
    
    if (sourceTypes.size < 3) {
      gaps.push('Limited diversity in source types');
    }
    
    return gaps;
  }

  private identifyMethodologicalGaps(sources: any[]): string[] {
    const gaps: string[] = [];
    
    const hasQuantitative = sources.some(source =>
      source.snippet.includes('study') || 
      source.snippet.includes('data') ||
      source.snippet.includes('statistics')
    );
    
    const hasQualitative = sources.some(source =>
      source.snippet.includes('interview') ||
      source.snippet.includes('survey') ||
      source.snippet.includes('opinion')
    );
    
    if (!hasQuantitative) {
      gaps.push('Limited quantitative research');
    }
    
    if (!hasQualitative) {
      gaps.push('Limited qualitative insights');
    }
    
    return gaps;
  }
}