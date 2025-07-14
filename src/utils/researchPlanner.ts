import { ResearchMode } from '../types/research';

interface ResearchPlan {
  searchQueries: string[];
  researchAngles: string[];
  expectedSources: number;
  estimatedDuration: number;
}

// Keywords that indicate different research needs
const RESEARCH_INDICATORS = {
  factual: ['what is', 'define', 'explain', 'who is', 'when did', 'where is'],
  comparative: ['vs', 'versus', 'compare', 'difference between', 'better than'],
  temporal: ['history of', 'timeline', 'evolution', 'development', 'over time'],
  analytical: ['why', 'how', 'impact of', 'effects of', 'consequences'],
  current: ['latest', 'recent', 'current', 'today', 'now', 'breaking']
};

export function analyzeResearchNeeds(query: string): {
  suggestedMode: ResearchMode;
  researchType: string[];
  complexity: number;
} {
  const lowerQuery = query.toLowerCase();
  const detectedTypes: string[] = [];
  let complexity = 1;

  // Analyze query patterns
  Object.entries(RESEARCH_INDICATORS).forEach(([type, indicators]) => {
    if (indicators.some(indicator => lowerQuery.includes(indicator))) {
      detectedTypes.push(type);
      complexity += 0.5;
    }
  });

  // Determine suggested mode based on complexity and query length
  let suggestedMode: ResearchMode = 'quick';
  if (complexity > 2 || query.length > 100) {
    suggestedMode = 'standard';
  }
  if (complexity > 3 || query.split(' ').length > 15) {
    suggestedMode = 'deep';
  }
  if (detectedTypes.includes('comparative')) {
    suggestedMode = 'comparative';
  }
  if (detectedTypes.includes('temporal')) {
    suggestedMode = 'timeline';
  }

  return { suggestedMode, researchType: detectedTypes, complexity };
}

export function generateResearchPlan(query: string, mode: ResearchMode): ResearchPlan {
  const baseQuery = query.trim();
  const searchQueries: string[] = [baseQuery];
  const researchAngles: string[] = [];

  // Generate additional search queries based on mode
  switch (mode) {
    case 'quick':
      searchQueries.push(
        `${baseQuery} overview`,
        `${baseQuery} key facts`
      );
      researchAngles.push('Basic facts', 'Overview');
      break;

    case 'standard':
      searchQueries.push(
        `${baseQuery} overview`,
        `${baseQuery} latest news`,
        `${baseQuery} expert analysis`,
        `${baseQuery} statistics data`,
        `${baseQuery} recent developments`
      );
      researchAngles.push('Overview', 'Current news', 'Expert opinions', 'Data & statistics');
      break;

    case 'deep':
      searchQueries.push(
        `${baseQuery} comprehensive analysis`,
        `${baseQuery} latest research`,
        `${baseQuery} expert opinions`,
        `${baseQuery} case studies`,
        `${baseQuery} statistics trends`,
        `${baseQuery} future implications`,
        `${baseQuery} challenges problems`,
        `${baseQuery} solutions approaches`,
        `${baseQuery} industry impact`
      );
      researchAngles.push(
        'Comprehensive analysis', 'Latest research', 'Expert opinions', 
        'Case studies', 'Statistics & trends', 'Future implications',
        'Challenges & problems', 'Solutions & approaches'
      );
      break;

    case 'comparative':
      const parts = baseQuery.split(/\s+(?:vs|versus|compared to)\s+/i);
      if (parts.length >= 2) {
        const [item1, item2] = parts;
        searchQueries.push(
          `${item1} advantages benefits`,
          `${item2} advantages benefits`,
          `${item1} disadvantages problems`,
          `${item2} disadvantages problems`,
          `${item1} vs ${item2} comparison`,
          `${item1} vs ${item2} expert opinion`
        );
        researchAngles.push(`${item1} benefits`, `${item2} benefits`, 'Direct comparison', 'Expert analysis');
      }
      break;

    case 'timeline':
      searchQueries.push(
        `${baseQuery} history timeline`,
        `${baseQuery} early development`,
        `${baseQuery} major milestones`,
        `${baseQuery} recent changes`,
        `${baseQuery} future predictions`
      );
      researchAngles.push('Historical development', 'Major milestones', 'Recent changes', 'Future outlook');
      break;
  }

  // Add contextual searches
  searchQueries.push(
    `${baseQuery} "recent study"`,
    `${baseQuery} "according to experts"`
  );

  return {
    searchQueries: [...new Set(searchQueries)], // Remove duplicates
    researchAngles,
    expectedSources: searchQueries.length * 3,
    estimatedDuration: searchQueries.length * 2000 // 2 seconds per search
  };
}