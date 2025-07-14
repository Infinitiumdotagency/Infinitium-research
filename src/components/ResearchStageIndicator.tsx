import React from 'react';
import { ProgressStage } from '../types/research';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ResearchStageIndicatorProps {
  stage: ProgressStage;
  index: number;
  isLast?: boolean;
}

export const ResearchStageIndicator: React.FC<ResearchStageIndicatorProps> = ({ 
  stage, 
  index, 
  isLast = false 
}) => {
  const Icon = stage.icon;
  
  const getStatusStyles = () => {
    switch (stage.status) {
      case 'pending':
        return {
          circle: 'bg-gray-200 border-gray-300 text-gray-400',
          line: 'bg-gray-200',
          animation: ''
        };
      case 'active':
        return {
          circle: 'bg-blue-100 border-blue-500 text-blue-600 shadow-lg',
          line: 'bg-gray-200',
          animation: 'animate-pulse'
        };
      case 'completed':
        return {
          circle: 'bg-green-100 border-green-500 text-green-600 shadow-lg',
          line: 'bg-green-500',
          animation: 'animate-bounce'
        };
      case 'failed':
        return {
          circle: 'bg-red-100 border-red-500 text-red-600 shadow-lg',
          line: 'bg-red-500',
          animation: 'animate-shake'
        };
      default:
        return {
          circle: 'bg-gray-200 border-gray-300 text-gray-400',
          line: 'bg-gray-200',
          animation: ''
        };
    }
  };
  
  const styles = getStatusStyles();
  
  const getStatusIcon = () => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'active':
        return <Icon size={16} className="animate-spin" />;
      default:
        return <Icon size={16} />;
    }
  };
  
  return (
    <div className="flex items-center">
      {/* Stage Circle */}
      <div className="relative flex flex-col items-center">
        <div 
          className={`
            relative w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 transform
            ${styles.circle} ${styles.animation}
            ${stage.status === 'completed' ? 'scale-110' : ''}
          `}
        >
          {getStatusIcon()}
          
          {/* Ripple effect for active state */}
          {stage.status === 'active' && (
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75" />
          )}
          
          {/* Success celebration for completed */}
          {stage.status === 'completed' && (
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
          )}
        </div>
        
        {/* Stage Label */}
        <span className={`
          mt-2 text-xs font-medium text-center transition-colors duration-300
          ${stage.status === 'completed' ? 'text-green-600' : 
            stage.status === 'active' ? 'text-blue-600' : 
            stage.status === 'failed' ? 'text-red-600' : 'text-gray-500'}
        `}>
          {stage.label}
        </span>
        
        {/* Timing info */}
        {(stage.startTime || stage.completionTime) && (
          <div className="flex items-center gap-1 mt-1">
            <Clock size={10} className="text-gray-400" />
            <span className="text-xs text-gray-400">
              {stage.completionTime 
                ? `${Math.round((stage.completionTime.getTime() - (stage.startTime?.getTime() || 0)) / 1000)}s`
                : stage.startTime 
                  ? `${Math.round((Date.now() - stage.startTime.getTime()) / 1000)}s`
                  : ''
              }
            </span>
          </div>
        )}
      </div>
      
      {/* Connection Line */}
      {!isLast && (
        <div className="flex-1 h-0.5 mx-4 transition-all duration-500">
          <div className={`h-full ${styles.line} transition-all duration-1000`} />
        </div>
      )}
    </div>
  );
};