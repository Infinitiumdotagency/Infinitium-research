import React, { useState, useEffect } from 'react';
import { ResearchCommand } from '../types/research';
import { X, Sparkles } from 'lucide-react';

interface ResearchTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (topic: string) => void;
  command: ResearchCommand | null;
}

export const ResearchTopicModal: React.FC<ResearchTopicModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  command
}) => {
  const [topic, setTopic] = useState('');
  const [suggestions] = useState([
    'Artificial Intelligence impact on healthcare',
    'Climate change solutions 2024',
    'Quantum computing breakthroughs',
    'Remote work productivity trends',
    'Renewable energy adoption rates'
  ]);

  useEffect(() => {
    if (isOpen) {
      setTopic('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit(topic.trim());
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
  };

  if (!isOpen || !command) return null;

  const Icon = command.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${command.bgColor} ${command.color} p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{command.label}</h2>
                <p className="text-sm opacity-90">{command.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to research?
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`Enter your research topic for ${command.mode} analysis...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                autoFocus
              />
            </div>

            {/* Suggestions */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Popular Topics</span>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!topic.trim()}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  topic.trim()
                    ? `${command.bgColor.replace('bg-', 'bg-').replace('-100', '-500')} hover:${command.bgColor.replace('bg-', 'bg-').replace('-100', '-600')}`
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Start Research
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};