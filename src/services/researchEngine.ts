import { ResearchSession, ResearchMode, ResearchStatus, ResearchFinding } from '../types/research';
import { generateResearchPlan, analyzeResearchNeeds } from '../utils/researchPlanner';
import { performAdvancedSearch, generateSearchStrategies } from './advancedSearch';
import { synthesizeResearch } from '../utils/synthesizer';

export class ResearchEngine {
  private sessions: Map<string, ResearchSession> = new Map();
  private onProgressUpdate?: (sessionId: string, session: ResearchSession) => void;

  setProgressCallback(callback: (sessionId: string, session: ResearchSession) => void) {
    this.onProgressUpdate = callback;
  }

  async startResearch(
    query: string, 
    mode?: ResearchMode
  ): Promise<string> {
    // Analyze query to suggest research approach
    const analysis = analyzeResearchNeeds(query);
    const selectedMode = mode || analysis.suggestedMode;
    
    // Create research session
    const sessionId = `research_${Date.now()}`;
    const session: ResearchSession = {
      id: sessionId,
      originalQuery: query,
      mode: selectedMode,
      status: 'planning',
      findings: [],
      searchQueries: [],
      startTime: new Date(),
      progress: {
        currentStage: 'planning',
        stagesCompleted: [],
        totalSearches: 0,
        completedSearches: 0,
        sourcesFound: 0
      }
    };
    
    this.sessions.set(sessionId, session);
    this.updateProgress(sessionId, session);
    
    try {
      // Phase 1: Planning
      await this.sleep(500); // Simulate planning time
      const researchPlan = generateResearchPlan(query, selectedMode);
      session.progress.totalSearches = researchPlan.searchQueries.length;
      this.updateStage(sessionId, 'searching');
      
      // Phase 2: Multi-stage searching
      const searchStrategies = generateSearchStrategies(query, researchPlan.searchQueries);
      const sources = await performAdvancedSearch(searchStrategies);
      
      // Update progress during search
      session.progress.completedSearches = researchPlan.searchQueries.length;
      session.progress.sourcesFound = sources.length;
      this.updateStage(sessionId, 'analyzing');
      
      // Phase 3: Analysis and synthesis
      await this.sleep(1000); // Simulate analysis time
      const synthesis = synthesizeResearch(sources, query);
      this.updateStage(sessionId, 'synthesizing');
      
      // Phase 4: Generate final report
      await this.sleep(500);
      const report = this.generateResearchReport(synthesis, sources, selectedMode);
      
      // Complete session
      session.status = 'completed';
      session.completionTime = new Date();
      this.updateStage(sessionId, 'completed');
      
      return report;
      
    } catch (error) {
      session.status = 'error';
      this.updateProgress(sessionId, session);
      throw error;
    }
  }

  private generateResearchReport(synthesis: any, sources: any[], mode: ResearchMode): string {
    let report = `# 🔬 Deep Research Report\n\n`;
    
    // Add mode indicator
    const modeEmojis = {
      quick: '⚡',
      standard: '📊',
      deep: '🔍',
      comparative: '⚖️',
      timeline: '📅'
    };
    
    report += `**Research Mode:** ${modeEmojis[mode]} ${mode.charAt(0).toUpperCase() + mode.slice(1)}\n`;
    report += `**Sources Analyzed:** ${sources.length}\n`;
    report += `**Confidence Level:** ${(synthesis.confidenceLevel * 100).toFixed(0)}%\n\n`;
    
    // Executive Summary
    report += `## 📋 Executive Summary\n\n${synthesis.executiveSummary}\n\n`;
    
    // Key Findings
    if (synthesis.keyFindings.length > 0) {
      report += `## 🎯 Key Findings\n\n`;
      synthesis.keyFindings.forEach((finding: string, index: number) => {
        report += `${index + 1}. ${finding}\n\n`;
      });
    }
    
    // Knowledge Gaps
    if (synthesis.gaps.length > 0) {
      report += `## ⚠️ Research Limitations\n\n`;
      synthesis.gaps.forEach((gap: string) => {
        report += `• ${gap}\n`;
      });
      report += '\n';
    }
    
    // Recommendations
    if (synthesis.recommendations.length > 0) {
      report += `## 💡 Recommendations for Further Research\n\n`;
      synthesis.recommendations.forEach((rec: string) => {
        report += `• ${rec}\n`;
      });
      report += '\n';
    }
    
    // Sources Summary
    report += `## 📚 Sources Overview\n\n${synthesis.sourcesSummary}\n\n`;
    
    // Top Sources
    const topSources = sources
      .filter(s => s.credibilityScore > 0.7)
      .slice(0, 8);
    
    if (topSources.length > 0) {
      report += `## 🔗 Key Sources\n\n`;
      topSources.forEach((source, index) => {
        const credibilityBar = '★'.repeat(Math.round(source.credibilityScore * 5));
        report += `**${index + 1}.** [${source.title}](${source.url})\n`;
        report += `   *${source.domain}* | Credibility: ${credibilityBar} (${(source.credibilityScore * 100).toFixed(0)}%)\n`;
        report += `   ${source.snippet.substring(0, 150)}...\n\n`;
      });
    }
    
    report += `---\n*Research completed at ${new Date().toLocaleString()}*`;
    
    return report;
  }

  private updateStage(sessionId: string, stage: ResearchStatus) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.progress.stagesCompleted.push(session.progress.currentStage);
      session.progress.currentStage = stage;
      session.status = stage;
      this.updateProgress(sessionId, session);
    }
  }

  private updateProgress(sessionId: string, session: ResearchSession) {
    this.sessions.set(sessionId, session);
    if (this.onProgressUpdate) {
      this.onProgressUpdate(sessionId, session);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSession(sessionId: string): ResearchSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): ResearchSession[] {
    return Array.from(this.sessions.values());
  }
}

// Singleton instance
export const researchEngine = new ResearchEngine();