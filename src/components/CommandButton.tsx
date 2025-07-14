import React from 'react';
import { ResearchCommand } from '../types/research';

interface CommandButtonProps {
  command: ResearchCommand;
  onClick: (command: ResearchCommand) => void;
  disabled?: boolean;
  isActive?: boolean;
}

export const CommandButton: React.FC<CommandButtonProps> = ({ 
  command, 
  onClick, 
  disabled = false,
  isActive = false 
}) => {
  const Icon = command.icon;
  
  return (
    <button
      onClick={() => onClick(command)}
      disabled={disabled}
      className={`
        group relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all duration-300 transform
        ${disabled 
          ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' 
          : `${command.bgColor} ${command.color} border-transparent hover:${command.hoverColor} hover:scale-105 hover:shadow-lg active:scale-95`
        }
        ${isActive ? 'ring-4 ring-blue-200 scale-105' : ''}
      `}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${disabled ? 'bg-gray-200' : 'bg-white/20'}`}>
            <Icon size={24} className={disabled ? 'text-gray-400' : 'text-current'} />
          </div>
          <h3 className="text-lg font-bold">{command.label}</h3>
        </div>
        
        <p className={`text-sm mb-3 ${disabled ? 'text-gray-500' : 'text-current opacity-90'}`}>
          {command.description}
        </p>
        
        <div className={`text-xs font-mono px-3 py-1 rounded-full ${disabled ? 'bg-gray-200 text-gray-500' : 'bg-white/20'}`}>
          {command.example}
        </div>
      </div>
      
      {/* Loading indicator for active state */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
        </div>
      )}
    </button>
  );
};