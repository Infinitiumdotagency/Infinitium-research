import React from 'react';
import { Search, Globe } from 'lucide-react';

export const SearchIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
        <Globe size={16} />
      </div>
      
      <div className="flex-1">
        <div className="inline-block bg-green-50 border border-green-200 rounded-2xl rounded-bl-md px-4 py-2">
          <div className="flex items-center gap-2 text-green-700">
            <Search size={14} className="animate-pulse" />
            <span className="text-sm font-medium">Searching the web...</span>
          </div>
        </div>
      </div>
    </div>
  );
};