import { ResearchCoordinator } from '../agents/ResearchCoordinator';
import { ResearchMode } from '../types/research';

export class AgentResearchEngine {
  private coordinator: ResearchCoordinator;
  private onMessageUpdate?: (message: string, type: 'progress' | 'report' | 'final') => void;

  constructor() {
    this.coordinator = new ResearchCoordinator();
    this.setupProgressTracking();
  }

  setMessageCallback(callback: (message: string, type: 'progress' | 'report' | 'final') => void) {
    this.onMessageUpdate = callback;
  }

  async conductResearch(query: string, mode: ResearchMode = 'deep'): Promise<string[]> {
    if (!query || query.trim().length === 0) {
      throw new Error('Research query cannot be empty');
    }
    
    console.log('🚀 AgentResearchEngine: Starting research', { query, mode });
    
    const context = {
      sessionId: `agent_research_${Date.now()}`,
      originalQuery: query,
      currentStage: 'planning',
      findings: [],
      sources: [],
      gaps: [],
      nextActions: [],
      userPreferences: {
        depth: mode,
        focus: [],
        excludeTopics: []
      }
    };

    const task = {
      id: `research_${Date.now()}`,
      type: 'conduct-research',
      priority: 1,
      payload: { query, mode }
    };

    try {
      console.log('Starting agent research for:', query);
      const result = await this.coordinator.execute(task, context);
      
      console.log('🎯 Coordinator execution result:', { 
        success: result.success, 
        hasData: !!result.data,
        messagesCount: result.data?.messages?.length,
        errors: result.errors 
      });
      
      if (result.success) {
        console.log('Agent research completed successfully');
        
        // Send each message through the callback
        if (result.data.messages && Array.isArray(result.data.messages)) {
          console.log('📨 Processing messages through callback:', result.data.messages.length);
          
          for (let i = 0; i < result.data.messages.length; i++) {
            const message = result.data.messages[i];
            const messageType = i === result.data.messages.length - 1 ? 'final' : 'report';
            
            console.log(`📤 Sending message ${i + 1}/${result.data.messages.length}:`, { 
              type: messageType, 
              length: message.length 
            });
            
            if (this.onMessageUpdate) {
              this.onMessageUpdate(message, messageType);
            }
            
            // Add delay between messages for better UX
            if (i < result.data.messages.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        } else {
          console.warn('⚠️ No messages found in result data');
        }
        
        return result.data.messages;
      } else {
        console.error('Agent research failed:', result.errors);
        throw new Error(result.errors?.join(', ') || 'Research failed');
      }
    } catch (error) {
      console.error('Agent research failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('API rate limit reached. Please wait a moment and try again.');
        } else if (error.message.includes('network')) {
          throw new Error('Network connection issue. Please check your internet and try again.');
        } else {
          throw new Error(`Research failed: ${error.message}`);
        }
      }
      
      throw new Error('An unexpected error occurred during research. Please try again.');
    }
  }

  private setupProgressTracking() {
    this.coordinator.setProgressCallback((update) => {
      if (this.onMessageUpdate) {
        this.onMessageUpdate(update.message, 'progress');
      }
    });
  }
}

// Singleton instance
export const agentResearchEngine = new AgentResearchEngine();