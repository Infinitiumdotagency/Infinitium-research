import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { sendMessageToGroq } from '../services/groq';
import { searchWeb } from '../services/serper';
import { shouldSearchWeb, extractSearchQuery } from '../utils/searchDetection';
import { parseResearchCommand } from '../utils/commandDetection';
import { researchEngine } from '../services/researchEngine';
import { agentResearchEngine } from '../services/agentResearchEngine';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { SearchIndicator } from './SearchIndicator';
import { ResearchProgress } from './ResearchProgress';
import { ChatCommandBar } from './ChatCommandBar';
import { AgentProgress } from './AgentProgress';
import { AnimatedProgressTracker } from './AnimatedProgressTracker';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { ProgressStage } from '../types/research';

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [currentResearchSession, setCurrentResearchSession] = useState<any>(null);
  const [isAgentResearching, setIsAgentResearching] = useState(false);
  const [agentProgress, setAgentProgress] = useState<any>(null);
  const [showCommands, setShowCommands] = useState(true);
  const [activeResearchCommand, setActiveResearchCommand] = useState<string | null>(null);
  const [researchStages, setResearchStages] = useState<ProgressStage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isSearching]);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: '1',
      content: "Hello! I'm your AI assistant with advanced research capabilities. I can conduct deep research, web searches, and provide comprehensive analysis.\n\nHow can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    
    // Set up research progress callback
    researchEngine.setProgressCallback((sessionId, session) => {
      setCurrentResearchSession(session);
    });
    
    // Set up agent research callback
    agentResearchEngine.setMessageCallback((message, type) => {
      console.log('📨 Received message from agent engine:', { type, messageLength: message.length });
      
      if (type === 'progress') {
        const stage = extractStageFromMessage(message);
        setAgentProgress({ message, stage });
        updateResearchStages(stage, 'active');
      } else if (type === 'report' || type === 'final') {
        console.log('✅ Adding research message to chat');
        const newMessage: Message = {
          id: Date.now().toString(),
          content: message,
          role: 'assistant',
          timestamp: new Date(),
          isResearchReport: true,
          researchMode: 'agent-driven',
        };
        setMessages(prev => [...prev, newMessage]);
        
        if (type === 'final') {
          updateResearchStages('completed', 'completed');
          setActiveResearchCommand(null);
        }
      }
    });
  }, []);

  const extractStageFromMessage = (message: string): string => {
    if (message.includes('Planning')) return 'planning';
    if (message.includes('Searching') || message.includes('search')) return 'searching';
    if (message.includes('Analyzing') || message.includes('analysis')) return 'analyzing';
    if (message.includes('Writing') || message.includes('Generating')) return 'writing';
    if (message.includes('Reviewing') || message.includes('quality')) return 'reviewing';
    return 'processing';
  };

  const initializeResearchStages = () => {
    const stages: ProgressStage[] = [
      {
        id: 'planning',
        label: 'Planning',
        icon: ({ size, className }) => <div className={`w-${size || 4} h-${size || 4} ${className}`}>🎯</div>,
        status: 'pending'
      },
      {
        id: 'searching',
        label: 'Searching',
        icon: ({ size, className }) => <div className={`w-${size || 4} h-${size || 4} ${className}`}>🔍</div>,
        status: 'pending'
      },
      {
        id: 'analyzing',
        label: 'Analyzing',
        icon: ({ size, className }) => <div className={`w-${size || 4} h-${size || 4} ${className}`}>🧠</div>,
        status: 'pending'
      },
      {
        id: 'writing',
        label: 'Writing',
        icon: ({ size, className }) => <div className={`w-${size || 4} h-${size || 4} ${className}`}>✍️</div>,
        status: 'pending'
      },
      {
        id: 'reviewing',
        label: 'Reviewing',
        icon: ({ size, className }) => <div className={`w-${size || 4} h-${size || 4} ${className}`}>✅</div>,
        status: 'pending'
      }
    ];
    setResearchStages(stages);
  };

  const updateResearchStages = (currentStage: string, status: 'active' | 'completed' | 'failed') => {
    setResearchStages(prev => {
      const updated = prev.map(stage => {
        if (stage.id === currentStage) {
          return {
            ...stage,
            status,
            startTime: status === 'active' ? new Date() : stage.startTime,
            completionTime: status === 'completed' ? new Date() : undefined
          };
        }
        // Mark previous stages as completed if current stage is active
        const stageOrder = ['planning', 'searching', 'analyzing', 'writing', 'reviewing'];
        const currentIndex = stageOrder.indexOf(currentStage);
        const stageIndex = stageOrder.indexOf(stage.id);
        
        if (status === 'active' && stageIndex < currentIndex && stage.status !== 'completed') {
          return { ...stage, status: 'completed', completionTime: new Date() };
        }
        
        return stage;
      });
      
      // If all stages completed, mark the final completion
      if (status === 'completed' && currentStage === 'reviewing') {
        return updated.map(stage => ({ ...stage, status: 'completed' as const }));
      }
      
      return updated;
    });
  };

  const handleSendMessage = async (content: string) => {
    setError(null);
    setShowCommands(false);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Parse for research commands
    const researchCommand = parseResearchCommand(content);
    
    // Check if this should use agent-driven research (deep mode)
    if (researchCommand.isResearchCommand && researchCommand.mode === 'deep') {
      // Use AI Agent Research System
      setActiveResearchCommand('research');
      initializeResearchStages();
      setIsAgentResearching(true);
      setAgentProgress({ message: 'Initializing AI research agents...', stage: 'planning' });
      updateResearchStages('planning', 'active');
      
      console.log('🤖 Starting agent research for:', researchCommand.query);
      
      try {
        await agentResearchEngine.conductResearch(
          researchCommand.query, 
          researchCommand.mode
        );
        
        console.log('✅ Agent research completed successfully');
        // Messages are handled by the callback
      } catch (err) {
        console.error('💥 Agent research error:', err);
        setError(err instanceof Error ? err.message : 'Agent research failed');
        
        // Add error message to chat
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `I encountered some difficulties during the research process: ${err instanceof Error ? err.message : 'Unknown error'}. Please try a simpler query or use /quick for basic research.`,
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAgentResearching(false);
        setAgentProgress(null);
        setActiveResearchCommand(null);
      }
    } else if (researchCommand.isResearchCommand) {
      // Handle research command
      setIsResearching(true);
      try {
        const report = await researchEngine.startResearch(
          researchCommand.query, 
          researchCommand.mode
        );
        
        const researchMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: report,
          role: 'assistant',
          timestamp: new Date(),
          isResearchReport: true,
          researchMode: researchCommand.mode,
        };

        setMessages(prev => [...prev, researchMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Research failed');
      } finally {
        setIsResearching(false);
        setCurrentResearchSession(null);
      }
    } else {
      // Handle regular chat or web search
      const needsWebSearch = shouldSearchWeb(content);
      let searchResults = null;
      
      if (needsWebSearch) {
        setIsSearching(true);
        try {
          const searchQuery = extractSearchQuery(content);
          searchResults = await searchWeb(searchQuery);
        } catch (searchError) {
          console.error('Search failed:', searchError);
          // Continue without search results
        } finally {
          setIsSearching(false);
        }
      }
      
      setIsTyping(true);

      try {
        const groqMessages = messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
        
        groqMessages.push({
          role: 'user',
          content,
        });

        const response = await sendMessageToGroq(groqMessages, searchResults || undefined);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
          hasWebResults: searchResults && searchResults.length > 0,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleResearchStart = (commandString: string, mode: string) => {
    handleSendMessage(commandString);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 sm:p-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-xl sm:text-2xl font-bold">∞</div>
          <h1 className="text-lg sm:text-xl font-bold">Infinitium Research</h1>
        </div>
      </div>
      
      {/* Animated Progress Tracker */}
      {(isAgentResearching || activeResearchCommand) && researchStages.length > 0 && (
        <div className="p-3 sm:p-4 bg-white flex-shrink-0">
          <AnimatedProgressTracker
            stages={researchStages}
            title="AI Agent Research Progress"
            subtitle={`Conducting ${activeResearchCommand || 'deep'} research with multiple AI agents`}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-behavior-contain">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isResearching && currentResearchSession && (
          <ResearchProgress session={currentResearchSession} />
        )}
        {isAgentResearching && agentProgress && (
          <AgentProgress 
            stage={agentProgress.stage} 
            message={agentProgress.message}
            agentsActive={['SearchAgent', 'AnalysisAgent', 'WritingAgent']}
          />
        )}
        {isSearching && <SearchIndicator />}
        {isTyping && <TypingIndicator />}
        
        {error && (
          <div className="p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="text-red-500" size={16} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        disabled={isTyping || isSearching || isResearching || isAgentResearching} 
      />
      
      {/* Research Command Bar */}
      <ChatCommandBar
        onCommandSelect={handleSendMessage}
        disabled={isTyping || isSearching || isResearching || isAgentResearching}
      />
    </div>
  );
};