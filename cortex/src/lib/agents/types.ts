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
  model: string;  // Cloud model
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

// Cloud model configurations for each agent
export const AGENTS: Record<AgentRole, AgentConfig> = {
  moderator: {
    role: 'moderator',
    name: 'MODERATOR',
    model: 'gpt-oss:120b-cloud',
    color: '#a855f7', // violet
    icon: '👁️',
    description: 'Orchestrates the council, synthesizes findings, produces verdict'
  },
  architect: {
    role: 'architect',
    name: 'ARCHITECT',
    model: 'gpt-oss:120b-cloud',
    color: '#3b82f6', // blue
    icon: '🏛️',
    description: 'Reviews structure, patterns, readability, maintainability'
  },
  sentinel: {
    role: 'sentinel',
    name: 'SENTINEL',
    model: 'deepseek-v3.1:671b-cloud',
    color: '#ef4444', // red
    icon: '🛡️',
    description: 'Finds bugs, security issues, edge cases'
  },
  optimizer: {
    role: 'optimizer',
    name: 'OPTIMIZER',
    model: 'qwen3-coder:480b-cloud',
    color: '#22c55e', // green
    icon: '⚡',
    description: 'Identifies performance bottlenecks, complexity issues'
  },
  maintainer: {
    role: 'maintainer',
    name: 'MAINTAINER',
    model: 'devstral-2:123b-cloud',
    color: '#f59e0b', // amber
    icon: '🔧',
    description: 'Improves tests, error handling, developer experience'
  },
  verifier: {
    role: 'verifier',
    name: 'VERIFIER',
    model: 'gpt-oss:120b-cloud',
    color: '#06b6d4', // cyan
    icon: '✓',
    description: 'Validates claims against code, flags speculation'
  }
};
