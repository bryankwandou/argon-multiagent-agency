export type AgentRoleId =
  | 'ORCH-01'
  | 'ARCH-02'
  | 'UIX-03'
  | 'DATA-04'
  | 'SEC-05'
  | 'RES-06'
  | 'EXEC-07'
  | 'QA-08'
  | 'DOC-09'
  | 'SRE-10';

export type AgentState =
  | 'TYPING'
  | 'THINKING'
  | 'WALKING'
  | 'DEBATING'
  | 'REVIEWING'
  | 'IDLE'
  | 'SHIPPING';

export type RoomZoneId =
  | 'EXEC_OFFICE'
  | 'BREAKROOM'
  | 'BULLPEN'
  | 'RECEPTION'
  | 'SECURITY_SRE'
  | 'CONFERENCE';

export type WireStatus =
  | 'BLOCKED'
  | 'IN_PROGRESS'
  | 'WOKEN'
  | 'LIVE'
  | 'AT_BAT'
  | 'HELD'
  | 'VERIFIED'
  | 'SHIPPED';

export type OrchestrationMode = 'AUTO_DAG' | 'GROK_COUNCIL' | 'DIRECT_ASSIGN';

export type PriorityLevel = 'P0' | 'P1' | 'P2';

export interface IsoCoord {
  x: number;
  y: number;
}

export interface AgentAvatarTokens {
  skinKey: 'skinToneA' | 'skinToneB' | 'skinToneC';
  hairKey: 'hairDark' | 'hairBrown' | 'hairBlonde' | 'hairAuburn' | 'hairSilver';
  suitKey:
    | 'suitNavy'
    | 'suitCharcoal'
    | 'suitTeal'
    | 'suitRust'
    | 'suitOlive'
    | 'suitSlate'
    | 'suitBurgundy'
    | 'suitIndigo';
}

export interface AgencyAgent {
  id: AgentRoleId;
  name: string;
  scrantonAlias: string;
  roleId: string;
  roleEn: string;
  department: string;
  zone: RoomZoneId;
  deskCoord: IsoCoord;
  currentCoord: IsoCoord;
  targetCoord: IsoCoord;
  facing: 'SE' | 'SW' | 'NE' | 'NW';
  state: AgentState;
  activeWireId: string | null;
  speechBubble: string | null;
  speechUpdatedAt: number;
  tokensProcessed: number;
  tasksCompleted: number;
  confidenceScore: number;
  tools: string[];
  avatar: AgentAvatarTokens;
  directiveId: string;
  directiveEn: string;
}

export interface CodeArtifact {
  filename: string;
  language: string;
  code: string;
  summary: string;
}

export interface TaskWire {
  id: string;
  title: string;
  status: WireStatus;
  statusDetail: string;
  progress: number;
  assignedAgentId: AgentRoleId;
  dependencies: string[];
  priority: PriorityLevel;
  codeDelta: {
    added: number;
    removed: number;
  };
  createdAt: string;
  artifact?: CodeArtifact;
}

export interface FloorChatterItem {
  id: string;
  time: string;
  agentId: AgentRoleId;
  agentName: string;
  wireId?: string;
  category: 'DISPATCH' | 'TOOL' | 'DEBATE' | 'WIRE' | 'COMMIT' | 'GATE';
  text: string;
}

export interface CouncilVote {
  agentId: AgentRoleId;
  agentName: string;
  roleLabel: string;
  stance: 'APPROVE' | 'HARDEN' | 'OPTIMIZE';
  confidence: number;
  critique: string;
  toolUsed: string;
}

export interface SubAgentExecutionTrace {
  agentId: AgentRoleId;
  agentName: string;
  roleLabel: string;
  wireId: string;
  wireTitle: string;
  toolCalls: string[];
  outputSummary: string;
  durationMs: number;
}

export interface AgencyChatMessage {
  id: string;
  sender: 'USER' | 'ORCHESTRATOR' | 'AGENT' | 'COUNCIL';
  agentId?: AgentRoleId;
  agentName?: string;
  roleLabel?: string;
  timestamp: string;
  content: string;
  mode: OrchestrationMode;
  priority?: PriorityLevel;
  modelBadge?: string;
  decomposedWires?: string[];
  traces?: SubAgentExecutionTrace[];
  councilVotes?: CouncilVote[];
  artifact?: CodeArtifact;
  latencyMs?: number;
}

export interface ShipLogEntry {
  id: string;
  commitHash: string;
  timestamp: string;
  wireId: string;
  agentId: AgentRoleId;
  summary: string;
  deltaAdded: number;
  deltaRemoved: number;
  environment: 'PREVIEW' | 'PRODUCTION';
}
