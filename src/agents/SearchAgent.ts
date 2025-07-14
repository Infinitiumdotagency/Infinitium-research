import { BaseAgent, Task, ResearchContext, AgentResult } from './framework/BaseAgent';
import { performAdvancedSearch, generateSearchStrategies } from '../services/advancedSearch';

export class SearchAgent extends BaseAgent {
  constructor() {
    super('search-agent', 'SearchAgent', [
      'web-search',
      'query-generation',
      'source-evaluation',
      'search-optimization'
    ]);
  }

  async execute(task: Task, context: ResearchContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      switch (task.type) {
        case 'generate-search-queries':
          return await this.generateSearchQueries(task, context);
        case 'execute-searches':
          return await this.executeSearches(task, context);
        case 'evaluate-sources':
          return await this.evaluateSources(task, context);
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

  private async generateSearchQueries(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { query, mode } = task.payload;
    
    // Generate diverse search strategies
    const baseQueries = this.createBaseQueries(query, mode);
    const expandedQueries = this.expandQueries(baseQueries, context);
    const strategicQueries = this.addStrategicQueries(expandedQueries, context);
    
    return {
      success: true,
      data: {
        queries: strategicQueries,
        searchPlan: this.createSearchPlan(strategicQueries)
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.9,
        nextActions: ['execute-searches']
      }
    };
  }

  private async executeSearches(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { queries } = task.payload;
    const strategies = generateSearchStrategies(context.originalQuery, queries);
    
    this.log(`Executing ${strategies.length} search strategies`);
    
    const sources = await performAdvancedSearch(strategies);
    
    return {
      success: true,
      data: {
        sources,
        searchMetrics: {
          queriesExecuted: strategies.length,
          sourcesFound: sources.length,
          avgCredibility: sources.reduce((sum, s) => sum + s.credibilityScore, 0) / sources.length
        }
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: sources.length > 5 ? 0.8 : 0.6,
        sources: sources.map(s => s.url),
        nextActions: ['analyze-sources']
      }
    };
  }

  private async evaluateSources(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { sources } = task.payload;
    
    const evaluatedSources = sources.map((source: any) => ({
      ...source,
      evaluation: {
        relevance: this.calculateRelevance(source, context.originalQuery),
        freshness: this.calculateFreshness(source),
        authority: this.calculateAuthority(source),
        bias: this.detectBias(source)
      }
    }));

    return {
      success: true,
      data: { evaluatedSources },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.85,
        nextActions: ['synthesize-findings']
      }
    };
  }

  private createBaseQueries(query: string, mode: string): string[] {
    const queries = [query];
    
    // Add mode-specific queries
    switch (mode) {
      case 'deep':
        queries.push(
          `${query} comprehensive analysis`,
          `${query} expert opinion`,
          `${query} latest research`,
          `${query} case studies`,
          `${query} implications`,
          `${query} challenges problems`,
          `${query} future trends`
        );
        break;
      case 'comparative':
        const parts = query.split(/\s+(?:vs|versus|compared to)\s+/i);
        if (parts.length >= 2) {
          queries.push(
            `${parts[0]} advantages`,
            `${parts[1]} advantages`,
            `${parts[0]} disadvantages`,
            `${parts[1]} disadvantages`
          );
        }
        break;
      case 'timeline':
        queries.push(
          `${query} history`,
          `${query} evolution`,
          `${query} development timeline`,
          `${query} milestones`,
          `${query} future predictions`
        );
        break;
    }
    
    return queries;
  }

  private expandQueries(baseQueries: string[], context: ResearchContext): string[] {
    const expanded = [...baseQueries];
    
    // Add contextual expansions
    baseQueries.forEach(query => {
      expanded.push(
        `${query} "recent study"`,
        `${query} "according to experts"`,
        `${query} statistics data`,
        `${query} industry report`
      );
    });
    
    return [...new Set(expanded)]; // Remove duplicates
  }

  private addStrategicQueries(queries: string[], context: ResearchContext): string[] {
    const strategic = [...queries];
    
    // Add strategic searches based on context
    if (context.gaps.length > 0) {
      context.gaps.forEach(gap => {
        strategic.push(`${context.originalQuery} ${gap}`);
      });
    }
    
    return strategic.slice(0, 15); // Limit to prevent API overuse
  }

  private createSearchPlan(queries: string[]): any {
    return {
      phases: [
        { name: 'Broad Discovery', queries: queries.slice(0, 3) },
        { name: 'Specific Investigation', queries: queries.slice(3, 8) },
        { name: 'Deep Analysis', queries: queries.slice(8) }
      ],
      estimatedDuration: queries.length * 2000, // 2 seconds per query
      expectedSources: queries.length * 3
    };
  }

  private calculateRelevance(source: any, query: string): number {
    const queryTerms = query.toLowerCase().split(' ');
    const sourceText = (source.title + ' ' + source.snippet).toLowerCase();
    
    const matches = queryTerms.filter(term => sourceText.includes(term));
    return matches.length / queryTerms.length;
  }

  private calculateFreshness(source: any): number {
    if (!source.publishDate) return 0.5;
    
    const publishDate = new Date(source.publishDate);
    const now = new Date();
    const daysDiff = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 30) return 1.0;
    if (daysDiff < 90) return 0.8;
    if (daysDiff < 365) return 0.6;
    return 0.3;
  }

  private calculateAuthority(source: any): number {
    const domain = source.domain.toLowerCase();
    
    if (domain.endsWith('.gov') || domain.endsWith('.edu')) return 0.9;
    if (domain.includes('research') || domain.includes('academic')) return 0.8;
    if (['reuters.com', 'bbc.com', 'nature.com'].includes(domain)) return 0.85;
    
    return source.credibilityScore || 0.5;
  }

  private detectBias(source: any): string {
    const snippet = source.snippet.toLowerCase();
    
    if (snippet.includes('opinion') || snippet.includes('editorial')) return 'opinion';
    if (snippet.includes('sponsored') || snippet.includes('advertisement')) return 'commercial';
    if (snippet.includes('study') || snippet.includes('research')) return 'academic';
    
    return 'neutral';
  }
}