const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
import { SerperResult } from './serper';

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessageToGroq(
  messages: GroqMessage[], 
  searchResults?: SerperResult[],
  maxTokens: number = 1500,
  retries: number = 3
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await attemptGroqRequest(messages, searchResults, maxTokens);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Groq API attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

async function attemptGroqRequest(
  messages: GroqMessage[], 
  searchResults?: SerperResult[],
  maxTokens: number = 1500
): Promise<string> {
  console.log('🤖 Groq API Request:', { 
    messagesCount: messages.length, 
    hasSearchResults: !!searchResults?.length,
    maxTokens 
  });
  
  try {
    // Prepare system message with search context if available
    let systemMessage = 'You are a helpful, friendly, and knowledgeable AI assistant. Provide clear, concise, and helpful responses.';
    
    if (searchResults && searchResults.length > 0) {
      const searchContext = searchResults
        .map((result, index) => 
          `[${index + 1}] ${result.title}\n${result.snippet}\nSource: ${result.link || 'N/A'}`
        )
        .join('\n\n');
      
      systemMessage += `\n\nI have searched the web and found the following current information that may be relevant to the user's question:\n\n${searchContext}\n\nPlease use this information to provide an accurate, up-to-date response. When referencing web information, mention that it's from recent web search results. Include relevant source links when helpful.`;
    }
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          ...messages
        ],
        max_tokens: maxTokens, // Configurable for longer responses
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Groq API');
    }
    
    const content = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    console.log('✅ Groq API Response received:', { length: content.length });
    
    return content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get response from AI. Please try again.');
  }
}