import React, { useState } from 'react';
import { ResearchCommand } from '../types/research';
import { CommandButton } from './CommandButton';
import { ResearchTopicModal } from './ResearchTopicModal';
import { Search, Zap, Scale, Calendar } from 'lucide-react';

interface ResearchCommandButtonsProps {
  onResearchStart: (command: string, mode: string) => void;
  isResearching?: boolean;
  activeCommand?: string;
}

export const ResearchCommandButtons: React.FC<ResearchCommandButtonsProps> = ({
  onResearchStart,
  isResearching = false,
  activeCommand
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<ResearchCommand | null>(null);

  const commands: ResearchCommand[] = [
    {
      id: 'research',
      label: 'AI Agent Research',
      icon: Search,
      description: 'Multi-agent comprehensive investigation with progressive updates',
      mode: 'deep',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      hoverColor: 'hover:bg-blue-200',
      example: 'artificial intelligence impact on jobs'
    },
    {
      id: 'quick',
      label: 'Quick Research',
      icon: Zap,
      description: 'Fast overview with key facts and current information',
      mode: 'quick',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:bg-green-200',
      example: 'latest iPhone features'
    },
    {
      id: 'compare',
      label: 'Comparative Analysis',
      icon: Scale,
      description: 'Side-by-side comparison with pros, cons, and recommendations',
      mode: 'comparative',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      hoverColor: 'hover:bg-purple-200',
      example: 'Tesla vs Toyota electric vehicles'
    },
    {
      id: 'timeline',
      label: 'Timeline Research',
      icon: Calendar,
      description: 'Historical progression, milestones, and future predictions',
      mode: 'timeline',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      hoverColor: 'hover:bg-orange-200',
      example: 'evolution of social media platforms'
    }
  ];

  const handleCommandClick = (command: ResearchCommand) => {
    if (isResearching) return;
    
    setSelectedCommand(command);
    setIsModalOpen(true);
  };

  const handleTopicSubmit = (topic: string) => {
    if (selectedCommand) {
      const commandString = `/${selectedCommand.id} ${topic}`;
      onResearchStart(commandString, selectedCommand.mode);
    }
  };

  return (
    <>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🔬 AI Research Assistant
            </h2>
            <p className="text-gray-600">
              Choose your research approach and let our AI agents conduct comprehensive analysis
            </p>
          </div>

          {/* Command Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {commands.map((command) => (
              <CommandButton
                key={command.id}
                command={command}
                onClick={handleCommandClick}
                disabled={isResearching}
                isActive={activeCommand === command.id}
              />
            ))}
          </div>

          {/* Research Status */}
          {isResearching && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Research in progress...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Topic Input Modal */}
      <ResearchTopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTopicSubmit}
        command={selectedCommand}
      />
    </>
  );
};