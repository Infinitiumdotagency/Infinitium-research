import React, { useState } from 'react';
import { Search, Zap, Scale, Calendar, Sparkles } from 'lucide-react';

interface ChatCommandBarProps {
  onCommandSelect: (command: string) => void;
  disabled?: boolean;
}

export const ChatCommandBar: React.FC<ChatCommandBarProps> = ({ 
  onCommandSelect, 
  disabled = false 
}) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);

  const commands = [
    {
      id: 'research',
      icon: Search,
      label: 'Research',
      description: 'Deep AI investigation',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      borderColor: 'border-blue-800'
    },
    {
      id: 'quick',
      icon: Zap,
      label: 'Quick',
      description: 'Fast overview',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      borderColor: 'border-blue-800'
    },
    {
      id: 'compare',
      icon: Scale,
      label: 'Compare',
      description: 'Side-by-side analysis',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      borderColor: 'border-blue-800'
    },
    {
      id: 'timeline',
      icon: Calendar,
      label: 'Timeline',
      description: 'Historical progression',
      bgColor: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      borderColor: 'border-blue-800'
    }
  ];

  const handleCommandClick = (command: any) => {
    if (disabled) return;
    
    setActiveCommand(command.id);
    setShowTopicInput(true);
  };

  const handleTopicSubmit = () => {
    if (selectedTopic.trim() && activeCommand) {
      const commandString = `/${activeCommand} ${selectedTopic.trim()}`;
      onCommandSelect(commandString);
      setSelectedTopic('');
      setShowTopicInput(false);
      setActiveCommand(null);
    }
  };

  const handleCancel = () => {
    setShowTopicInput(false);
    setActiveCommand(null);
    setSelectedTopic('');
  };

  const suggestions = [
    'artificial intelligence impact on jobs',
    'climate change solutions 2024',
    'quantum computing breakthroughs',
    'remote work productivity trends',
    'renewable energy adoption'
  ];

  if (showTopicInput) {
    const activeCmd = commands.find(cmd => cmd.id === activeCommand);
    
    return (
      <div className="p-3 bg-white border-t border-gray-200">
        <div className={`p-4 rounded-lg border-2 ${activeCmd?.borderColor} ${activeCmd?.bgColor}`}>
          <div className="flex items-center gap-2 mb-3">
            {activeCmd && <activeCmd.icon size={16} className="text-white" />}
            <span className={`text-[7px] font-medium ${disabled ? 'text-gray-400' : 'text-white'}`}>
              {activeCmd?.label} Research
            </span>
            <span className="text-xs text-white opacity-80">- {activeCmd?.description}</span>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              placeholder={`Enter topic for ${activeCmd?.label.toLowerCase()} research...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleTopicSubmit()}
            />
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles size={14} className="text-yellow-500" />
              <span>Quick suggestions:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTopic(suggestion)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleTopicSubmit}
                disabled={!selectedTopic.trim()}
                className={`flex-1 px-3 py-2 text-white rounded-lg transition-colors text-sm ${
                  selectedTopic.trim()
                    ? `${activeCmd?.bgColor} ${activeCmd?.hoverColor}`
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Start Research
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 gap-3">
        {commands.map((command) => {
          const Icon = command.icon;
          
          return (
            <button
              key={command.id}
              onClick={() => handleCommandClick(command)}
              disabled={disabled}
              className={`
                flex flex-col items-center gap-0.5 p-1 rounded border transition-all duration-200 transform
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' 
                  : `${command.bgColor} ${command.borderColor} ${command.hoverColor} hover:scale-105 active:scale-95 text-white`
                }
              `}
            >
            <div className="flex items-center gap-1">
              <Icon size={12} className={disabled ? 'text-gray-400' : 'text-white'} />
              <span className={`text-[7px] font-medium ${disabled ? 'text-gray-400' : 'text-white'}`}>
                {command.label}
              </span>
            </div>
            </button>
          );
        })}
      </div>
      
      {disabled && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">Research in progress...</span>
        </div>
      )}
    </div>
  );
};