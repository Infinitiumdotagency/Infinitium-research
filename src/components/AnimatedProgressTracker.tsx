import React from 'react';
import { ProgressStage } from '../types/research';
import { ResearchStageIndicator } from './ResearchStageIndicator';

interface AnimatedProgressTrackerProps {
  stages: ProgressStage[];
  title?: string;
  subtitle?: string;
}

export const AnimatedProgressTracker: React.FC<AnimatedProgressTrackerProps> = ({ 
  stages, 
  title = "Research Progress",
  subtitle 
}) => {
  const completedStages = stages.filter(stage => stage.status === 'completed').length;
  const totalStages = stages.length;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;
  
  const currentStage = stages.find(stage => stage.status === 'active');
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <span className="text-sm text-gray-500">
            {completedStages}/{totalStages} completed
          </span>
        </div>
        
        {subtitle && (
          <p className="text-sm text-gray-600 mb-3">{subtitle}</p>
        )}
        
        {/* Overall Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Current Stage Info */}
      {currentStage && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-800">
              Currently: {currentStage.label}
            </span>
          </div>
        </div>
      )}
      
      {/* Stage Indicators */}
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <ResearchStageIndicator
            key={stage.id}
            stage={stage}
            index={index}
            isLast={index === stages.length - 1}
          />
        ))}
      </div>
      
      {/* Completion Celebration */}
      {progressPercentage === 100 && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-green-800 font-medium">Research Completed Successfully!</p>
          <p className="text-green-600 text-sm">All stages finished with high quality results.</p>
        </div>
      )}
    </div>
  );
};