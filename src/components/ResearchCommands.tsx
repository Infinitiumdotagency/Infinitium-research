import React from 'react';
import { Search, Zap, BarChart3, Scale, Calendar, HelpCircle } from 'lucide-react';

interface ResearchCommandsProps {
  onCommandSelect: (command: string) => void;
}

export const ResearchCommands: React.FC<ResearchCommandsProps> = ({ onCommandSelect }) => {
  const commands = [
    {
      command: '/research',
      icon: <Search size={16} />,
      title: 'AI Agent Research',
      description: 'Multi-agent comprehensive investigation with progressive updates',
      example: '/research artificial intelligence impact on jobs'
    },
    {
      command: '/quick',
      icon: <Zap size={16} />,
      title: 'Quick Research',
      description: 'Fast overview with key facts',
      example: '/quick latest iPhone features'
    },
    {
      command: '/compare',
      icon: <Scale size={16} />,
      title: 'Comparative Analysis',
      description: 'Side-by-side comparison of topics',
      example: '/compare Tesla vs Toyota electric vehicles'
    },
    {
      command: '/timeline',
      icon: <Calendar size={16} />,
      title: 'Timeline Research',
      description: 'Historical progression and development',
      example: '/timeline evolution of social media'
    },
    {
      command: '/analyze',
      icon: <BarChart3 size={16} />,
      title: 'Data Analysis',
      description: 'Statistical and trend analysis',
      example: '/analyze cryptocurrency market trends 2024'
    }
  ];

  return (
    <div className="p-4 bg-gray-50 border-t">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Research Commands</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {commands.map((cmd) => (
          <button
            key={cmd.command}
            onClick={() => onCommandSelect(cmd.example)}
            className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600 group-hover:text-blue-700">{cmd.icon}</span>
              <span className="text-sm font-medium text-gray-800">{cmd.command}</span>
            </div>
            <p className="text-xs text-gray-600 mb-1">{cmd.description}</p>
            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {cmd.example}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};