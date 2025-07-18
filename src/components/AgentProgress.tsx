import React from 'react';
import { Brain, Search, FileText, CheckCircle, Cog, Users } from 'lucide-react';

interface AgentProgressProps {
  stage: string;
  message: string;
  agentsActive: string[];
}

export const AgentProgress: React.FC<AgentProgressProps> = ({ 
  stage, 
  message, 
  agentsActive = [] 
}) => {
  const getStageIcon = (currentStage: string) => {
    switch (currentStage) {
      case 'planning':
        return <Cog size={16} className="text-purple-600 animate-spin" />;
      case 'searching':
        return <Search size={16} className="text-blue-600 animate-pulse" />;
      case 'analyzing':
        return <Brain size={16} className="text-green-600 animate-pulse" />;
      case 'synthesizing':
        return <FileText size={16} className="text-orange-600 animate-pulse" />;
      case 'writing':
        return <FileText size={16} className="text-indigo-600 animate-pulse" />;
      case 'reviewing':
        return <CheckCircle size={16} className="text-teal-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Cog size={16} className="text-gray-600" />;
    }
  };

  const getStageStyles = (currentStage: string) => {
    switch (currentStage) {
      case 'planning':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          border: 'border-purple-200',
          bgCard: 'bg-purple-50',
          textCard: 'text-purple-700',
          textTitle: 'text-purple-800',
          bgBadge: 'bg-purple-100',
          textBadge: 'text-purple-600'
        };
      case 'searching':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          border: 'border-blue-200',
          bgCard: 'bg-blue-50',
          textCard: 'text-blue-700',
          textTitle: 'text-blue-800',
          bgBadge: 'bg-blue-100',
          textBadge: 'text-blue-600'
        };
      case 'analyzing':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200',
          bgCard: 'bg-green-50',
          textCard: 'text-green-700',
          textTitle: 'text-green-800',
          bgBadge: 'bg-green-100',
          textBadge: 'text-green-600'
        };
      case 'synthesizing':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-600',
          border: 'border-orange-200',
          bgCard: 'bg-orange-50',
          textCard: 'text-orange-700',
          textTitle: 'text-orange-800',
          bgBadge: 'bg-orange-100',
          textBadge: 'text-orange-600'
        };
      case 'writing':
        return {
          bg: 'bg-indigo-100',
          text: 'text-indigo-600',
          border: 'border-indigo-200',
          bgCard: 'bg-indigo-50',
          textCard: 'text-indigo-700',
          textTitle: 'text-indigo-800',
          bgBadge: 'bg-indigo-100',
          textBadge: 'text-indigo-600'
        };
      case 'reviewing':
        return {
          bg: 'bg-teal-100',
          text: 'text-teal-600',
          border: 'border-teal-200',
          bgCard: 'bg-teal-50',
          textCard: 'text-teal-700',
          textTitle: 'text-teal-800',
          bgBadge: 'bg-teal-100',
          textBadge: 'text-teal-600'
        };
      case 'completed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          border: 'border-green-200',
          bgCard: 'bg-green-50',
          textCard: 'text-green-700',
          textTitle: 'text-green-800',
          bgBadge: 'bg-green-100',
          textBadge: 'text-green-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          border: 'border-gray-200',
          bgCard: 'bg-gray-50',
          textCard: 'text-gray-700',
          textTitle: 'text-gray-800',
          bgBadge: 'bg-gray-100',
          textBadge: 'text-gray-600'
        };
    }
  };

  const styles = getStageStyles(stage);

  return (
    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.bg} ${styles.text} flex items-center justify-center`}>
        {getStageIcon(stage)}
      </div>
      
      <div className="flex-1">
        <div className={`${styles.bgCard} border ${styles.border} rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3`}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className={styles.text} />
            <span className={`text-sm font-semibold ${styles.textTitle}`}>
              🤖 AI Agent Research System
            </span>
            <span className={`text-xs ${styles.textBadge} ${styles.bgBadge} px-2 py-1 rounded-full`}>
              {stage.toUpperCase()}
            </span>
          </div>
          
          <p className={`text-xs sm:text-sm ${styles.textCard} mb-2 sm:mb-3`}>
            {message}
          </p>
          
          {agentsActive.length > 0 && (
            <div className={`border-t ${styles.border} pt-1 sm:pt-2`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs ${styles.text} hidden sm:inline`}>Active:</span>
                {agentsActive.map((agent, index) => (
                  <span 
                    key={index}
                    className={`text-xs ${styles.bgBadge} ${styles.textCard} px-1 sm:px-2 py-1 rounded-full`}
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};