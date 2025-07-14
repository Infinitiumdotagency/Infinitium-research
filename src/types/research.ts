export interface ResearchQuery {
  id: string;
  originalQuery: string;
  searchQueries: string[];
  timestamp: Date;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  snippet: string;
  credibilityScore: number;
  sourceType: 'news' | 'academic' | 'government' | 'commercial' | 'other';
  publishDate?: string;
  domain: string;
}

export interface ResearchFinding {
  id: string;
  topic: string;
  summary: string;
  sources: ResearchSource[];
  confidence: number;
  lastUpdated: Date;
}

export interface ResearchSession {
  id: string;
  originalQuery: string;
  mode: ResearchMode;
  status: ResearchStatus;
  findings: ResearchFinding[];
  searchQueries: ResearchQuery[];
  startTime: Date;
  completionTime?: Date;
  progress: ResearchProgress;
}

export type ResearchMode = 'quick' | 'standard' | 'deep' | 'comparative' | 'timeline';
export type ResearchStatus = 'planning' | 'searching' | 'analyzing' | 'synthesizing' | 'completed' | 'error';

export interface ResearchCommand {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  mode: ResearchMode;
  color: string;
  bgColor: string;
  hoverColor: string;
  example: string;
}

export interface ProgressStage {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startTime?: Date;
  completionTime?: Date;
}

export interface ResearchProgress {
  currentStage: ResearchStatus;
  stagesCompleted: ResearchStatus[];
  totalSearches: number;
  completedSearches: number;
  sourcesFound: number;
  estimatedTimeRemaining?: number;
  stages?: ProgressStage[];
}