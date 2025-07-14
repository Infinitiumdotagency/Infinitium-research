const SERPER_API_KEY = '9cf74ad7f9d914f694871fb12c8db818073d4b0f';
const SERPER_API_URL = 'https://google.serper.dev/search';

export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

export interface SerperResponse {
  organic: SerperResult[];
  answerBox?: {
    answer: string;
    title: string;
    link: string;
  };
  knowledgeGraph?: {
    title: string;
    description: string;
  };
}

export async function searchWeb(query: string): Promise<SerperResult[]> {
  try {
    const response = await fetch(SERPER_API_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 5, // Limit to top 5 results for better performance
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error! status: ${response.status}`);
    }

    const data: SerperResponse = await response.json();
    
    // Combine different types of results
    const results: SerperResult[] = [];
    
    // Add answer box if available
    if (data.answerBox) {
      results.push({
        title: data.answerBox.title,
        link: data.answerBox.link,
        snippet: data.answerBox.answer,
      });
    }
    
    // Add knowledge graph if available
    if (data.knowledgeGraph) {
      results.push({
        title: data.knowledgeGraph.title,
        link: '',
        snippet: data.knowledgeGraph.description,
      });
    }
    
    // Add organic results
    if (data.organic) {
      results.push(...data.organic.slice(0, 5));
    }
    
    return results;
  } catch (error) {
    console.error('Error searching web:', error);
    throw new Error('Failed to search the web. Please try again.');
  }
}