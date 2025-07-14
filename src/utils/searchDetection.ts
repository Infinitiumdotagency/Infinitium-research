// Keywords that indicate a need for current/recent information
const CURRENT_INFO_KEYWORDS = [
  'latest', 'recent', 'current', 'today', 'yesterday', 'this week', 'this month', 'this year',
  'now', 'currently', 'present', 'up to date', 'breaking', 'news', 'trending'
];

// Question patterns that often benefit from web search
const FACTUAL_PATTERNS = [
  'what is', 'what are', 'what was', 'what were',
  'who is', 'who are', 'who was', 'who were',
  'when is', 'when was', 'when did', 'when will',
  'where is', 'where are', 'where was', 'where were',
  'how to', 'how do', 'how does', 'how did',
  'why is', 'why are', 'why was', 'why did',
  'which is', 'which are', 'which was'
];

// Topics that often require current information
const DYNAMIC_TOPICS = [
  'stock', 'price', 'weather', 'score', 'election', 'covid', 'coronavirus',
  'market', 'economy', 'politics', 'sports', 'movie', 'celebrity', 'company',
  'technology', 'software', 'app', 'website', 'social media'
];

export function shouldSearchWeb(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Check for research commands
  if (lowerMessage.startsWith('/research ') || 
      lowerMessage.startsWith('/quick ') ||
      lowerMessage.startsWith('/compare ') ||
      lowerMessage.startsWith('/timeline ') ||
      lowerMessage.startsWith('/analyze ') ||
      lowerMessage.startsWith('/search ')) {
    return true;
  }
  
  // Check for current information keywords
  const hasCurrentKeywords = CURRENT_INFO_KEYWORDS.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Check for factual question patterns
  const hasFactualPattern = FACTUAL_PATTERNS.some(pattern => 
    lowerMessage.includes(pattern)
  );
  
  // Check for dynamic topics
  const hasDynamicTopic = DYNAMIC_TOPICS.some(topic => 
    lowerMessage.includes(topic)
  );
  
  // Search if it has current keywords OR (factual pattern AND dynamic topic)
  return hasCurrentKeywords || (hasFactualPattern && hasDynamicTopic);
}

export function extractSearchQuery(message: string): string {
  // Handle research commands
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.startsWith('/research ')) {
    return message.slice(10).trim();
  }
  if (lowerMessage.startsWith('/quick ')) {
    return message.slice(7).trim();
  }
  if (lowerMessage.startsWith('/compare ')) {
    return message.slice(9).trim();
  }
  if (lowerMessage.startsWith('/timeline ')) {
    return message.slice(10).trim();
  }
  if (lowerMessage.startsWith('/analyze ')) {
    return message.slice(9).trim();
  }
  if (lowerMessage.startsWith('/search ')) {
    return message.slice(8).trim();
  }
  
  // For other messages, use the full message as search query
  // Remove common conversational elements
  return message
    .replace(/^(can you|could you|please|tell me|what|how|when|where|who|why)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();
}