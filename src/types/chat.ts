export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  hasWebResults?: boolean;
  isResearchReport?: boolean;
  researchMode?: string;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isSearching: boolean;
  isResearching: boolean;
  researchProgress?: any;
  error: string | null;
}