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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      id: 'quick',
      icon: Zap,
      label: 'Quick',
      description: 'Fast overview',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      id: 'compare',
      icon: Scale,
      label: 'Compare',
      description: 'Side-by-side analysis',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      id: 'timeline',
      icon: Calendar,
      label: 'Timeline',
      description: 'Historical progression',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      borderColor: 'border-orange-200'
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
            {activeCmd?.icon && <activeCmd.icon size={20} className={activeCmd.color} />}
            <span className={`font-semibold ${activeCmd?.color}`}>
              {activeCmd?.label} Research
            </span>
            <span className="text-sm text-gray-500">- {activeCmd?.description}</span>
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
                    ? `${activeCmd?.bgColor.replace('bg-', 'bg-').replace('-50', '-500')} hover:${activeCmd?.bgColor.replace('bg-', 'bg-').replace('-50', '-600')}`
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
    <div className="p-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-700">Quick Research:</span>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {commands.map((command) => {
          const Icon = command.icon;
          
          return (
            <button
              key={command.id}
              onClick={() => handleCommandClick(command)}
              disabled={disabled}
              className={`
                flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200 transform
                ${disabled 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' 
                  : `${command.bgColor} ${command.borderColor} ${command.hoverColor} hover:scale-105 active:scale-95`
                }
              `}
            >
              <Icon size={20} className={disabled ? 'text-gray-400' : command.color} />
              <span className={`text-xs font-medium ${disabled ? 'text-gray-400' : command.color}`}>
                {command.label}
              </span>
              <span className="text-xs text-gray-500 text-center leading-tight">
                {command.description}
              </span>
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