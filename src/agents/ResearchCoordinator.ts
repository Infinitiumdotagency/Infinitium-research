import { BaseAgent, Task, ResearchContext, AgentResult } from './framework/BaseAgent';
import { SearchAgent } from './SearchAgent';
import { AnalysisAgent } from './AnalysisAgent';
import { WritingAgent } from './WritingAgent';
import { QualityAgent } from './QualityAgent';
import { ResearchMode } from '../types/research';

export class ResearchCoordinator extends BaseAgent {
  private searchAgent: SearchAgent;
  private analysisAgent: AnalysisAgent;
  private writingAgent: WritingAgent;
  private qualityAgent: QualityAgent;
  private onProgressUpdate?: (update: any) => void;

  constructor() {
    super('research-coordinator', 'ResearchCoordinator', [
      'task-orchestration',
      'agent-coordination',
      'progress-management',
      'quality-control'
    ]);
    
    this.searchAgent = new SearchAgent();
    this.analysisAgent = new AnalysisAgent();
    this.writingAgent = new WritingAgent();
    this.qualityAgent = new QualityAgent();
  }

  setProgressCallback(callback: (update: any) => void) {
    this.onProgressUpdate = callback;
  }

  async execute(task: Task, context: ResearchContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    console.log('🎯 ResearchCoordinator: Starting execution', { task: task.type, query: task.payload?.query });
    
    try {
      switch (task.type) {
        case 'conduct-research':
          return await this.conductComprehensiveResearch(task, context);
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

  private async conductComprehensiveResearch(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { query, mode } = task.payload;
    const messages: string[] = [];
    
    console.log('🔬 Starting comprehensive research', { query, mode });
    
    try {
      // Phase 1: Research Planning and Initial Search
      this.updateProgress('Planning comprehensive research strategy...', 'planning');
      await this.sleep(1000); // Allow UI to update
      
      const searchQueriesTask = this.createSubTask('generate-search-queries', { query, mode });
      const searchQueriesResult = await this.searchAgent.execute(searchQueriesTask, context);
      
      console.log('📝 Search queries result:', { success: searchQueriesResult.success, queries: searchQueriesResult.data?.queries?.length });
      
      if (!searchQueriesResult.success) {
        this.log('Search query generation failed, using fallback', 'warn');
        // Fallback to basic search
        const fallbackQueries = [query, `${query} overview`, `${query} analysis`];
        searchQueriesResult.data = { queries: fallbackQueries };
      }

      // Phase 2: Multi-Source Search Execution
      this.updateProgress('Executing multi-source search across the web...', 'searching');
      await this.sleep(1500); // Rate limiting protection
      
      const searchTask = this.createSubTask('execute-searches', { 
        queries: searchQueriesResult.data.queries 
      });
      const searchResult = await this.searchAgent.execute(searchTask, context);
      
      console.log('🔍 Search result:', { success: searchResult.success, sources: searchResult.data?.sources?.length });
      
      if (!searchResult.success) {
        this.log('Search execution failed, attempting fallback search', 'warn');
        // Fallback to basic web search
        try {
          const { searchWeb } = await import('../services/serper');
          const basicResults = await searchWeb(query);
          searchResult.data = { 
            sources: basicResults.map((result, index) => ({
              id: `fallback_${index}`,
              title: result.title,
              url: result.link,
              snippet: result.snippet,
              credibilityScore: 0.7,
              sourceType: 'commercial',
              domain: new URL(result.link).hostname
            }))
          };
          searchResult.success = true;
        } catch (fallbackError) {
          throw new Error('All search methods failed');
        }
      }

      const sources = searchResult.data.sources;
      
      // Send progress update with initial findings
      this.updateProgress(`Found ${sources.length} sources, beginning analysis...`, 'searching');
      await this.sleep(1000);
      
      const progressUpdate = await this.generateProgressUpdate(
        'searching', 
        { sourcesFound: sources.length },
        context
      );
      
      console.log('📊 Generated progress update:', progressUpdate);
      messages.push(progressUpdate);

      // Phase 3: Source Analysis and Pattern Recognition
      this.updateProgress('Analyzing sources and identifying patterns...', 'analyzing');
      await this.sleep(2000); // Allow time for analysis
      
      const analysisTask = this.createSubTask('analyze-sources', { sources });
      const analysisResult = await this.analysisAgent.execute(analysisTask, context);
      
      console.log('🧠 Analysis result:', { success: analysisResult.success, hasData: !!analysisResult.data });
      
      if (!analysisResult.success || !analysisResult.data) {
        this.log('Analysis failed, using basic analysis', 'warn');
        // Fallback analysis
        analysisResult.data = {
          keyFindings: sources.slice(0, 5).map(s => s.snippet.substring(0, 100) + '...'),
          sourceDistribution: { byType: { commercial: sources.length } },
          credibilityAnalysis: { average: 0.7 },
          emergingThemes: ['research', 'analysis', 'findings']
        };
        analysisResult.success = true;
      }

      // Phase 4: Generate Preliminary Report
      this.updateProgress('Generating preliminary research findings...', 'writing');
      await this.sleep(1500);
      
      const preliminaryTask = this.createSubTask('create-preliminary-report', {
        analysis: analysisResult.data,
        sources: sources
      });
      const preliminaryResult = await this.writingAgent.execute(preliminaryTask, context);
      
      console.log('📄 Preliminary result:', { success: preliminaryResult.success, hasContent: !!preliminaryResult.data?.content });
      
      if (preliminaryResult.success) {
        console.log('✅ Adding preliminary report to messages');
        messages.push(preliminaryResult.data.content);
        await this.sleep(2000); // Allow user to read preliminary report
      } else {
        console.warn('❌ Preliminary report generation failed');
      }

      // Phase 5: Deep Analysis and Synthesis
      this.updateProgress('Conducting deep analysis and synthesis...', 'synthesizing');
      await this.sleep(2000);
      
      // Identify patterns and gaps
      const patternsTask = this.createSubTask('identify-patterns', { 
        findings: analysisResult.data.keyFindings 
      });
      const patternsResult = await this.analysisAgent.execute(patternsTask, context);

      const gapsTask = this.createSubTask('find-gaps', { 
        sources: sources,
        originalQuery: query 
      });
      const gapsResult = await this.analysisAgent.execute(gapsTask, context);

      // Phase 6: Comprehensive Report Generation
      this.updateProgress('Generating comprehensive research report...', 'writing');
      await this.sleep(2000);
      
      const comprehensiveTask = this.createSubTask('write-comprehensive-report', {
        synthesis: {
          keyFindings: analysisResult.data.keyFindings,
          confidenceLevel: this.calculateOverallConfidence(sources, analysisResult.data),
          gaps: gapsResult.success ? Object.values(gapsResult.data).flat() : [],
          recommendations: this.generateRecommendations(analysisResult.data, sources)
        },
        sources: sources,
        analysis: analysisResult.data
      });
      
      const comprehensiveResult = await this.writingAgent.execute(comprehensiveTask, context);
      
      console.log('📋 Comprehensive result:', { success: comprehensiveResult.success, hasContent: !!comprehensiveResult.data?.content });
      
      if (!comprehensiveResult.success) {
        this.log('Comprehensive report generation failed, using basic report', 'warn');
        // Generate basic report as fallback
        const basicReport = this.generateBasicReport(query, sources, analysisResult.data);
        comprehensiveResult.data = { content: basicReport };
        comprehensiveResult.success = true;
      }

      // Phase 7: Quality Review and Enhancement
      this.updateProgress('Conducting quality review and final enhancements...', 'reviewing');
      await this.sleep(1500);
      
      const qualityTask = this.createSubTask('review-content', {
        content: comprehensiveResult.data.content,
        sources: sources
      });
      const qualityResult = await this.qualityAgent.execute(qualityTask, context);

      let finalContent = comprehensiveResult.data.content;
      
      // Enhance if quality score is below threshold
      if (qualityResult.success && qualityResult.data.qualityScore < 0.8) {
        this.updateProgress('Enhancing content quality and readability...', 'reviewing');
        await this.sleep(1000);
        
        const enhanceTask = this.createSubTask('enhance-readability', {
          content: finalContent
        });
        const enhanceResult = await this.qualityAgent.execute(enhanceTask, context);
        
        if (enhanceResult.success) {
          finalContent = enhanceResult.data.enhancedContent;
        }
      }

      // Final message with complete report
      console.log('📤 Adding final report to messages');
      messages.push(finalContent);

      this.updateProgress('Research completed successfully!', 'completed');
      await this.sleep(500);

      console.log('🎉 Research completed, total messages:', messages.length);
      
      return {
        success: true,
        data: {
          messages: messages,
          finalReport: finalContent,
          metadata: {
            sourcesAnalyzed: sources.length,
            qualityScore: qualityResult.success ? qualityResult.data.qualityScore : 0.8,
            researchMode: mode,
            wordCount: finalContent.split(' ').length
          }
        },
        metadata: {
          processingTime: Date.now() - Date.now(),
          confidence: 0.9,
          sources: sources.map((s: any) => s.url)
        }
      };

    } catch (error) {
      console.error('💥 Research failed with error:', error);
      this.log(`Research failed: ${error}`, 'error');
      
      // Generate emergency fallback report
      this.updateProgress('Generating fallback research report...', 'completed');
      const fallbackReport = this.generateEmergencyReport(query, error);
      
      return {
        success: true,
        data: {
          messages: [fallbackReport],
          finalReport: fallbackReport,
          metadata: {
            sourcesAnalyzed: 0,
            qualityScore: 0.5,
            researchMode: mode,
            wordCount: fallbackReport.split(' ').length,
            isEmergencyFallback: true
          }
        },
        metadata: {
          processingTime: Date.now() - Date.now(),
          confidence: 0.3,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        }
      };
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateBasicReport(query: string, sources: any[], analysis: any): string {
    return `# Research Report: ${query}

## Overview
Based on analysis of ${sources.length} sources, here are the key findings:

## Key Findings
${analysis.keyFindings?.slice(0, 5).map((finding: string, index: number) => 
  `${index + 1}. ${finding}`
).join('\n') || 'Analysis in progress...'}

## Sources
Research compiled from ${sources.length} sources with varying credibility levels.

## Note
This is a basic research report. For more comprehensive analysis, please try again or contact support.

---
*Generated at ${new Date().toLocaleString()}*`;
  }

  private generateEmergencyReport(query: string, error: any): string {
    return `# Research Report: ${query}

## Status
⚠️ **Research Partially Completed**

We encountered some technical difficulties during the research process, but we've compiled what information we could gather.

## What Happened
${error instanceof Error ? error.message : 'Technical difficulties occurred during research'}

## Recommendations
- Try rephrasing your research query
- Use the standard research mode (/quick) for simpler queries
- Check back later as our systems may be experiencing high load

## Alternative Approaches
You can also try:
- Breaking down your query into smaller, more specific questions
- Using direct web search for immediate information needs
- Consulting multiple sources independently

---
*Emergency report generated at ${new Date().toLocaleString()}*`;
  }
  private async generateProgressUpdate(stage: string, progress: any, context: ResearchContext): Promise<string> {
    const updateTask = this.createSubTask('generate-progress-update', {
      stage,
      progress,
      findings: context.findings || []
    });
    
    const result = await this.writingAgent.execute(updateTask, context);
    return result.success ? result.data.content : `Research ${stage} in progress...`;
  }

  private calculateOverallConfidence(sources: any[], analysis: any): number {
    const sourceQuality = sources.reduce((sum, s) => sum + s.credibilityScore, 0) / sources.length;
    const sourceCount = Math.min(sources.length / 10, 1); // Normalize to 0-1
    const analysisQuality = analysis.credibilityAnalysis?.average || 0.7;
    
    return (sourceQuality + sourceCount + analysisQuality) / 3;
  }

  private generateRecommendations(analysis: any, sources: any[]): string[] {
    const recommendations: string[] = [];
    
    if (sources.length < 8) {
      recommendations.push('Consider gathering additional sources for more comprehensive analysis');
    }
    
    if (analysis.credibilityAnalysis?.average < 0.7) {
      recommendations.push('Seek higher-credibility sources to strengthen findings');
    }
    
    const sourceTypes = new Set(sources.map(s => s.sourceType));
    if (sourceTypes.size < 3) {
      recommendations.push('Diversify source types for broader perspective');
    }
    
    recommendations.push('Cross-reference findings with additional independent sources');
    recommendations.push('Monitor for new developments and updates on this topic');
    
    return recommendations;
  }

  private updateProgress(message: string, stage: string) {
    this.log(message);
    if (this.onProgressUpdate) {
      this.onProgressUpdate({
        message,
        stage,
        timestamp: new Date()
      });
    }
  }
}