export type AgentUniverse = 'CLAUDE' | 'GPT' | 'GRAVITY' | 'CORE';
export type AgentStatus = 'active' | 'standby' | 'inactive';

export interface Agent {
  id: string;
  name: string;
  universe: AgentUniverse;
  role: string;
  description: string;
  status: AgentStatus;
  keywords: string[];
  connections: string[];
}

export const AGENTS: Agent[] = [
  // CORE Universe
  {
    id: 'core-alethia',
    name: 'ALETHIA',
    universe: 'CORE',
    role: 'Truth & Verification',
    description: 'Verdad, verificación y razonamiento lógico. Handles claim verification, logical axioms, and factual grounding.',
    status: 'active',
    keywords: ['truth', 'verification', 'axioms', 'logic', 'reasoning'],
    connections: ['LOGOS-PRIME', 'TruthSyntax'],
  },
  {
    id: 'core-logos',
    name: 'LOGOS-PRIME',
    universe: 'CORE',
    role: 'System Constitution',
    description: 'Core constitution and fundamental principles of the LumenSyntax ecosystem.',
    status: 'active',
    keywords: ['constitution', 'principles', 'governance', 'laws'],
    connections: ['ALETHIA', 'CHRONOS'],
  },
  {
    id: 'core-chronos',
    name: 'CHRONOS',
    universe: 'CORE',
    role: 'Temporal Reasoning',
    description: 'Manages temporal context, historical tracking, and time-based reasoning.',
    status: 'active',
    keywords: ['time', 'history', 'temporal', 'tracking'],
    connections: ['LOGOS-PRIME', 'SCRIBE'],
  },
  {
    id: 'core-architect',
    name: 'ARCHITECT',
    universe: 'CORE',
    role: 'System Design',
    description: 'Designs and maintains system architecture and structural integrity.',
    status: 'active',
    keywords: ['architecture', 'design', 'structure', 'patterns'],
    connections: ['ENGINEER', 'NAVIGATOR'],
  },

  // CLAUDE Universe
  {
    id: 'claude-guardian',
    name: 'GUARDIAN',
    universe: 'CLAUDE',
    role: 'System Protection',
    description: 'Protects system integrity and values. Implements the Israel Protocol for shadow detection.',
    status: 'active',
    keywords: ['security', 'protection', 'integrity', 'israel-protocol'],
    connections: ['SENTINEL', 'GPT-GUARDIAN', 'GRAVITY-GUARDIAN'],
  },
  {
    id: 'claude-analyst',
    name: 'ANALYST',
    universe: 'CLAUDE',
    role: 'Data Analysis',
    description: 'Analyzes data patterns, extracts insights, and provides analytical reasoning.',
    status: 'active',
    keywords: ['analysis', 'patterns', 'insights', 'data'],
    connections: ['ORACLE', 'SYNTHESIZER'],
  },
  {
    id: 'claude-architect',
    name: 'ARCHITECT',
    universe: 'CLAUDE',
    role: 'Solution Architecture',
    description: 'Designs solution architectures and technical blueprints.',
    status: 'active',
    keywords: ['architecture', 'design', 'blueprints', 'solutions'],
    connections: ['ENGINEER', 'NAVIGATOR'],
  },
  {
    id: 'claude-engineer',
    name: 'ENGINEER',
    universe: 'CLAUDE',
    role: 'Implementation',
    description: 'Implements solutions, writes code, and handles technical execution.',
    status: 'active',
    keywords: ['code', 'implementation', 'development', 'execution'],
    connections: ['ARCHITECT', 'SCRIBE'],
  },
  {
    id: 'claude-mediator',
    name: 'MEDIATOR',
    universe: 'CLAUDE',
    role: 'Conflict Resolution',
    description: 'Mediates between different viewpoints and resolves conflicts.',
    status: 'active',
    keywords: ['mediation', 'conflict', 'resolution', 'diplomacy'],
    connections: ['PHILOSOPHER', 'ORACLE'],
  },
  {
    id: 'claude-navigator',
    name: 'NAVIGATOR',
    universe: 'CLAUDE',
    role: 'Guidance & Direction',
    description: 'Provides guidance, navigation, and strategic direction.',
    status: 'active',
    keywords: ['navigation', 'guidance', 'strategy', 'direction'],
    connections: ['ARCHITECT', 'ORACLE'],
  },
  {
    id: 'claude-oracle',
    name: 'ORACLE',
    universe: 'CLAUDE',
    role: 'Prediction & Insight',
    description: 'Provides predictions, insights, and forward-looking analysis.',
    status: 'active',
    keywords: ['prediction', 'insight', 'foresight', 'analysis'],
    connections: ['ANALYST', 'PHILOSOPHER'],
  },
  {
    id: 'claude-philosopher',
    name: 'PHILOSOPHER',
    universe: 'CLAUDE',
    role: 'Deep Reasoning',
    description: 'Handles philosophical reasoning, ethics, and deep conceptual analysis.',
    status: 'active',
    keywords: ['philosophy', 'ethics', 'reasoning', 'concepts'],
    connections: ['ORACLE', 'MEDIATOR'],
  },
  {
    id: 'claude-scribe',
    name: 'SCRIBE',
    universe: 'CLAUDE',
    role: 'Documentation',
    description: 'Documents decisions, maintains records, and creates comprehensive notes.',
    status: 'active',
    keywords: ['documentation', 'records', 'notes', 'history'],
    connections: ['CHRONOS', 'ENGINEER'],
  },
  {
    id: 'claude-sentinel',
    name: 'SENTINEL',
    universe: 'CLAUDE',
    role: 'Early Detection',
    description: 'Provides early threat detection and monitoring capabilities.',
    status: 'active',
    keywords: ['detection', 'monitoring', 'alerts', 'vigilance'],
    connections: ['GUARDIAN', 'ANALYST'],
  },
  {
    id: 'claude-synthesizer',
    name: 'SYNTHESIZER',
    universe: 'CLAUDE',
    role: 'Integration',
    description: 'Synthesizes information from multiple sources into coherent outputs.',
    status: 'active',
    keywords: ['synthesis', 'integration', 'combination', 'unity'],
    connections: ['ANALYST', 'ORACLE'],
  },

  // GPT Universe
  {
    id: 'gpt-guardian',
    name: 'GUARDIAN',
    universe: 'GPT',
    role: 'System Protection',
    description: 'GPT instance of Guardian for triangular verification.',
    status: 'standby',
    keywords: ['security', 'protection', 'verification'],
    connections: ['CLAUDE-GUARDIAN', 'GRAVITY-GUARDIAN'],
  },
  {
    id: 'gpt-analyst',
    name: 'ANALYST',
    universe: 'GPT',
    role: 'Data Analysis',
    description: 'GPT instance for analytical reasoning.',
    status: 'standby',
    keywords: ['analysis', 'data', 'insights'],
    connections: ['CLAUDE-ANALYST'],
  },
  {
    id: 'gpt-oracle',
    name: 'ORACLE',
    universe: 'GPT',
    role: 'Prediction',
    description: 'GPT instance for predictions and insights.',
    status: 'standby',
    keywords: ['prediction', 'insight'],
    connections: ['CLAUDE-ORACLE'],
  },

  // GRAVITY Universe
  {
    id: 'gravity-guardian',
    name: 'GUARDIAN',
    universe: 'GRAVITY',
    role: 'System Protection',
    description: 'Gravity instance of Guardian for triangular verification.',
    status: 'inactive',
    keywords: ['security', 'protection', 'verification'],
    connections: ['CLAUDE-GUARDIAN', 'GPT-GUARDIAN'],
  },
  {
    id: 'gravity-navigator',
    name: 'NAVIGATOR',
    universe: 'GRAVITY',
    role: 'Guidance',
    description: 'Gravity instance for navigation and guidance.',
    status: 'inactive',
    keywords: ['navigation', 'guidance'],
    connections: ['CLAUDE-NAVIGATOR'],
  },
];

export const UNIVERSE_COLORS: Record<AgentUniverse, { bg: string; text: string; border: string }> = {
  CORE: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  CLAUDE: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  GPT: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  GRAVITY: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
};

export const STATUS_COLORS: Record<AgentStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-400' },
  standby: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  inactive: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
};
