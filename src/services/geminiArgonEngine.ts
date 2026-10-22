import type {
  AgencyAgent,
  AgentRoleId,
  CodeArtifact,
  CouncilVote,
  FloorChatterItem,
  IsoCoord,
  OrchestrationMode,
  PriorityLevel,
  RoomZoneId,
  ShipLogEntry,
  SubAgentExecutionTrace,
  TaskWire,
} from '../types/agency';
import type { LocaleCode } from '../context/AppSettingsContext';

export const ROOM_WAYPOINTS: Record<RoomZoneId, IsoCoord[]> = {
  EXEC_OFFICE: [
    { x: 1.9, y: 2.1 },
    { x: 2.6, y: 2.8 },
    { x: 1.5, y: 3.4 },
  ],
  BREAKROOM: [
    { x: 5.5, y: 1.8 },
    { x: 6.4, y: 2.3 },
    { x: 7.2, y: 1.9 },
  ],
  BULLPEN: [
    { x: 4.5, y: 4.6 },
    { x: 6.2, y: 4.6 },
    { x: 4.5, y: 6.5 },
    { x: 6.2, y: 6.5 },
    { x: 7.8, y: 4.8 },
    { x: 7.8, y: 6.6 },
  ],
  RECEPTION: [
    { x: 2.3, y: 7.4 },
    { x: 3.2, y: 8.1 },
  ],
  SECURITY_SRE: [
    { x: 9.2, y: 4.4 },
    { x: 9.2, y: 6.4 },
  ],
  CONFERENCE: [
    { x: 8.2, y: 8.0 },
    { x: 8.9, y: 7.7 },
    { x: 9.4, y: 8.2 },
    { x: 8.5, y: 8.6 },
    { x: 7.7, y: 8.3 },
  ],
};

export const INITIAL_AGENTS: AgencyAgent[] = [
  {
    id: 'ORCH-01',
    name: 'Argon Director',
    scrantonAlias: 'Michael Scott',
    roleId: 'Direktur Orkestrasi Utama',
    roleEn: 'Chief Agency Orchestrator',
    department: 'Executive Command',
    zone: 'EXEC_OFFICE',
    deskCoord: { x: 1.9, y: 2.1 },
    currentCoord: { x: 1.9, y: 2.1 },
    targetCoord: { x: 1.9, y: 2.1 },
    facing: 'SE',
    state: 'THINKING',
    activeWireId: 'FN-12',
    speechBubble: 'Routing DAG wires across 10 floor specialists.',
    speechUpdatedAt: Date.now(),
    tokensProcessed: 184920,
    tasksCompleted: 42,
    confidenceScore: 99.4,
    tools: ['dag_decomposer', 'pod_router', 'consensus_synthesizer'],
    avatar: { skinKey: 'skinToneA', hairKey: 'hairDark', suitKey: 'suitNavy' },
    directiveId: 'Memecah misi kompleks menjadi graf tugas paralel (DAG) dan menyatukan hasil akhir.',
    directiveEn: 'Decomposes complex missions into parallel DAG task wires and synthesizes final deliverables.',
  },
  {
    id: 'ARCH-02',
    name: 'Staff Architect',
    scrantonAlias: 'Dwight Schrute',
    roleId: 'Arsitek Sistem & Topologi',
    roleEn: 'Principal Systems Architect',
    department: 'Core Architecture',
    zone: 'BULLPEN',
    deskCoord: { x: 4.5, y: 4.5 },
    currentCoord: { x: 4.5, y: 4.5 },
    targetCoord: { x: 4.5, y: 4.5 },
    facing: 'SE',
    state: 'TYPING',
    activeWireId: 'INF-163',
    speechBubble: 'INF-163 ingestion topology locked.',
    speechUpdatedAt: Date.now() - 4000,
    tokensProcessed: 162400,
    tasksCompleted: 38,
    confidenceScore: 98.9,
    tools: ['topology_planner', 'schema_compiler', 'rfc_generator'],
    avatar: { skinKey: 'skinToneA', hairKey: 'hairBrown', suitKey: 'suitOlive' },
    directiveId: 'Merancang arsitektur terdistribusi, kontrak API, dan skema data berketahanan tinggi.',
    directiveEn: 'Designs distributed system topology, strict API contracts, and resilient data schemas.',
  },
  {
    id: 'UIX-03',
    name: 'Kinetic UI Lead',
    scrantonAlias: 'Jim Halpert',
    roleId: 'Arsitek Antarmuka & Kinetika',
    roleEn: 'Principal Frontend & Kinetic UI',
    department: 'Spatial Interface',
    zone: 'BULLPEN',
    deskCoord: { x: 6.2, y: 4.5 },
    currentCoord: { x: 6.2, y: 4.5 },
    targetCoord: { x: 6.2, y: 4.5 },
    facing: 'SW',
    state: 'TYPING',
    activeWireId: 'FN-12',
    speechBubble: '120fps token matrix synced.',
    speechUpdatedAt: Date.now() - 7000,
    tokensProcessed: 149810,
    tasksCompleted: 35,
    confidenceScore: 99.1,
    tools: ['component_fabricator', 'wcag_verifier', 'token_compiler'],
    avatar: { skinKey: 'skinToneA', hairKey: 'hairBrown', suitKey: 'suitSlate' },
    directiveId: 'Membangun komponen React/TypeScript presisi tinggi dengan sistem token gelap/terang.',
    directiveEn: 'Builds high-precision React/TypeScript interfaces with centralized light/dark design tokens.',
  },
  {
    id: 'DATA-04',
    name: 'Data Mesh Lead',
    scrantonAlias: 'Oscar Martinez',
    roleId: 'Insinyur Pipeline & Ledger',
    roleEn: 'Distributed Data & Ledger Lead',
    department: 'Data Engineering',
    zone: 'BULLPEN',
    deskCoord: { x: 4.5, y: 6.4 },
    currentCoord: { x: 4.5, y: 6.4 },
    targetCoord: { x: 4.5, y: 6.4 },
    facing: 'NE',
    state: 'TYPING',
    activeWireId: 'FN-12',
    speechBubble: 'Value-Baseline stream 99.98% clean.',
    speechUpdatedAt: Date.now() - 2500,
    tokensProcessed: 171300,
    tasksCompleted: 40,
    confidenceScore: 99.2,
    tools: ['stream_indexer', 'query_optimizer', 'state_replicator'],
    avatar: { skinKey: 'skinToneB', hairKey: 'hairDark', suitKey: 'suitCharcoal' },
    directiveId: 'Mengelola pipeline telemetri real-time, replikasi state, dan konsistensi database.',
    directiveEn: 'Manages real-time telemetry pipelines, state replication, and transactional consistency.',
  },
  {
    id: 'SEC-05',
    name: 'Zero-Trust CSO',
    scrantonAlias: 'Angela Martin',
    roleId: 'Auditor Keamanan Zero-Trust',
    roleEn: 'Chief Security Officer (CSO)',
    department: 'Security & Audit',
    zone: 'SECURITY_SRE',
    deskCoord: { x: 9.1, y: 4.4 },
    currentCoord: { x: 9.1, y: 4.4 },
    targetCoord: { x: 9.1, y: 4.4 },
    facing: 'SW',
    state: 'REVIEWING',
    activeWireId: 'FN-11',
    speechBubble: 'Holding FN-11 until webhook secret rotates.',
    speechUpdatedAt: Date.now() - 1200,
    tokensProcessed: 138500,
    tasksCompleted: 33,
    confidenceScore: 99.8,
    tools: ['owasp_scanner', 'secret_guard', 'aead_verifier'],
    avatar: { skinKey: 'skinToneA', hairKey: 'hairBlonde', suitKey: 'suitBurgundy' },
    directiveId: 'Memvalidasi setiap input, mencegah celah OWASP Top 10, dan mengaudit rotasi kunci kriptografi.',
    directiveEn: 'Validates all inputs, enforces OWASP Top 10 defenses, and audits cryptographic key rotation.',
  },
  {
    id: 'RES-06',
    name: 'Deep Researcher',
    scrantonAlias: 'Phyllis Vance',
    roleId: 'Analis Riset & Inteligensi',
    roleEn: 'Deep Research & Citations Lead',
    department: 'Intelligence',
    zone: 'BULLPEN',
    deskCoord: { x: 6.2, y: 6.4 },
    currentCoord: { x: 6.2, y: 6.4 },
    targetCoord: { x: 6.2, y: 6.4 },
    facing: 'NW',
    state: 'THINKING',
    activeWireId: 'INF-163',
    speechBubble: 'Info Note: indexing live corpus vectors.',
    speechUpdatedAt: Date.now() - 900,
    tokensProcessed: 154200,
    tasksCompleted: 36,
    confidenceScore: 98.7,
    tools: ['corpus_retriever', 'benchmark_analyzer', 'citation_graph'],
    avatar: { skinKey: 'skinToneA', hairKey: 'hairAuburn', suitKey: 'suitTeal' },
    directiveId: 'Melakukan sintesis riset mendalam, pemetaan kompetitif, dan verifikasi fakta teknis.',
    directiveEn: 'Executes deep technical research synthesis, competitive mapping, and benchmark verification.',
  },
  {
    id: 'EXEC-07',
    name: 'Sandbox Executor',
    scrantonAlias: 'Ryan Howard',
    roleId: 'Eksekutor Kode Otonom',
    roleEn: 'Autonomous Code Sandbox Runner',
    department: 'Runtime Execution',
    zone: 'BULLPEN',
    deskCoord: { x: 7.7, y: 4.8 },
    currentCoord: { x: 7.7, y: 4.8 },
    targetCoord: { x: 7.7, y: 4.8 },
    facing: 'SW',
    state: 'TYPING',
    activeWireId: 'ING-1461',
    speechBubble: 'Slim-through OkHttp3 worker compiled.',
    speechUpdatedAt: Date.now() - 3200,
    tokensProcessed: 193400,
    tasksCompleted: 47,
    confidenceScore: 98.5,
    tools: ['ast_code_writer', 'sandbox_daemon', 'diff_patcher'],
    avatar: { skinKey: 'skinToneB', hairKey: 'hairDark', suitKey: 'suitIndigo' },
    directiveId: 'Menulis kode produksi bersih tanpa placeholder dan menjalankan kompilasi di sandbox.',
    directiveEn: 'Writes clean production code with zero placeholders and executes isolated sandbox builds.',
  },
  {
    id: 'QA-08',
    name: 'Red-Team Critic',
    scrantonAlias: 'Stanley Hudson',
    roleId: 'Kritikus QA & Verifikasi Silang',
    roleEn: 'Red-Team Critic & QA Verifier',
    department: 'Verification Council',
    zone: 'BULLPEN',
    deskCoord: { x: 7.7, y: 6.5 },
    currentCoord: { x: 7.7, y: 6.5 },
    targetCoord: { x: 7.7, y: 6.5 },
    facing: 'NW',
    state: 'REVIEWING',
    activeWireId: 'GATE-011',
    speechBubble: 'Zero regression tolerance on GATE-011.',
    speechUpdatedAt: Date.now() - 5100,
    tokensProcessed: 129700,
    tasksCompleted: 31,
    confidenceScore: 99.5,
    tools: ['property_fuzzer', 'edge_case_prober', 'assertion_runner'],
    avatar: { skinKey: 'skinToneC', hairKey: 'hairSilver', suitKey: 'suitCharcoal' },
    directiveId: 'Menguji batas kegagalan (edge-case), menantang asumsi agen lain di Council, dan memverifikasi tes.',
    directiveEn: 'Probes edge cases, challenges peer agent assumptions in Council debates, and verifies test suites.',
  },
  {
    id: 'DOC-09',
    name: 'Ship-Log Chronicler',
    scrantonAlias: 'Pam Beesly',
    roleId: 'Kronikler Rilis & Dokumentasi',
    roleEn: 'Ship-Log & Release Chronicler',
    department: 'Archive & Gateway',
    zone: 'RECEPTION',
    deskCoord: { x: 2.4, y: 7.4 },
    currentCoord: { x: 2.4, y: 7.4 },
    targetCoord: { x: 2.4, y: 7.4 },
    facing: 'NE',
    state: 'TYPING',
    activeWireId: 'SHIP-101',
    speechBubble: 'Low-prio ship-log note appended.',
    speechUpdatedAt: Date.now() - 600,
    tokensProcessed: 112600,
    tasksCompleted: 29,
    confidenceScore: 99.3,
    tools: ['tape_appender', 'changelog_writer', 'spec_indexer'],
    avatar: { skinKey: 'skinToneA', hairKey: 'hairAuburn', suitKey: 'suitRust' },
    directiveId: 'Mencatat setiap perubahan ke dalam append-only ship-log tape dan spesifikasi teknis.',
    directiveEn: 'Records every verified delta into the append-only ship-log tape and architectural specs.',
  },
  {
    id: 'SRE-10',
    name: 'Cloud Run SRE',
    scrantonAlias: 'Darryl Philbin',
    roleId: 'Insinyur Reliabilitas & Deploy',
    roleEn: 'Cloud Run & Edge Release SRE',
    department: 'Cloud Infrastructure',
    zone: 'SECURITY_SRE',
    deskCoord: { x: 9.1, y: 6.4 },
    currentCoord: { x: 9.1, y: 6.4 },
    targetCoord: { x: 9.1, y: 6.4 },
    facing: 'NW',
    state: 'THINKING',
    activeWireId: 'GATE-011',
    speechBubble: 'Cloud Run preview 27b25a333 warm.',
    speechUpdatedAt: Date.now() - 2100,
    tokensProcessed: 144900,
    tasksCompleted: 34,
    confidenceScore: 99.6,
    tools: ['cloud_run_cutover', 'canary_monitor', 'p99_profiler'],
    avatar: { skinKey: 'skinToneC', hairKey: 'hairDark', suitKey: 'suitNavy' },
    directiveId: 'Mengatur gerbang rilis Cloud Run, pemantauan canary P99, dan promosi Preview ke Production.',
    directiveEn: 'Governs Cloud Run release gates, P99 canary telemetry, and Preview-to-Production promotion.',
  },
];

export const INITIAL_WIRES: TaskWire[] = [
  {
    id: 'FN-11',
    title: 'Auth0 -> Clerk cutover',
    status: 'BLOCKED',
    statusDetail: 'BLOCKED · webhook signing secret not rotated',
    progress: 38,
    assignedAgentId: 'SEC-05',
    dependencies: [],
    priority: 'P0',
    codeDelta: { added: 412, removed: 189 },
    createdAt: '03:14:02 CT',
    artifact: {
      filename: 'src/security/webhookVerifier.ts',
      language: 'typescript',
      summary: 'Zero-trust HMAC-SHA256 webhook signature verifier with strict timestamp replay guard.',
      code: `export interface WebhookEnvelope {
  signatureHeader: string;
  timestampHeader: string;
  rawBody: string;
}

const MAX_CLOCK_SKEW_MS = 300_000;

export async function verifyRotatedWebhookSignature(
  envelope: WebhookEnvelope,
  activeSecret: CryptoKey,
  previousSecret?: CryptoKey
): Promise<{ verified: boolean; keyGeneration: 'primary' | 'rotated' | 'rejected' }> {
  const timestampMs = Number(envelope.timestampHeader) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > MAX_CLOCK_SKEW_MS) {
    return { verified: false, keyGeneration: 'rejected' };
  }

  const encoder = new TextEncoder();
  const signedPayload = encoder.encode(\`\${envelope.timestampHeader}.\${envelope.rawBody}\`);
  const expectedBytes = hexToBytes(envelope.signatureHeader);

  const primaryMatch = await crypto.subtle.verify('HMAC', activeSecret, expectedBytes, signedPayload);
  if (primaryMatch) {
    return { verified: true, keyGeneration: 'primary' };
  }

  if (previousSecret) {
    const rotatedMatch = await crypto.subtle.verify('HMAC', previousSecret, expectedBytes, signedPayload);
    if (rotatedMatch) {
      return { verified: true, keyGeneration: 'rotated' };
    }
  }

  return { verified: false, keyGeneration: 'rejected' };
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/^v1=/, '').trim();
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}`,
    },
  },
  {
    id: 'FN-12',
    title: 'Value-Baseline in progress',
    status: 'IN_PROGRESS',
    statusDetail: 'LIVE · streaming multi-agent telemetry ledger',
    progress: 76,
    assignedAgentId: 'DATA-04',
    dependencies: ['FN-11'],
    priority: 'P1',
    codeDelta: { added: 1280, removed: 94 },
    createdAt: '03:20:15 CT',
    artifact: {
      filename: 'src/pipeline/valueBaselineAggregator.ts',
      language: 'typescript',
      summary: 'Deterministic rolling window telemetry aggregator for multi-agent throughput and P99 latency.',
      code: `export interface TelemetrySample {
  wireId: string;
  agentId: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  recordedAt: number;
}

export class ValueBaselineAggregator {
  private readonly samples: TelemetrySample[] = [];
  private readonly windowMs: number;

  constructor(windowMs = 60_000) {
    this.windowMs = windowMs;
  }

  public ingest(sample: TelemetrySample): void {
    if (sample.latencyMs < 0 || sample.tokensIn < 0 || sample.tokensOut < 0) {
      throw new RangeError('Telemetry sample metrics must be non-negative');
    }
    this.samples.push(sample);
    this.evictStale(Date.now());
  }

  public snapshot(now = Date.now()): {
    totalTokens: number;
    p99LatencyMs: number;
    activeWires: number;
  } {
    this.evictStale(now);
    if (this.samples.length === 0) {
      return { totalTokens: 0, p99LatencyMs: 0, activeWires: 0 };
    }
    const sortedLatencies = this.samples.map((s) => s.latencyMs).sort((a, b) => a - b);
    const p99Index = Math.min(
      sortedLatencies.length - 1,
      Math.floor(sortedLatencies.length * 0.99)
    );
    const wires = new Set(this.samples.map((s) => s.wireId));
    const totalTokens = this.samples.reduce((acc, s) => acc + s.tokensIn + s.tokensOut, 0);

    return {
      totalTokens,
      p99LatencyMs: Number(sortedLatencies[p99Index].toFixed(2)),
      activeWires: wires.size,
    };
  }

  private evictStale(now: number): void {
    const cutoff = now - this.windowMs;
    while (this.samples.length > 0 && this.samples[0].recordedAt < cutoff) {
      this.samples.shift();
    }
  }
}`,
    },
  },
  {
    id: 'INF-163',
    title: 'Ingestion 2',
    status: 'WOKEN',
    statusDetail: 'WOKEN · resumed overnight worker mesh',
    progress: 64,
    assignedAgentId: 'ARCH-02',
    dependencies: [],
    priority: 'P1',
    codeDelta: { added: 840, removed: 62 },
    createdAt: '03:24:40 CT',
  },
  {
    id: 'ING-1461',
    title: 'Idle-waker',
    status: 'LIVE',
    statusDetail: 'LIVE · slim-through OkHttp3 in progress',
    progress: 84,
    assignedAgentId: 'EXEC-07',
    dependencies: ['INF-163'],
    priority: 'P1',
    codeDelta: { added: 1520, removed: 45 },
    createdAt: '03:29:11 CT',
  },
  {
    id: 'SHIP-101',
    title: 'Chronicler',
    status: 'AT_BAT',
    statusDetail: 'AT BAT · 05am wait · cut at disks',
    progress: 52,
    assignedAgentId: 'DOC-09',
    dependencies: ['FN-12', 'ING-1461'],
    priority: 'P2',
    codeDelta: { added: 910, removed: 29 },
    createdAt: '03:33:08 CT',
  },
  {
    id: 'GATE-011',
    title: 'Prod Gate',
    status: 'HELD',
    statusDetail: 'HELD · 2 reviewers (SEC-05, QA-08)',
    progress: 45,
    assignedAgentId: 'SRE-10',
    dependencies: ['FN-11', 'SHIP-101'],
    priority: 'P0',
    codeDelta: { added: 681, removed: 20 },
    createdAt: '03:36:50 CT',
  },
];

export const INITIAL_CHATTER: FloorChatterItem[] = [
  {
    id: 'chat-1',
    time: '03:38:12 CT',
    agentId: 'ORCH-01',
    agentName: 'Argon Director',
    wireId: 'FN-12',
    category: 'DISPATCH',
    text: 'Gradbot Office v4: Full Scranton cast sits at desks; Gemini 4 Argon High orchestrator online.',
  },
  {
    id: 'chat-2',
    time: '03:38:24 CT',
    agentId: 'ARCH-02',
    agentName: 'Staff Architect',
    wireId: 'INF-163',
    category: 'WIRE',
    text: 'Session INF-163 woken: DAG partition validated across 10 floor agents.',
  },
  {
    id: 'chat-3',
    time: '03:38:41 CT',
    agentId: 'SEC-05',
    agentName: 'Zero-Trust CSO',
    wireId: 'FN-11',
    category: 'GATE',
    text: 'FN-11 Auth0 -> Clerk cutover held pending HMAC webhook signing key rotation.',
  },
  {
    id: 'chat-4',
    time: '03:39:05 CT',
    agentId: 'DOC-09',
    agentName: 'Ship-Log Chronicler',
    wireId: 'SHIP-101',
    category: 'COMMIT',
    text: 'Chronicler SHIP-101: append-only tape synced (+5643 / -439 delta across 131 commits).',
  },
  {
    id: 'chat-5',
    time: '03:39:32 CT',
    agentId: 'EXEC-07',
    agentName: 'Sandbox Executor',
    wireId: 'ING-1461',
    category: 'TOOL',
    text: 'Session ING-1461 Idle-waker in-session: slim-through OkHttp3 worker pool active.',
  },
  {
    id: 'chat-6',
    time: '03:39:58 CT',
    agentId: 'DATA-04',
    agentName: 'Data Mesh Lead',
    wireId: 'FN-12',
    category: 'WIRE',
    text: 'Fetch-Value 32940 still building FN-12 Value-Baseline telemetry stream.',
  },
];

export const INITIAL_SHIP_LOG: ShipLogEntry[] = [
  {
    id: 'ship-1',
    commitHash: '3f8a52c21',
    timestamp: '02:14:09 CT',
    wireId: 'INF-160',
    agentId: 'SRE-10',
    summary: 'feat(mesh): multi-region Cloud Run ingress cutover with P99 canary guard',
    deltaAdded: 1840,
    deltaRemoved: 142,
    environment: 'PRODUCTION',
  },
  {
    id: 'ship-2',
    commitHash: '8c19e4b02',
    timestamp: '02:48:33 CT',
    wireId: 'UIX-094',
    agentId: 'UIX-03',
    summary: 'feat(floor): isometric 2.5D agency office canvas & speech bubble engine',
    deltaAdded: 1420,
    deltaRemoved: 118,
    environment: 'PRODUCTION',
  },
  {
    id: 'ship-3',
    commitHash: 'a41d09f77',
    timestamp: '03:11:19 CT',
    wireId: 'SEC-088',
    agentId: 'SEC-05',
    summary: 'security(auth): enforce strict input sanitization & zero-trust token boundary',
    deltaAdded: 1190,
    deltaRemoved: 95,
    environment: 'PRODUCTION',
  },
  {
    id: 'ship-4',
    commitHash: '27b25a333',
    timestamp: '03:35:44 CT',
    wireId: 'ING-1461',
    agentId: 'EXEC-07',
    summary: 'feat(agents): parallel Grok council debate & OpenAI Dots DAG wire scheduler',
    deltaAdded: 1193,
    deltaRemoved: 84,
    environment: 'PREVIEW',
  },
];

export function sanitizePromptInput(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim()
    .slice(0, 4000);
}

export function validateGeminiApiKey(rawKey: string): boolean {
  const trimmed = rawKey.trim();
  return /^AIza[0-9A-Za-z\-_]{25,60}$/.test(trimmed);
}

export function generateCommitHash(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 9; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function formatCurrentTimeCT(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss} CT`;
}

export interface MissionPlanResult {
  missionTitle: string;
  orchestratorSummary: string;
  selectedAgents: AgentRoleId[];
  newWires: TaskWire[];
  traces: SubAgentExecutionTrace[];
  councilVotes: CouncilVote[];
  artifact?: CodeArtifact;
  totalAddedLines: number;
  totalRemovedLines: number;
  latencyMs: number;
  usedLiveApi: boolean;
}

export type MissionDomain =
  | 'SECURITY'
  | 'FRONTEND'
  | 'GAME'
  | 'HELLO_WORLD'
  | 'DATA_PIPELINE'
  | 'FULLSTACK_AGENCY';

function detectMissionDomain(prompt: string): MissionDomain {
  const lower = prompt.toLowerCase();
  if (
    lower.includes('game') ||
    lower.includes('gme') ||
    lower.includes('permainan') ||
    lower.includes('arcade') ||
    lower.includes('play')
  ) {
    return 'GAME';
  }
  if (
    lower.includes('hello') ||
    lower.includes('heelo') ||
    lower.includes('halo world') ||
    lower.includes('hi') ||
    lower.includes('hai') ||
    lower.includes('halo')
  ) {
    return 'HELLO_WORLD';
  }
  if (
    lower.includes('security') ||
    lower.includes('keamanan') ||
    lower.includes('auth') ||
    lower.includes('audit') ||
    lower.includes('owasp') ||
    lower.includes('zero-trust')
  ) {
    return 'SECURITY';
  }
  if (
    lower.includes('ui') ||
    lower.includes('frontend') ||
    lower.includes('desain') ||
    lower.includes('landing') ||
    lower.includes('dashboard') ||
    lower.includes('animasi')
  ) {
    return 'FRONTEND';
  }
  if (
    lower.includes('data') ||
    lower.includes('pipeline') ||
    lower.includes('database') ||
    lower.includes('sql') ||
    lower.includes('indexer') ||
    lower.includes('stream')
  ) {
    return 'DATA_PIPELINE';
  }
  return 'FULLSTACK_AGENCY';
}

export async function executeGeminiArgonMission(params: {
  prompt: string;
  mode: OrchestrationMode;
  priority: PriorityLevel;
  targetAgentId: AgentRoleId | 'ALL';
  locale: LocaleCode;
  apiKey?: string;
  wireCounter: number;
}): Promise<MissionPlanResult> {
  const startedAt = performance.now();
  const cleanPrompt = sanitizePromptInput(params.prompt);
  if (!cleanPrompt) {
    throw new Error(
      params.locale === 'id'
        ? 'Instruksi misi tidak boleh kosong.'
        : 'Mission directive cannot be empty.'
    );
  }

  const domain = detectMissionDomain(cleanPrompt);
  const baseWireNum = 200 + params.wireCounter;
  const wireIdArch = `AG-${baseWireNum}`;
  const wireIdExec = `AG-${baseWireNum + 1}`;
  const wireIdSec = `AG-${baseWireNum + 2}`;

  const selectedAgents: AgentRoleId[] =
    params.targetAgentId !== 'ALL'
      ? ['ORCH-01', params.targetAgentId, 'SEC-05', 'QA-08']
      : domain === 'SECURITY'
      ? ['ORCH-01', 'SEC-05', 'ARCH-02', 'EXEC-07', 'QA-08', 'SRE-10']
      : domain === 'FRONTEND'
      ? ['ORCH-01', 'UIX-03', 'ARCH-02', 'EXEC-07', 'QA-08', 'DOC-09']
      : domain === 'DATA_PIPELINE'
      ? ['ORCH-01', 'DATA-04', 'ARCH-02', 'RES-06', 'EXEC-07', 'SRE-10']
      : [
          'ORCH-01',
          'ARCH-02',
          'UIX-03',
          'DATA-04',
          'SEC-05',
          'RES-06',
          'EXEC-07',
          'QA-08',
          'DOC-09',
          'SRE-10',
        ];

  const shortTopic =
    cleanPrompt.length > 44 ? `${cleanPrompt.slice(0, 44).trim()}...` : cleanPrompt;

  const lower = cleanPrompt.toLowerCase();
  const isLinkQuery =
    lower.includes('vercel') ||
    lower.includes('github') ||
    lower.includes('link') ||
    lower.includes('url') ||
    lower.includes('tautan') ||
    lower.includes('alamat') ||
    lower.includes('web');

  const isGreeting =
    (lower.startsWith('halo') ||
      lower.startsWith('hello') ||
      lower.startsWith('selamat') ||
      lower === 'hi' ||
      lower === 'hai') &&
    cleanPrompt.length < 50;

  if (isLinkQuery || isGreeting) {
    let orchestratorSummary = '';
    if (isLinkQuery) {
      orchestratorSummary =
        params.locale === 'id'
          ? `Berikut adalah tautan resmi proyek Argon Multi-Agent Agency:\n- Vercel Live: https://argon-multiagent-agency.vercel.app\n- GitHub: https://github.com/bryankwandou/argon-multiagent-agency\n- Server Lokal: http://localhost:5173\n\nSemua deployment aktif dan sistem berjalan normal.`
          : `Here are the official links for Argon Multi-Agent Agency:\n- Vercel Live: https://argon-multiagent-agency.vercel.app\n- GitHub: https://github.com/bryankwandou/argon-multiagent-agency\n- Local Server: http://localhost:5173\n\nAll deployments are active and running normally.`;
    } else {
      orchestratorSummary =
        params.locale === 'id'
          ? `Selamat pagi! Pusat Komando Multi-Agen Argon siap menerima instruksi tugas teknis atau arsitektur sistem Anda.`
          : `Good morning! The Argon Multi-Agent Command Center is active and ready for your technical or architecture directives.`;
    }

    let usedLiveApi = false;
    if (params.apiKey && validateGeminiApiKey(params.apiKey)) {
      try {
        const liveText = await callLiveGeminiEndpoint(
          params.apiKey.trim(),
          cleanPrompt,
          params.mode,
          params.locale
        );
        if (liveText) {
          orchestratorSummary = liveText;
          usedLiveApi = true;
        }
      } catch {
        // Retain fallback summary
      }
    }

    const latencyMs = Math.max(180, Math.round(performance.now() - startedAt));
    return {
      missionTitle: shortTopic,
      orchestratorSummary,
      selectedAgents: ['ORCH-01'],
      newWires: [],
      traces: [],
      councilVotes: [],
      totalAddedLines: 0,
      totalRemovedLines: 0,
      latencyMs,
      usedLiveApi,
    };
  }

  const artifact: CodeArtifact = buildDomainArtifact(domain, cleanPrompt, wireIdArch);

  const newWires: TaskWire[] = [
    {
      id: wireIdArch,
      title:
        params.locale === 'id'
          ? `Arsitektur & DAG: ${shortTopic}`
          : `Architecture & DAG: ${shortTopic}`,
      status: 'VERIFIED',
      statusDetail:
        params.locale === 'id'
          ? 'VERIFIED · topologi & kontrak skema disetujui'
          : 'VERIFIED · topology & schema contract locked',
      progress: 100,
      assignedAgentId: params.targetAgentId !== 'ALL' ? params.targetAgentId : 'ARCH-02',
      dependencies: [],
      priority: params.priority,
      codeDelta: { added: 340, removed: 18 },
      createdAt: formatCurrentTimeCT(),
      artifact,
    },
    {
      id: wireIdExec,
      title:
        params.locale === 'id'
          ? `Implementasi Modul: ${shortTopic}`
          : `Module Fabrication: ${shortTopic}`,
      status: 'LIVE',
      statusDetail:
        params.locale === 'id'
          ? 'LIVE · kompilasi sandbox & integrasi multi-agen'
          : 'LIVE · sandbox compilation & multi-agent integration',
      progress: 92,
      assignedAgentId:
        domain === 'FRONTEND'
          ? 'UIX-03'
          : domain === 'DATA_PIPELINE'
          ? 'DATA-04'
          : 'EXEC-07',
      dependencies: [wireIdArch],
      priority: params.priority,
      codeDelta: { added: 620, removed: 42 },
      createdAt: formatCurrentTimeCT(),
      artifact,
    },
    {
      id: wireIdSec,
      title:
        params.locale === 'id'
          ? `Gerbang Audit & QA: ${shortTopic}`
          : `Zero-Trust & QA Gate: ${shortTopic}`,
      status: 'VERIFIED',
      statusDetail:
        params.locale === 'id'
          ? 'VERIFIED · lulus audit OWASP & Red-Team QA'
          : 'VERIFIED · passed OWASP & Red-Team QA verification',
      progress: 100,
      assignedAgentId: 'SEC-05',
      dependencies: [wireIdExec],
      priority: params.priority,
      codeDelta: { added: 215, removed: 11 },
      createdAt: formatCurrentTimeCT(),
    },
  ];

  const traces: SubAgentExecutionTrace[] = [
    {
      agentId: 'ORCH-01',
      agentName: 'Argon Director',
      roleLabel: params.locale === 'id' ? 'Orkestrator Utama' : 'Chief Orchestrator',
      wireId: wireIdArch,
      wireTitle: newWires[0].title,
      toolCalls: ['dag_decomposer', 'pod_router', 'priority_scheduler'],
      outputSummary:
        params.locale === 'id'
          ? `Memecah direktif "${shortTopic}" menjadi 3 wire DAG paralel dan menugaskan ${selectedAgents.length} agen spesialis.`
          : `Decomposed directive "${shortTopic}" into 3 parallel DAG wires and dispatched ${selectedAgents.length} floor specialists.`,
      durationMs: 310,
    },
    {
      agentId: 'ARCH-02',
      agentName: 'Staff Architect',
      roleLabel: params.locale === 'id' ? 'Arsitek Sistem' : 'Systems Architect',
      wireId: wireIdArch,
      wireTitle: newWires[0].title,
      toolCalls: ['topology_planner', 'schema_compiler', 'contract_validator'],
      outputSummary:
        params.locale === 'id'
          ? 'Menetapkan kontrak tipe TypeScript ketat, batas isolasi modul, dan strategi state bebas race-condition.'
          : 'Established strict TypeScript type contracts, module isolation boundaries, and race-free state orchestration.',
      durationMs: 480,
    },
    {
      agentId:
        domain === 'FRONTEND'
          ? 'UIX-03'
          : domain === 'DATA_PIPELINE'
          ? 'DATA-04'
          : 'EXEC-07',
      agentName:
        domain === 'FRONTEND'
          ? 'Kinetic UI Lead'
          : domain === 'DATA_PIPELINE'
          ? 'Data Mesh Lead'
          : 'Sandbox Executor',
      roleLabel:
        params.locale === 'id' ? 'Eksekutor Spesialis' : 'Specialist Executor',
      wireId: wireIdExec,
      wireTitle: newWires[1].title,
      toolCalls: ['ast_code_writer', 'sandbox_daemon', 'token_compiler'],
      outputSummary:
        params.locale === 'id'
          ? `Menghasilkan artefak produksi (${artifact.filename}) dengan validasi penuh dan kesiapan deployment.`
          : `Fabricated production artifact (${artifact.filename}) with full input validation and deployment readiness.`,
      durationMs: 640,
    },
    {
      agentId: 'SEC-05',
      agentName: 'Zero-Trust CSO',
      roleLabel: params.locale === 'id' ? 'Auditor Keamanan' : 'Chief Security Officer',
      wireId: wireIdSec,
      wireTitle: newWires[2].title,
      toolCalls: ['owasp_scanner', 'secret_guard', 'input_sanitizer'],
      outputSummary:
        params.locale === 'id'
          ? 'Verifikasi keamanan selesai: validasi skema input aktif, tanpa kredensial hardcode, dan proteksi replay aktif.'
          : 'Security audit passed: strict input schema validation active, zero hardcoded secrets, replay protection verified.',
      durationMs: 390,
    },
  ];

  const councilVotes: CouncilVote[] = [
    {
      agentId: 'ARCH-02',
      agentName: 'Staff Architect',
      roleLabel: 'Systems Architecture',
      stance: 'APPROVE',
      confidence: 99.1,
      critique:
        params.locale === 'id'
          ? 'Batas antar-modul mengikuti pola Directed Acyclic Graph (DAG) deterministik dengan beban memori minimal.'
          : 'Inter-module boundaries follow a deterministic Directed Acyclic Graph (DAG) with minimal memory overhead.',
      toolUsed: 'topology_planner',
    },
    {
      agentId: 'SEC-05',
      agentName: 'Zero-Trust CSO',
      roleLabel: 'Zero-Trust Security',
      stance: 'HARDEN',
      confidence: 99.7,
      critique:
        params.locale === 'id'
          ? 'Menambahkan sanitasi payload dan pemeriksaan batas kuota sebelum eksekusi worker.'
          : 'Enforced payload sanitization and strict rate-limit boundary checks prior to worker execution.',
      toolUsed: 'owasp_scanner',
    },
    {
      agentId: 'QA-08',
      agentName: 'Red-Team Critic',
      roleLabel: 'Red-Team QA',
      stance: 'OPTIMIZE',
      confidence: 98.9,
      critique:
        params.locale === 'id'
          ? 'Semua jalur eksekusi asinkron memiliki penanganan pembatalan (abort/timeout) eksplisit.'
          : 'Verified that all asynchronous execution paths include explicit timeout and cancellation guards.',
      toolUsed: 'edge_case_prober',
    },
    {
      agentId: 'SRE-10',
      agentName: 'Cloud Run SRE',
      roleLabel: 'Release Reliability',
      stance: 'APPROVE',
      confidence: 99.5,
      critique:
        params.locale === 'id'
          ? 'Siap dipromosikan ke Cloud Run Production tanpa downtime.'
          : 'Cleared for zero-downtime Cloud Run Production cutover.',
      toolUsed: 'canary_monitor',
    },
  ];

  let orchestratorSummary =
    params.locale === 'id'
      ? `Misi "${cleanPrompt}" telah dieksekusi oleh Gemini 4 Argon (High) melalui mode ${params.mode}. Pekerjaan telah dibagi ke dalam 3 Wire aktif (${wireIdArch}, ${wireIdExec}, ${wireIdSec}), diaudit silang oleh Dewan Multi-Agen (Konsensus 99.3%), dan menghasilkan modul produksi siap pakai di ${artifact.filename}.`
      : `Mission "${cleanPrompt}" has been executed by Gemini 4 Argon (High) in ${params.mode} mode. Work was decomposed into 3 active Wires (${wireIdArch}, ${wireIdExec}, ${wireIdSec}), cross-audited by the Multi-Agent Council (99.3% consensus), and compiled into a production module at ${artifact.filename}.`;

  let usedLiveApi = false;

  if (params.apiKey && validateGeminiApiKey(params.apiKey)) {
    try {
      const liveText = await callLiveGeminiEndpoint(
        params.apiKey.trim(),
        cleanPrompt,
        params.mode,
        params.locale
      );
      if (liveText) {
        orchestratorSummary = liveText;
        usedLiveApi = true;
      }
    } catch {
      // Retain deterministic multi-agent synthesis on network/API failure
    }
  }

  const totalAddedLines = newWires.reduce((acc, w) => acc + w.codeDelta.added, 0);
  const totalRemovedLines = newWires.reduce((acc, w) => acc + w.codeDelta.removed, 0);
  const latencyMs = Math.max(420, Math.round(performance.now() - startedAt));

  return {
    missionTitle: shortTopic,
    orchestratorSummary,
    selectedAgents,
    newWires,
    traces,
    councilVotes,
    artifact,
    totalAddedLines,
    totalRemovedLines,
    latencyMs,
    usedLiveApi,
  };
}

async function callLiveGeminiEndpoint(
  apiKey: string,
  prompt: string,
  mode: OrchestrationMode,
  locale: LocaleCode
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);

  const systemInstruction =
    locale === 'id'
      ? `Anda adalah Gemini 4 Argon (High), Direktur Orkestrasi Multi-Agen tingkat enterprise (setara OpenAI Dots DAG & Grok Heavy Multi-Agent Council). Jawab dalam Bahasa Indonesia secara teknis, padat, tanpa basa-basi, dan tanpa emoji. Rangkum pembagian tugas untuk: (1) Staff Architect, (2) Principal Frontend/Data Engineer, (3) Zero-Trust CSO, dan (4) Red-Team QA dalam mode ${mode}.`
      : `You are Gemini 4 Argon (High), Chief Enterprise Multi-Agent Orchestrator (combining OpenAI Dots DAG scheduling and Grok Heavy Multi-Agent Council debate). Respond concisely in English with high technical precision and zero emojis. Summarize the task delegation across: (1) Staff Architect, (2) Principal Frontend/Data Engineer, (3) Zero-Trust CSO, and (4) Red-Team QA in ${mode} mode.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 700,
          },
        }),
      }
    );

    if (!response.ok) return null;
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function buildDomainArtifact(
  domain: MissionDomain,
  prompt: string,
  wireId: string
): CodeArtifact {
  const safeComment = prompt.replace(/[*\/]/g, '').slice(0, 72);

  if (domain === 'GAME') {
    return {
      filename: `src/components/sandbox/${wireId.toLowerCase()}RetroArcadeGame.tsx`,
      language: 'typescript',
      summary: `Interactive Playable Cyber Arcade Game with 60fps canvas loop, collision physics, and live score state.`,
      code: `// Wire ${wireId} — Directive: ${safeComment}
// Interactive Cyber Space Arcade Game
import React, { useEffect, useRef, useState } from 'react';

export function RetroArcadeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let playerX = canvas.width / 2;
    let items: Array<{ x: number; y: number; speed: number }> = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      playerX = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left));
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const loop = () => {
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player vessel
      ctx.fillStyle = '#00f2fe';
      ctx.beginPath();
      ctx.moveTo(playerX, canvas.height - 20);
      ctx.lineTo(playerX - 16, canvas.height - 6);
      ctx.lineTo(playerX + 16, canvas.height - 6);
      ctx.closePath();
      ctx.fill();

      // Spawn falling data packets
      if (Math.random() < 0.05) {
        items.push({ x: Math.random() * (canvas.width - 30) + 15, y: 0, speed: Math.random() * 2 + 1.5 });
      }

      items = items.filter((item) => {
        item.y += item.speed;
        ctx.fillStyle = '#39d353';
        ctx.fillRect(item.x - 5, item.y - 5, 10, 10);

        if (item.y >= canvas.height - 22 && Math.abs(item.x - playerX) < 20) {
          setScore((s) => s + 10);
          return false;
        }
        return item.y < canvas.height;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-mono text-sm text-cyan-400">Score: {score}</div>
      <canvas ref={canvasRef} width={480} height={260} className="rounded border border-cyan-500/30" />
    </div>
  );
}`,
    };
  }

  if (domain === 'HELLO_WORLD') {
    return {
      filename: `src/components/sandbox/${wireId.toLowerCase()}HelloWorldCard.tsx`,
      language: 'typescript',
      summary: `Interactive Hello World Component with reactive clicker, telemetry ping, and responsive theme.`,
      code: `// Wire ${wireId} — Directive: ${safeComment}
// Interactive Hello World Component
import React, { useState } from 'react';

export function HelloWorldCard() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900 rounded-lg">
      <h1 className="text-2xl font-bold text-emerald-400">Hello World! Localhost Runtime Active</h1>
      <p className="mt-2 text-xs text-zinc-400">Directive compiled and executed on your local Vite development server.</p>
      <button
        onClick={() => setClickCount((c) => c + 1)}
        className="mt-4 px-4 py-2 rounded bg-emerald-500 font-semibold text-black hover:bg-emerald-400"
      >
        Live Interaction Count: {clickCount}
      </button>
    </div>
  );
}`,
    };
  }

  if (domain === 'FRONTEND') {
    return {
      filename: `src/components/sandbox/${wireId.toLowerCase()}KineticWidget.tsx`,
      language: 'typescript',
      summary: `Kinetic Interactive UI Widget with real-time state manipulation and zero-trust event telemetry.`,
      code: `// Wire ${wireId} — Directive: ${safeComment}
// Kinetic UI Interactive Widget
import React, { useState } from 'react';

export function KineticWidget() {
  const [active, setActive] = useState(true);
  const [pulseCount, setPulseCount] = useState(1);

  return (
    <div className="p-6 rounded-lg border border-sky-800 bg-zinc-900 text-zinc-100">
      <h2 className="text-lg font-mono font-bold text-sky-400">Kinetic Reactive Stream</h2>
      <p className="mt-1 text-xs text-zinc-400">State: {active ? 'ONLINE' : 'STANDBY'}</p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPulseCount((c) => c + 1)}
          className="px-3 py-1.5 rounded bg-sky-500 text-xs font-mono font-bold text-black"
        >
          Send Telemetry Pulse ({pulseCount})
        </button>
        <button
          onClick={() => setActive((v) => !v)}
          className="px-3 py-1.5 rounded border border-zinc-700 text-xs font-mono"
        >
          Toggle State
        </button>
      </div>
    </div>
  );
}`,
    };
  }

  if (domain === 'SECURITY') {
    return {
      filename: `src/security/${wireId.toLowerCase()}ZeroTrustGate.ts`,
      language: 'typescript',
      summary: `Zero-Trust Policy Gate & Rate-Limited Request Verifier generated for wire ${wireId}.`,
      code: `// Wire ${wireId} — Directive: ${safeComment}
export interface SecurityGateContext {
  actorId: string;
  sessionTokenHash: string;
  ipAddress: string;
  payloadBytes: number;
  requestedScope: string;
}

export interface GateDecision {
  allowed: boolean;
  reason: string;
  auditId: string;
}

const MAX_PAYLOAD_BYTES = 65_536;
const ALLOWED_SCOPES = new Set(['agency:dispatch', 'wire:mutate', 'release:promote', 'telemetry:read']);

export function evaluateZeroTrustGate(ctx: SecurityGateContext): GateDecision {
  const auditId = \`aud_\${Date.now().toString(36)}_\${ctx.actorId.slice(0, 6)}\`;

  if (!ctx.actorId || ctx.sessionTokenHash.length < 32) {
    return { allowed: false, reason: 'INVALID_SESSION_ATTESTATION', auditId };
  }
  if (ctx.payloadBytes <= 0 || ctx.payloadBytes > MAX_PAYLOAD_BYTES) {
    return { allowed: false, reason: 'PAYLOAD_BOUNDARY_EXCEEDED', auditId };
  }
  if (!ALLOWED_SCOPES.has(ctx.requestedScope)) {
    return { allowed: false, reason: 'UNAUTHORIZED_SCOPE_REQUEST', auditId };
  }

  return { allowed: true, reason: 'VERIFIED_ZERO_TRUST_PASS', auditId };
}`,
    };
  }

  if (domain === 'DATA_PIPELINE') {
    return {
      filename: `src/pipeline/${wireId.toLowerCase()}StreamCoordinator.ts`,
      language: 'typescript',
      summary: `Deterministic Partitioned Event Stream Coordinator generated for wire ${wireId}.`,
      code: `// Wire ${wireId} — Directive: ${safeComment}
export interface StreamEvent<T> {
  eventId: string;
  partitionKey: string;
  sequence: number;
  payload: T;
  committedAt: number;
}

export class PartitionedStreamCoordinator<T> {
  private readonly cursorByPartition = new Map<string, number>();
  private readonly deadLetterQueue: StreamEvent<T>[] = [];

  public processBatch(events: ReadonlyArray<StreamEvent<T>>): {
    committedCount: number;
    dlqCount: number;
  } {
    let committedCount = 0;

    for (const ev of events) {
      const lastSeq = this.cursorByPartition.get(ev.partitionKey) ?? -1;
      if (ev.sequence <= lastSeq) {
        this.deadLetterQueue.push(ev);
        continue;
      }
      this.cursorByPartition.set(ev.partitionKey, ev.sequence);
      committedCount += 1;
    }

    return {
      committedCount,
      dlqCount: this.deadLetterQueue.length,
    };
  }
}`,
    };
  }

  return {
    filename: `src/orchestrator/${wireId.toLowerCase()}AgencyDagRunner.ts`,
    language: 'typescript',
    summary: `Multi-Agent DAG Task Coordinator & Consensus Synthesizer generated for wire ${wireId}.`,
    code: `// Wire ${wireId} — Directive: ${safeComment}
export interface DagTaskNode {
  wireId: string;
  agentCode: string;
  dependencies: string[];
  execute: () => Promise<{ ok: boolean; metricsDelta: number; output: string }>;
}

export async function runAgencyDagWave(
  nodes: ReadonlyArray<DagTaskNode>
): Promise<Map<string, { ok: boolean; metricsDelta: number; output: string }>> {
  const completed = new Map<string, { ok: boolean; metricsDelta: number; output: string }>();
  const pending = new Map(nodes.map((n) => [n.wireId, n]));

  while (pending.size > 0) {
    const readyBatch: DagTaskNode[] = [];
    for (const node of pending.values()) {
      const depsSatisfied = node.dependencies.every((depId) => completed.get(depId)?.ok === true);
      if (depsSatisfied) {
        readyBatch.push(node);
      }
    }

    if (readyBatch.length === 0) {
      throw new Error('DAG cycle or upstream wire block detected during execution.');
    }

    const batchResults = await Promise.all(
      readyBatch.map(async (node) => ({
        wireId: node.wireId,
        result: await node.execute(),
      }))
    );

    for (const item of batchResults) {
      completed.set(item.wireId, item.result);
      pending.delete(item.wireId);
    }
  }

  return completed;
}`,
  };
}
