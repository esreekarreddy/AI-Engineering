// Agent Types for CORTEX Engineering Council

export type AgentRole = 
  | 'moderator' 
  | 'architect' 
  | 'sentinel' 
  | 'optimizer' 
  | 'maintainer' 
  | 'verifier';

export type FindingCategory = 
  | 'security' 
  | 'bug' 
  | 'design' 
  | 'performance' 
  | 'tests' 
  | 'readability';

export type Severity = 'P0' | 'P1' | 'P2' | 'P3';

export interface Finding {
  id: string;
  agentRole: AgentRole;
  category: FindingCategory;
  severity: Severity;
  confidence: number;
  where: {
    file?: string;
    lines?: string;
  };
  claim: string;
  evidence: string;
  impact: string;
  fix: string;
  patchSnippet?: string;
  tradeoff?: string;
}

export interface AgentConfig {
  role: AgentRole;
  name: string;
  defaultModel: string;
  fallbackModels: string[];
  color: string;
  icon: string;
  description: string;
}

export interface AgentMessage {
  id: string;
  agentRole: AgentRole;
  content: string;
  timestamp: number;
  phase: 'intake' | 'review' | 'debate' | 'verdict';
}

export interface CouncilSession {
  id: string;
  code: string;
  codeMap?: string;
  findings: Finding[];
  messages: AgentMessage[];
  verdict?: CouncilVerdict;
  status: 'idle' | 'intake' | 'reviewing' | 'debating' | 'complete';
  startedAt: number;
  completedAt?: number;
}

export interface CouncilVerdict {
  rankedActions: {
    severity: Severity;
    items: Finding[];
  }[];
  riskTable: {
    category: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    notes: string;
  }[];
  summary: string;
  nextSteps: string[];
}

// Agent configurations
export const AGENTS: Record<AgentRole, AgentConfig> = {
  moderator: {
    role: 'moderator',
    name: 'MODERATOR',
    defaultModel: 'mistral-small3.2',
    fallbackModels: ['llama3.3', 'llama3.2', 'llama3', 'mistral'],
    color: '#a855f7', // violet
    icon: '👁️',
    description: 'Orchestrates the council, synthesizes findings, produces verdict'
  },
  architect: {
    role: 'architect',
    name: 'ARCHITECT',
    defaultModel: 'mistral-small3.2',
    fallbackModels: ['llama3.3', 'llama3.2', 'llama3', 'mistral'],
    color: '#3b82f6', // blue
    icon: '🏛️',
    description: 'Reviews structure, patterns, readability, maintainability'
  },
  sentinel: {
    role: 'sentinel',
    name: 'SENTINEL',
    defaultModel: 'deepseek-coder-v2:lite',
    fallbackModels: ['qwen2.5-coder:14b', 'deepseek-coder', 'codellama', 'llama3'],
    color: '#ef4444', // red
    icon: '🛡️',
    description: 'Finds bugs, security issues, edge cases'
  },
  optimizer: {
    role: 'optimizer',
    name: 'OPTIMIZER',
    defaultModel: 'phi4:14b',
    fallbackModels: ['phi4-reasoning:14b', 'phi3', 'mistral', 'llama3'],
    color: '#22c55e', // green
    icon: '⚡',
    description: 'Identifies performance bottlenecks, complexity issues'
  },
  maintainer: {
    role: 'maintainer',
    name: 'MAINTAINER',
    defaultModel: 'mistral-small3.2',
    fallbackModels: ['mistral', 'llama3.2', 'llama3', 'phi3'],
    color: '#f59e0b', // amber
    icon: '🔧',
    description: 'Improves tests, error handling, developer experience'
  },
  verifier: {
    role: 'verifier',
    name: 'VERIFIER',
    defaultModel: 'deepseek-r1:14b',
    fallbackModels: ['deepseek-r1:7b', 'phi4', 'phi3', 'llama3'],
    color: '#06b6d4', // cyan
    icon: '✓',
    description: 'Validates claims against code, flags speculation'
  }
};
