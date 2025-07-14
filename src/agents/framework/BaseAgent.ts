export interface AgentResult {
  success: boolean;
  data: any;
  metadata: {
    processingTime: number;
    confidence: number;
    sources?: string[];
    nextActions?: string[];
  };
  errors?: string[];
}

export interface Task {
  id: string;
  type: string;
  priority: number;
  payload: any;
  dependencies?: string[];
  deadline?: Date;
}

export interface ResearchContext {
  sessionId: string;
  originalQuery: string;
  currentStage: string;
  findings: any[];
  sources: any[];
  gaps: string[];
  nextActions: string[];
  userPreferences: {
    depth: 'quick' | 'standard' | 'deep';
    focus: string[];
    excludeTopics: string[];
  };
}

export abstract class BaseAgent {
  protected id: string;
  protected type: string;
  protected capabilities: string[];

  constructor(id: string, type: string, capabilities: string[] = []) {
    this.id = id;
    this.type = type;
    this.capabilities = capabilities;
  }

  abstract execute(task: Task, context: ResearchContext): Promise<AgentResult>;

  protected async delegate(
    task: Task, 
    targetAgentType: string, 
    context: ResearchContext
  ): Promise<AgentResult> {
    // This would be implemented by the agent coordinator
    throw new Error('Delegation must be implemented by coordinator');
  }

  protected createSubTask(
    type: string, 
    payload: any, 
    priority: number = 1
  ): Task {
    return {
      id: `${this.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      payload
    };
  }

  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    console.log(`[${this.type}:${this.id}] ${level.toUpperCase()}: ${message}`);
  }
}