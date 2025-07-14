import React from 'react';
import { ResearchSession } from '../types/research';
import { Search, Brain, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ResearchProgressProps {
  session: ResearchSession;
}

export const ResearchProgress: React.FC<ResearchProgressProps> = ({ session }) => {
  const getStageIcon = (stage: string, isActive: boolean, isCompleted: boolean) => {
    const iconProps = {
      size: 16,
      className: isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-400'
    };

    switch (stage) {
      case 'planning':
        return <Clock {...iconProps} />;
      case 'searching':
        return <Search {...iconProps} />;
      case 'analyzing':
        return <Brain {...iconProps} />;
      case 'synthesizing':
        return <FileText {...iconProps} />;
      case 'completed':
        return <CheckCircle {...iconProps} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={16} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const stages = [
    { key: 'planning', label: 'Planning Research' },
    { key: 'searching', label: 'Multi-Source Search' },
    { key: 'analyzing', label: 'Analyzing Sources' },
    { key: 'synthesizing', label: 'Synthesizing Findings' },
    { key: 'completed', label: 'Research Complete' }
  ];

  const progressPercentage = session.progress.totalSearches > 0 
    ? (session.progress.completedSearches / session.progress.totalSearches) * 100 
    : 0;

  return (
    <div className="flex items-start gap-3 p-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
        <Search size={16} className="animate-pulse" />
      </div>
      
      <div className="flex-1">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-blue-800">
              🔬 Deep Research in Progress
            </span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {session.mode.toUpperCase()}
            </span>
          </div>
          
          {/* Progress Bar */}
          {session.progress.totalSearches > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-blue-700 mb-1">
                <span>Search Progress</span>
                <span>{session.progress.completedSearches}/{session.progress.totalSearches}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Stage Progress */}
          <div className="space-y-2">
            {stages.map((stage, index) => {
              const isCompleted = session.progress.stagesCompleted.includes(stage.key as any);
              const isActive = session.progress.currentStage === stage.key;
              
              return (
                <div key={stage.key} className="flex items-center gap-2">
                  {getStageIcon(stage.key, isActive, isCompleted)}
                  <span className={`text-xs ${
                    isCompleted ? 'text-green-700 line-through' : 
                    isActive ? 'text-blue-700 font-medium' : 
                    'text-gray-500'
                  }`}>
                    {stage.label}
                    {isActive && <span className="ml-1 animate-pulse">...</span>}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Stats */}
          {session.progress.sourcesFound > 0 && (
            <div className="mt-3 pt-2 border-t border-blue-200">
              <div className="flex justify-between text-xs text-blue-600">
                <span>Sources Found: {session.progress.sourcesFound}</span>
                <span>Mode: {session.mode}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};