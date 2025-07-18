import React from 'react';
import { Message } from '../types/chat';
import { User, Bot, Globe, Search } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500 text-white' : 
        message.isResearchReport ? 'bg-purple-100 text-purple-600' :
        message.hasWebResults ? 'bg-blue-600 text-white' : 
        'bg-blue-600 text-white'
      }`}>
        {isUser ? <User size={16} /> : 
         message.isResearchReport ? <Search size={16} /> :
         message.hasWebResults ? <span className="text-sm font-bold">∞</span> : 
         <span className="text-sm font-bold">∞</span>}
      </div>
      
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[85%] sm:max-w-md lg:max-w-2xl xl:max-w-4xl rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
          isUser 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : message.isResearchReport 
              ? 'bg-purple-50 text-gray-800 rounded-bl-md border border-purple-200'
              : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}>
          {message.isResearchReport ? (
            <div className="prose prose-sm sm:prose max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: message.content
                  .replace(/^# /gm, '<h1 class="text-lg font-bold mb-2">')
                  .replace(/^## /gm, '<h2 class="text-md font-semibold mb-2 mt-4">')
                  .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
                  .replace(/^\* /gm, '• ')
                  .replace(/\n/g, '<br>')
              }} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</p>
          )}
        </div>
        
        {message.isResearchReport && !isUser && (
          <div className={`mt-1 text-xs text-purple-600 ${isUser ? 'text-right' : ''}`}>
            🔬 Deep Research Report • Mode: {message.researchMode?.toUpperCase()}
          </div>
        )}
        
        {message.hasWebResults && !isUser && (
          <div className={`mt-1 text-xs text-green-600 ${isUser ? 'text-right' : ''}`}>
            ✓ Enhanced with web search results
          </div>
        )}
        
        <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};