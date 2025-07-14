import { ResearchMode } from '../types/research';

export interface ResearchCommand {
  isResearchCommand: boolean;
  mode: ResearchMode;
  query: string;
  originalMessage: string;
}

export function parseResearchCommand(message: string): ResearchCommand {
  const lowerMessage = message.toLowerCase().trim();
  
  // Check for research commands
  if (lowerMessage.startsWith('/research ')) {
    return {
      isResearchCommand: true,
      mode: 'deep',
      query: message.slice(10).trim(),
      originalMessage: message
    };
  }
  
  if (lowerMessage.startsWith('/quick ')) {
    return {
      isResearchCommand: true,
      mode: 'quick',
      query: message.slice(7).trim(),
      originalMessage: message
    };
  }
  
  if (lowerMessage.startsWith('/compare ')) {
    return {
      isResearchCommand: true,
      mode: 'comparative',
      query: message.slice(9).trim(),
      originalMessage: message
    };
  }
  
  if (lowerMessage.startsWith('/timeline ')) {
    return {
      isResearchCommand: true,
      mode: 'timeline',
      query: message.slice(10).trim(),
      originalMessage: message
    };
  }
  
  if (lowerMessage.startsWith('/analyze ')) {
    return {
      isResearchCommand: true,
      mode: 'standard',
      query: message.slice(9).trim(),
      originalMessage: message
    };
  }
  
  // Not a research command
  return {
    isResearchCommand: false,
    mode: 'quick',
    query: message,
    originalMessage: message
  };
}