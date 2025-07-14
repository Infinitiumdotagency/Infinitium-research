import { BaseAgent, Task, ResearchContext, AgentResult } from './framework/BaseAgent';
import { sendMessageToGroq } from '../services/groq';

export class WritingAgent extends BaseAgent {
  constructor() {
    super('writing-agent', 'WritingAgent', [
      'long-form-writing',
      'content-structuring',
      'citation-integration',
      'narrative-flow',
      'technical-writing'
    ]);
  }

  async execute(task: Task, context: ResearchContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      switch (task.type) {
        case 'generate-progress-update':
          return await this.generateProgressUpdate(task, context);
        case 'create-preliminary-report':
          return await this.createPreliminaryReport(task, context);
        case 'write-comprehensive-report':
          return await this.writeComprehensiveReport(task, context);
        case 'create-executive-summary':
          return await this.createExecutiveSummary(task, context);
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

  private async generateProgressUpdate(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { stage, progress, findings } = task.payload;
    
    console.log('✍️ WritingAgent: Generating progress update', { stage, progress });
    
    const updatePrompt = this.createProgressPrompt(stage, progress, findings, context);
    
    const response = await sendMessageToGroq([
      {
        role: 'system',
        content: 'You are a research assistant providing concise progress updates. Keep updates brief but informative, highlighting key discoveries and next steps.'
      },
      {
        role: 'user',
        content: updatePrompt
      }
    ]);

    console.log('📝 Progress update generated:', { length: response.length });
    
    return {
      success: true,
      data: {
        content: response,
        type: 'progress-update',
        stage: stage
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.9
      }
    };
  }

  private async createPreliminaryReport(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { analysis, sources } = task.payload;
    
    console.log('📄 WritingAgent: Creating preliminary report', { sourcesCount: sources?.length });
    
    const reportPrompt = this.createPreliminaryPrompt(analysis, sources, context);
    
    const response = await sendMessageToGroq([
      {
        role: 'system',
        content: 'You are a research analyst creating preliminary findings reports. Provide structured analysis with key insights, emerging patterns, and areas requiring further investigation. Use clear headings and bullet points.'
      },
      {
        role: 'user',
        content: reportPrompt
      }
    ], undefined, 3000); // Longer response

    console.log('📋 Preliminary report generated:', { length: response.length });
    
    return {
      success: true,
      data: {
        content: response,
        type: 'preliminary-report',
        wordCount: response.split(' ').length
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.85
      }
    };
  }

  private async writeComprehensiveReport(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { synthesis, sources, analysis } = task.payload;
    
    console.log('📚 WritingAgent: Writing comprehensive report', { sourcesCount: sources?.length });
    
    // Generate report in sections for better quality
    const sections = await this.generateReportSections(synthesis, sources, analysis, context);
    
    const fullReport = this.assembleFullReport(sections, context);

    console.log('📖 Comprehensive report assembled:', { 
      sectionsCount: sections.length, 
      wordCount: fullReport.split(' ').length 
    });
    
    return {
      success: true,
      data: {
        content: fullReport,
        type: 'comprehensive-report',
        sections: sections.map(s => s.title),
        wordCount: fullReport.split(' ').length
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.9,
        nextActions: ['quality-review']
      }
    };
  }

  private async createExecutiveSummary(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { fullReport } = task.payload;
    
    const summaryPrompt = `Create a concise executive summary (300-500 words) of this research report:

${fullReport}

Focus on:
- Key findings and conclusions
- Most important insights
- Actionable recommendations
- Confidence level of findings

Format as a professional executive summary with clear, impactful language.`;

    const response = await sendMessageToGroq([
      {
        role: 'system',
        content: 'You are an executive communications specialist. Create clear, impactful summaries that highlight the most important findings and actionable insights.'
      },
      {
        role: 'user',
        content: summaryPrompt
      }
    ], undefined, 2000);

    return {
      success: true,
      data: {
        content: response,
        type: 'executive-summary',
        wordCount: response.split(' ').length
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.9
      }
    };
  }

  private createProgressPrompt(stage: string, progress: any, findings: any[], context: ResearchContext): string {
    return `Research Progress Update:

Topic: ${context.originalQuery}
Current Stage: ${stage}
Progress: ${progress.completedSearches}/${progress.totalSearches} searches completed
Sources Found: ${progress.sourcesFound}

Recent Findings:
${findings.slice(-3).map(f => `- ${f}`).join('\n')}

Provide a brief, engaging update on the research progress. Mention what's been discovered so far and what's coming next.`;
  }

  private createPreliminaryPrompt(analysis: any, sources: any[], context: ResearchContext): string {
    return `Preliminary Research Analysis:

Research Topic: ${context.originalQuery}
Sources Analyzed: ${sources.length}
Average Source Credibility: ${(sources.reduce((sum, s) => sum + s.credibilityScore, 0) / sources.length * 100).toFixed(0)}%

Key Analysis Results:
- Source Distribution: ${JSON.stringify(analysis.sourceDistribution?.byType || {})}
- Key Findings: ${analysis.keyFindings?.slice(0, 5).join('; ') || 'Processing...'}
- Emerging Themes: ${analysis.emergingThemes?.slice(0, 5).join(', ') || 'Identifying...'}

Create a preliminary research report (800-1200 words) with:
1. Overview of findings so far
2. Key insights and patterns
3. Source quality assessment
4. Areas requiring further investigation
5. Preliminary conclusions

Use professional academic tone with clear structure and headings.`;
  }

  private async generateReportSections(synthesis: any, sources: any[], analysis: any, context: ResearchContext): Promise<any[]> {
    const sections = [
      {
        title: 'Executive Summary',
        prompt: this.createExecutiveSummaryPrompt(synthesis, context)
      },
      {
        title: 'Methodology and Sources',
        prompt: this.createMethodologyPrompt(sources, analysis, context)
      },
      {
        title: 'Key Findings and Analysis',
        prompt: this.createFindingsPrompt(synthesis, analysis, context)
      },
      {
        title: 'Discussion and Implications',
        prompt: this.createDiscussionPrompt(synthesis, context)
      },
      {
        title: 'Conclusions and Recommendations',
        prompt: this.createConclusionsPrompt(synthesis, context)
      }
    ];

    const generatedSections = [];
    
    for (const section of sections) {
      try {
        const response = await sendMessageToGroq([
          {
            role: 'system',
            content: 'You are a research analyst writing detailed, professional research reports. Provide comprehensive analysis with clear structure, evidence-based conclusions, and proper academic tone.'
          },
          {
            role: 'user',
            content: section.prompt
          }
        ], undefined, 4000); // Longer responses for detailed sections

        generatedSections.push({
          title: section.title,
          content: response
        });

        // Brief delay between sections
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.log(`Failed to generate section: ${section.title}`, 'error');
        generatedSections.push({
          title: section.title,
          content: `[Section generation failed: ${section.title}]`
        });
      }
    }

    return generatedSections;
  }

  private createExecutiveSummaryPrompt(synthesis: any, context: ResearchContext): string {
    return `Write an Executive Summary section (400-600 words) for a research report on: "${context.originalQuery}"

Key Information:
- Research Confidence: ${(synthesis.confidenceLevel * 100).toFixed(0)}%
- Key Findings: ${synthesis.keyFindings?.slice(0, 5).join('; ') || 'Multiple findings identified'}
- Knowledge Gaps: ${synthesis.gaps?.join(', ') || 'Comprehensive coverage achieved'}

Create a professional executive summary that:
- Clearly states the research objective
- Highlights the most important findings
- Indicates confidence level and limitations
- Provides actionable insights
- Uses clear, executive-level language`;
  }

  private createMethodologyPrompt(sources: any[], analysis: any, context: ResearchContext): string {
    return `Write a Methodology and Sources section (500-800 words) for a research report on: "${context.originalQuery}"

Source Information:
- Total Sources: ${sources.length}
- Source Types: ${JSON.stringify(analysis.sourceDistribution?.byType || {})}
- Average Credibility: ${(sources.reduce((sum, s) => sum + s.credibilityScore, 0) / sources.length * 100).toFixed(0)}%
- Temporal Distribution: Recent (${analysis.temporalAnalysis?.recent || 0}), Current (${analysis.temporalAnalysis?.current || 0}), Historical (${analysis.temporalAnalysis?.historical || 0})

Describe:
- Research methodology and approach
- Source selection criteria
- Quality assessment process
- Limitations and constraints
- Data collection timeframe`;
  }

  private createFindingsPrompt(synthesis: any, analysis: any, context: ResearchContext): string {
    return `Write a Key Findings and Analysis section (1000-1500 words) for a research report on: "${context.originalQuery}"

Analysis Results:
- Key Findings: ${synthesis.keyFindings?.join('\n- ') || 'Multiple significant findings'}
- Emerging Themes: ${analysis.emergingThemes?.join(', ') || 'Various themes identified'}
- Patterns: ${analysis.patterns ? JSON.stringify(analysis.patterns) : 'Pattern analysis completed'}

Provide:
- Detailed presentation of key findings
- Supporting evidence and data
- Pattern analysis and trends
- Cross-source verification
- Statistical insights where available
- Thematic analysis`;
  }

  private createDiscussionPrompt(synthesis: any, context: ResearchContext): string {
    return `Write a Discussion and Implications section (800-1200 words) for a research report on: "${context.originalQuery}"

Research Context:
- Confidence Level: ${(synthesis.confidenceLevel * 100).toFixed(0)}%
- Key Insights: ${synthesis.keyFindings?.slice(0, 3).join('; ') || 'Multiple insights identified'}
- Limitations: ${synthesis.gaps?.join(', ') || 'Standard research limitations'}

Discuss:
- Interpretation of findings
- Broader implications and significance
- Connections to existing knowledge
- Potential applications
- Limitations and caveats
- Future research directions`;
  }

  private createConclusionsPrompt(synthesis: any, context: ResearchContext): string {
    return `Write a Conclusions and Recommendations section (600-900 words) for a research report on: "${context.originalQuery}"

Research Summary:
- Overall Confidence: ${(synthesis.confidenceLevel * 100).toFixed(0)}%
- Main Conclusions: ${synthesis.keyFindings?.slice(0, 3).join('; ') || 'Multiple conclusions reached'}
- Recommendations: ${synthesis.recommendations?.join('; ') || 'Various recommendations provided'}

Provide:
- Clear, definitive conclusions
- Evidence-based recommendations
- Actionable next steps
- Areas for further investigation
- Final assessment of research quality
- Practical applications`;
  }

  private assembleFullReport(sections: any[], context: ResearchContext): string {
    const header = `# 🔬 Comprehensive Research Report: ${context.originalQuery}

*Generated on ${new Date().toLocaleDateString()} | Research Session: ${context.sessionId}*

---

`;

    const sectionContent = sections.map(section => 
      `## ${section.title}\n\n${section.content}\n\n---\n`
    ).join('\n');

    const footer = `\n*This report was generated using AI-powered research analysis with multi-source verification and synthesis.*`;

    return header + sectionContent + footer;
  }
}