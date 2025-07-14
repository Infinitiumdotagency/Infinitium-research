import { SerperResult, searchWeb } from './serper';
import { ResearchSource } from '../types/research';

export interface SearchStrategy {
  query: string;
  type: 'broad' | 'specific' | 'temporal' | 'academic' | 'news';
  priority: number;
}

// Domain credibility scoring
const DOMAIN_SCORES: Record<string, number> = {
  // High credibility
  'gov': 0.95, 'edu': 0.9, 'org': 0.8,
  // News sources
  'reuters.com': 0.9, 'bbc.com': 0.9, 'npr.org': 0.85,
  'apnews.com': 0.9, 'wsj.com': 0.85, 'nytimes.com': 0.8,
  // Academic/Research
  'nature.com': 0.95, 'science.org': 0.95, 'pubmed.ncbi.nlm.nih.gov': 0.9,
  // Tech sources
  'techcrunch.com': 0.7, 'wired.com': 0.75, 'arstechnica.com': 0.8,
  // Default scores
  'wikipedia.org': 0.7, 'medium.com': 0.6
};

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function getSourceType(domain: string): ResearchSource['sourceType'] {
  if (domain.endsWith('.gov')) return 'government';
  if (domain.endsWith('.edu') || domain.includes('research') || domain.includes('academic')) return 'academic';
  if (domain.includes('news') || ['reuters.com', 'bbc.com', 'cnn.com', 'npr.org'].includes(domain)) return 'news';
  return 'commercial';
}

function calculateCredibilityScore(result: SerperResult): number {
  const domain = getDomainFromUrl(result.link);
  let score = DOMAIN_SCORES[domain] || 0.5;
  
  // Adjust based on content quality indicators
  if (result.snippet.includes('study') || result.snippet.includes('research')) score += 0.1;
  if (result.snippet.includes('expert') || result.snippet.includes('professor')) score += 0.1;
  if (result.snippet.includes('according to') || result.snippet.includes('data shows')) score += 0.05;
  if (result.date) score += 0.05; // Recent content bonus
  
  return Math.min(score, 1.0);
}

export async function performAdvancedSearch(
  strategies: SearchStrategy[]
): Promise<ResearchSource[]> {
  const allSources: ResearchSource[] = [];
  
  // Sort strategies by priority
  const sortedStrategies = strategies.sort((a, b) => b.priority - a.priority);
  
  for (const strategy of sortedStrategies) {
    try {
      console.log(`Searching: ${strategy.query} (${strategy.type})`);
      const results = await searchWeb(strategy.query);
      
      const sources: ResearchSource[] = results.map((result, index) => {
        const domain = getDomainFromUrl(result.link);
        return {
          id: `${Date.now()}-${index}`,
          title: result.title,
          url: result.link,
          snippet: result.snippet,
          credibilityScore: calculateCredibilityScore(result),
          sourceType: getSourceType(domain),
          publishDate: result.date,
          domain
        };
      });
      
      allSources.push(...sources);
      
      // Add delay between searches to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Search failed for: ${strategy.query}`, error);
    }
  }
  
  // Remove duplicates and sort by credibility
  const uniqueSources = allSources.filter((source, index, self) => 
    index === self.findIndex(s => s.url === source.url)
  );
  
  return uniqueSources.sort((a, b) => b.credibilityScore - a.credibilityScore);
}

export function generateSearchStrategies(
  baseQuery: string,
  searchQueries: string[]
): SearchStrategy[] {
  const strategies: SearchStrategy[] = [];
  
  searchQueries.forEach((query, index) => {
    // Determine search type based on query content
    let type: SearchStrategy['type'] = 'broad';
    let priority = 1;
    
    if (query.includes('latest') || query.includes('recent') || query.includes('news')) {
      type = 'news';
      priority = 0.9;
    } else if (query.includes('study') || query.includes('research') || query.includes('academic')) {
      type = 'academic';
      priority = 0.95;
    } else if (query.includes('timeline') || query.includes('history')) {
      type = 'temporal';
      priority = 0.8;
    } else if (query.includes('specific') || query.includes('detailed')) {
      type = 'specific';
      priority = 0.85;
    }
    
    // First few queries get higher priority
    if (index < 3) priority += 0.1;
    
    strategies.push({
      query,
      type,
      priority
    });
  });
  
  return strategies;
}