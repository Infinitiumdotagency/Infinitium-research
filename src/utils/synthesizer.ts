import { ResearchSource, ResearchFinding } from '../types/research';

export interface SynthesisResult {
  executiveSummary: string;
  keyFindings: string[];
  sourcesSummary: string;
  confidenceLevel: number;
  gaps: string[];
  recommendations: string[];
}

export function synthesizeResearch(
  sources: ResearchSource[],
  originalQuery: string
): SynthesisResult {
  // Group sources by topic/theme
  const topSources = sources
    .filter(source => source.credibilityScore > 0.6)
    .slice(0, 15); // Focus on top 15 most credible sources
  
  // Calculate overall confidence based on source quality and quantity
  const avgCredibility = topSources.reduce((sum, source) => sum + source.credibilityScore, 0) / topSources.length;
  const sourceCount = topSources.length;
  const confidenceLevel = Math.min(avgCredibility * (sourceCount / 10), 1.0);
  
  // Extract key themes and findings
  const keyFindings = extractKeyFindings(topSources);
  const gaps = identifyKnowledgeGaps(topSources, originalQuery);
  const recommendations = generateRecommendations(topSources, gaps);
  
  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(topSources, originalQuery, keyFindings);
  
  // Create sources summary
  const sourcesSummary = generateSourcesSummary(topSources);
  
  return {
    executiveSummary,
    keyFindings,
    sourcesSummary,
    confidenceLevel,
    gaps,
    recommendations
  };
}

function extractKeyFindings(sources: ResearchSource[]): string[] {
  const findings: string[] = [];
  const themes = new Map<string, number>();
  
  // Analyze snippets for common themes and important information
  sources.forEach(source => {
    const snippet = source.snippet.toLowerCase();
    
    // Look for key indicators of important information
    if (snippet.includes('study found') || snippet.includes('research shows')) {
      findings.push(`Research indicates: ${source.snippet.split('.')[0]}.`);
    }
    
    if (snippet.includes('according to') || snippet.includes('experts say')) {
      findings.push(`Expert opinion: ${source.snippet.split('.')[0]}.`);
    }
    
    if (snippet.includes('data shows') || snippet.includes('statistics')) {
      findings.push(`Data insight: ${source.snippet.split('.')[0]}.`);
    }
    
    // Extract numerical data
    const numbers = snippet.match(/\d+(?:\.\d+)?%|\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*/g);
    if (numbers && numbers.length > 0) {
      findings.push(`Key metric from ${source.domain}: ${source.snippet.split('.')[0]}.`);
    }
  });
  
  // Remove duplicates and return top findings
  return [...new Set(findings)].slice(0, 8);
}

function identifyKnowledgeGaps(sources: ResearchSource[], originalQuery: string): string[] {
  const gaps: string[] = [];
  
  // Check for missing source types
  const sourceTypes = new Set(sources.map(s => s.sourceType));
  if (!sourceTypes.has('academic')) {
    gaps.push('Limited academic research sources found');
  }
  if (!sourceTypes.has('government')) {
    gaps.push('No official government sources identified');
  }
  
  // Check for temporal gaps
  const recentSources = sources.filter(s => {
    if (!s.publishDate) return false;
    const date = new Date(s.publishDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return date > sixMonthsAgo;
  });
  
  if (recentSources.length < sources.length * 0.3) {
    gaps.push('Limited recent information (last 6 months)');
  }
  
  // Check for credibility gaps
  const highCredibilitySources = sources.filter(s => s.credibilityScore > 0.8);
  if (highCredibilitySources.length < 3) {
    gaps.push('Few high-credibility sources available');
  }
  
  return gaps;
}

function generateRecommendations(sources: ResearchSource[], gaps: string[]): string[] {
  const recommendations: string[] = [];
  
  if (gaps.includes('Limited academic research sources found')) {
    recommendations.push('Consider searching academic databases like Google Scholar or PubMed for peer-reviewed research');
  }
  
  if (gaps.includes('No official government sources identified')) {
    recommendations.push('Look for official government reports or statistics from relevant agencies');
  }
  
  if (gaps.includes('Limited recent information (last 6 months)')) {
    recommendations.push('Search for more recent news articles or press releases for latest developments');
  }
  
  // Always include general recommendations
  recommendations.push('Cross-reference findings with additional independent sources');
  recommendations.push('Consider the potential bias and perspective of each source');
  
  return recommendations;
}

function generateExecutiveSummary(
  sources: ResearchSource[],
  originalQuery: string,
  keyFindings: string[]
): string {
  const sourceCount = sources.length;
  const avgCredibility = sources.reduce((sum, source) => sum + source.credibilityScore, 0) / sources.length;
  const topDomains = [...new Set(sources.slice(0, 5).map(s => s.domain))];
  
  let summary = `Based on comprehensive research across ${sourceCount} sources with an average credibility score of ${(avgCredibility * 100).toFixed(0)}%, `;
  
  if (keyFindings.length > 0) {
    summary += `here are the key insights regarding "${originalQuery}":\n\n`;
    summary += keyFindings.slice(0, 3).join('\n\n');
  } else {
    summary += `the research provides various perspectives on "${originalQuery}". `;
  }
  
  summary += `\n\nThis analysis draws from reputable sources including ${topDomains.slice(0, 3).join(', ')}`;
  if (topDomains.length > 3) {
    summary += ` and ${topDomains.length - 3} other sources`;
  }
  summary += '.';
  
  return summary;
}

function generateSourcesSummary(sources: ResearchSource[]): string {
  const sourceTypes = sources.reduce((acc, source) => {
    acc[source.sourceType] = (acc[source.sourceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const typeDescriptions = Object.entries(sourceTypes)
    .map(([type, count]) => `${count} ${type}`)
    .join(', ');
  
  const avgCredibility = sources.reduce((sum, source) => sum + source.credibilityScore, 0) / sources.length;
  
  return `Research compiled from ${sources.length} sources (${typeDescriptions}) with average credibility score of ${(avgCredibility * 100).toFixed(0)}%.`;
}