import { BaseAgent, Task, ResearchContext, AgentResult } from './framework/BaseAgent';
import { sendMessageToGroq } from '../services/groq';

export class QualityAgent extends BaseAgent {
  constructor() {
    super('quality-agent', 'QualityAgent', [
      'content-review',
      'fact-checking',
      'coherence-analysis',
      'citation-verification',
      'readability-assessment'
    ]);
  }

  async execute(task: Task, context: ResearchContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      switch (task.type) {
        case 'review-content':
          return await this.reviewContent(task, context);
        case 'verify-facts':
          return await this.verifyFacts(task, context);
        case 'assess-coherence':
          return await this.assessCoherence(task, context);
        case 'enhance-readability':
          return await this.enhanceReadability(task, context);
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

  private async reviewContent(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { content, sources } = task.payload;
    
    const review = {
      qualityScore: this.calculateQualityScore(content, sources),
      strengths: this.identifyStrengths(content),
      improvements: this.suggestImprovements(content),
      factualAccuracy: this.assessFactualAccuracy(content, sources),
      readability: this.assessReadability(content),
      completeness: this.assessCompleteness(content, context)
    };

    return {
      success: true,
      data: review,
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.9,
        nextActions: review.qualityScore < 0.8 ? ['enhance-content'] : ['approve-content']
      }
    };
  }

  private async verifyFacts(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { content, sources } = task.payload;
    
    const factualClaims = this.extractFactualClaims(content);
    const verificationResults = await this.verifyClaimsAgainstSources(factualClaims, sources);

    return {
      success: true,
      data: {
        claims: factualClaims,
        verifications: verificationResults,
        overallAccuracy: this.calculateAccuracyScore(verificationResults)
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.85
      }
    };
  }

  private async assessCoherence(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { content } = task.payload;
    
    const coherencePrompt = `Assess the logical flow and coherence of this research content:

${content}

Evaluate:
1. Logical structure and flow
2. Consistency of arguments
3. Smooth transitions between sections
4. Overall narrative coherence

Provide a coherence score (0-1) and specific feedback.`;

    const response = await sendMessageToGroq([
      {
        role: 'system',
        content: 'You are a content quality analyst specializing in logical flow and coherence assessment. Provide detailed, constructive feedback.'
      },
      {
        role: 'user',
        content: coherencePrompt
      }
    ]);

    return {
      success: true,
      data: {
        assessment: response,
        coherenceScore: this.extractCoherenceScore(response)
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.8
      }
    };
  }

  private async enhanceReadability(task: Task, context: ResearchContext): Promise<AgentResult> {
    const { content } = task.payload;
    
    const enhancementPrompt = `Enhance the readability and clarity of this research content while maintaining accuracy and depth:

${content}

Improvements to make:
- Clearer sentence structure
- Better paragraph organization
- More engaging language
- Improved transitions
- Enhanced formatting

Maintain all factual content and citations.`;

    const response = await sendMessageToGroq([
      {
        role: 'system',
        content: 'You are a professional editor specializing in academic and research content. Enhance readability while preserving accuracy and depth.'
      },
      {
        role: 'user',
        content: enhancementPrompt
      }
    ], undefined, 4000);

    return {
      success: true,
      data: {
        enhancedContent: response,
        improvements: this.identifyImprovements(content, response)
      },
      metadata: {
        processingTime: Date.now() - Date.now(),
        confidence: 0.85
      }
    };
  }

  private calculateQualityScore(content: string, sources: any[]): number {
    let score = 0.5; // Base score
    
    // Length and depth
    const wordCount = content.split(' ').length;
    if (wordCount > 1000) score += 0.1;
    if (wordCount > 2000) score += 0.1;
    
    // Structure
    const hasHeadings = content.includes('#');
    const hasBulletPoints = content.includes('•') || content.includes('-');
    if (hasHeadings) score += 0.1;
    if (hasBulletPoints) score += 0.05;
    
    // Citations and sources
    const citationCount = (content.match(/\[.*?\]/g) || []).length;
    if (citationCount > 5) score += 0.1;
    if (sources.length > 10) score += 0.1;
    
    // Professional language
    const professionalTerms = ['analysis', 'research', 'findings', 'conclusion', 'evidence'];
    const termCount = professionalTerms.filter(term => content.includes(term)).length;
    score += (termCount / professionalTerms.length) * 0.1;
    
    return Math.min(score, 1.0);
  }

  private identifyStrengths(content: string): string[] {
    const strengths: string[] = [];
    
    if (content.includes('#')) strengths.push('Well-structured with clear headings');
    if (content.split(' ').length > 1500) strengths.push('Comprehensive and detailed');
    if ((content.match(/\[.*?\]/g) || []).length > 3) strengths.push('Well-cited with sources');
    if (content.includes('data') || content.includes('statistics')) strengths.push('Data-driven analysis');
    if (content.includes('conclusion') || content.includes('recommendation')) strengths.push('Clear conclusions provided');
    
    return strengths;
  }

  private suggestImprovements(content: string): string[] {
    const improvements: string[] = [];
    
    if (!content.includes('#')) improvements.push('Add clear section headings');
    if (content.split(' ').length < 800) improvements.push('Expand with more detailed analysis');
    if ((content.match(/\[.*?\]/g) || []).length < 3) improvements.push('Add more source citations');
    if (!content.includes('conclusion')) improvements.push('Add clear conclusions section');
    if (!content.includes('recommendation')) improvements.push('Include actionable recommendations');
    
    return improvements;
  }

  private assessFactualAccuracy(content: string, sources: any[]): any {
    const claims = this.extractFactualClaims(content);
    const verifiableClaims = claims.filter(claim => 
      sources.some(source => 
        source.snippet.toLowerCase().includes(claim.toLowerCase().substring(0, 20))
      )
    );

    return {
      totalClaims: claims.length,
      verifiableClaims: verifiableClaims.length,
      accuracyScore: verifiableClaims.length / Math.max(claims.length, 1),
      recommendation: verifiableClaims.length / Math.max(claims.length, 1) > 0.7 ? 
        'High factual accuracy' : 'Consider additional verification'
    };
  }

  private assessReadability(content: string): any {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    const readabilityScore = avgWordsPerSentence < 20 ? 0.8 : 
                           avgWordsPerSentence < 25 ? 0.6 : 0.4;

    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: avgWordsPerSentence,
      readabilityScore: readabilityScore,
      recommendation: readabilityScore > 0.7 ? 
        'Good readability' : 'Consider shorter sentences'
    };
  }

  private assessCompleteness(content: string, context: ResearchContext): any {
    const requiredSections = ['summary', 'findings', 'analysis', 'conclusion'];
    const presentSections = requiredSections.filter(section => 
      content.toLowerCase().includes(section)
    );

    const queryTerms = context.originalQuery.toLowerCase().split(' ');
    const coveredTerms = queryTerms.filter(term => 
      content.toLowerCase().includes(term)
    );

    return {
      sectionCompleteness: presentSections.length / requiredSections.length,
      topicCoverage: coveredTerms.length / queryTerms.length,
      overallCompleteness: (presentSections.length / requiredSections.length + 
                           coveredTerms.length / queryTerms.length) / 2,
      missingSections: requiredSections.filter(section => 
        !content.toLowerCase().includes(section)
      )
    };
  }

  private extractFactualClaims(content: string): string[] {
    const claims: string[] = [];
    
    // Extract sentences with factual indicators
    const sentences = content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      if (sentence.includes('study found') || 
          sentence.includes('research shows') ||
          sentence.includes('data indicates') ||
          sentence.includes('according to') ||
          sentence.match(/\d+%|\$\d+|\d+,\d+/)) {
        claims.push(sentence.trim());
      }
    });
    
    return claims;
  }

  private async verifyClaimsAgainstSources(claims: string[], sources: any[]): Promise<any[]> {
    return claims.map(claim => {
      const supportingSources = sources.filter(source => 
        source.snippet.toLowerCase().includes(claim.toLowerCase().substring(0, 30))
      );

      return {
        claim: claim,
        verified: supportingSources.length > 0,
        supportingSources: supportingSources.length,
        confidence: supportingSources.length > 0 ? 
          Math.min(supportingSources.length * 0.3, 1.0) : 0
      };
    });
  }

  private calculateAccuracyScore(verifications: any[]): number {
    if (verifications.length === 0) return 0.5;
    
    const verifiedCount = verifications.filter(v => v.verified).length;
    return verifiedCount / verifications.length;
  }

  private extractCoherenceScore(assessment: string): number {
    // Simple extraction - in real implementation, use more sophisticated parsing
    const scoreMatch = assessment.match(/(\d+(?:\.\d+)?)/);
    if (scoreMatch) {
      const score = parseFloat(scoreMatch[1]);
      return score > 1 ? score / 10 : score; // Normalize if needed
    }
    return 0.7; // Default score
  }

  private identifyImprovements(original: string, enhanced: string): string[] {
    const improvements: string[] = [];
    
    if (enhanced.length > original.length * 1.1) {
      improvements.push('Expanded content for better clarity');
    }
    
    if ((enhanced.match(/\n/g) || []).length > (original.match(/\n/g) || []).length) {
      improvements.push('Improved paragraph structure');
    }
    
    if (enhanced.includes('Furthermore') || enhanced.includes('Additionally')) {
      improvements.push('Enhanced transitions between ideas');
    }
    
    return improvements;
  }
}