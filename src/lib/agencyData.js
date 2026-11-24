export const WAYPOINTS = {
  BREAKROOM: [
    { x: 5.5, y: 1.8 },
    { x: 6.4, y: 2.3 },
    { x: 7.2, y: 1.9 }
  ],
  CONFERENCE: [
    { x: 8.2, y: 8.0 },
    { x: 8.9, y: 7.7 },
    { x: 9.4, y: 8.2 },
    { x: 8.5, y: 8.6 },
    { x: 7.7, y: 8.3 }
  ]
};

export const INITIAL_AGENTS = [
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
    directiveEn: 'Decomposes complex missions into parallel DAG task wires and synthesizes final deliverables.'
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
    directiveEn: 'Designs distributed system topology, strict API contracts, and resilient data schemas.'
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
    directiveEn: 'Builds high-precision React/TypeScript interfaces with centralized light/dark design tokens.'
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
    directiveId: 'Mengelola pipeline telemetri real-time, replikasi state, dan konsistensi database Neon.',
    directiveEn: 'Manages real-time telemetry pipelines, state replication, and Neon transactional consistency.'
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
    directiveEn: 'Validates all inputs, enforces OWASP Top 10 defenses, and audits cryptographic key rotation.'
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
    directiveEn: 'Executes deep technical research synthesis, competitive mapping, and benchmark verification.'
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
    directiveEn: 'Writes clean production code with zero placeholders and executes isolated sandbox builds.'
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
    directiveEn: 'Probes edge cases, challenges peer agent assumptions in Council debates, and verifies test suites.'
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
    directiveEn: 'Records every verified delta into the append-only ship-log tape and architectural specs.'
  },
  {
    id: 'SRE-10',
    name: 'Edge Release SRE',
    scrantonAlias: 'Darryl Philbin',
    roleId: 'Insinyur Reliabilitas & Deploy',
    roleEn: 'Edge Compute & Release SRE',
    department: 'Edge Infrastructure',
    zone: 'SECURITY_SRE',
    deskCoord: { x: 9.1, y: 6.4 },
    currentCoord: { x: 9.1, y: 6.4 },
    targetCoord: { x: 9.1, y: 6.4 },
    facing: 'NW',
    state: 'THINKING',
    activeWireId: 'GATE-011',
    speechBubble: 'Edge preview 27b25a333 warm.',
    speechUpdatedAt: Date.now() - 2100,
    tokensProcessed: 144900,
    tasksCompleted: 34,
    confidenceScore: 99.6,
    tools: ['edge_cutover', 'canary_monitor', 'p99_profiler'],
    avatar: { skinKey: 'skinToneC', hairKey: 'hairDark', suitKey: 'suitNavy' },
    directiveId: 'Mengatur gerbang rilis edge, pemantauan canary P99, dan promosi Preview ke Production.',
    directiveEn: 'Governs edge release gates, P99 canary telemetry, and Preview-to-Production promotion.'
  }
];

export const INITIAL_WIRES = [
  {
    id: 'FN-11',
    title: 'Auth0 -> Clerk cutover',
    status: 'BLOCKED',
    detail: 'BLOCKED · webhook signing secret not rotated',
    moment: 38,
    assignedAgentId: 'SEC-05',
    dependencies: [],
    priority: 'P0',
    deltaAdded: 412,
    deltaRemoved: 189,
    createdAt: '03:14:02 CT',
    artifact: {
      filename: 'src/security/webhookVerifier.ts',
      language: 'typescript',
      wireId: 'FN-11',
      summary: 'Dual-key HMAC-SHA256 webhook signature verifier with 5-minute clock-skew protection.',
      code: `export interface WebhookEnvelope {\n  readonly payload: string;\n  readonly timestampMs: number;\n  readonly signatureHex: string;\n}\n\nconst MAX_CLOCK_SKEW_MS = 300_000;\n\nexport async function verifyRotatedWebhookSignature(\n  envelope: WebhookEnvelope,\n  activeSecret: CryptoKey,\n  previousSecret?: CryptoKey\n): Promise<boolean> {\n  if (Math.abs(Date.now() - envelope.timestampMs) > MAX_CLOCK_SKEW_MS) {\n    return false;\n  }\n  const data = new TextEncoder().encode(\`\${envelope.timestampMs}.\${envelope.payload}\`);\n  const sigBytes = hexToBytes(envelope.signatureHex);\n  if (await crypto.subtle.verify('HMAC', activeSecret, sigBytes, data)) return true;\n  if (previousSecret) {\n    return crypto.subtle.verify('HMAC', previousSecret, sigBytes, data);\n  }\n  return false;\n}\n\nfunction hexToBytes(hex: string): Uint8Array {\n  const out = new Uint8Array(hex.length / 2);\n  for (let i = 0; i < out.length; i++) {\n    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);\n  }\n  return out;\n}`
    }
  },
  {
    id: 'FN-12',
    title: 'Value-Baseline in progress',
    status: 'IN_PROGRESS',
    detail: 'LIVE · streaming multi-agent telemetry ledger',
    moment: 76,
    assignedAgentId: 'DATA-04',
    dependencies: ['FN-11'],
    priority: 'P1',
    deltaAdded: 1280,
    deltaRemoved: 94,
    createdAt: '03:20:15 CT',
    artifact: {
      filename: 'src/pipeline/valueBaselineAggregator.ts',
      language: 'typescript',
      wireId: 'FN-12',
      summary: 'Rolling 60-second P99 telemetry ledger aggregator for Neon stream replication.',
      code: `export interface MetricSample {\n  readonly wireId: string;\n  readonly latencyMs: number;\n  readonly observedAt: number;\n}\n\nexport class ValueBaselineAggregator {\n  private readonly windowMs = 60_000;\n  private samples: MetricSample[] = [];\n\n  public ingest(sample: MetricSample): void {\n    const cutoff = Date.now() - this.windowMs;\n    this.samples.push(sample);\n    this.samples = this.samples.filter(s => s.observedAt >= cutoff);\n  }\n\n  public p99Latency(): number {\n    if (this.samples.length === 0) return 0;\n    const sorted = this.samples.map(s => s.latencyMs).sort((a, b) => a - b);\n    const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99));\n    return sorted[idx];\n  }\n}`
    }
  },
  {
    id: 'INF-163',
    title: 'Ingestion 2',
    status: 'WOKEN',
    detail: 'WOKEN · resumed overnight worker mesh',
    moment: 64,
    assignedAgentId: 'ARCH-02',
    dependencies: [],
    priority: 'P1',
    deltaAdded: 840,
    deltaRemoved: 62,
    createdAt: '03:24:40 CT'
  },
  {
    id: 'ING-1461',
    title: 'Idle-waker',
    status: 'LIVE',
    detail: 'LIVE · slim-through OkHttp3 in progress',
    moment: 84,
    assignedAgentId: 'EXEC-07',
    dependencies: ['INF-163'],
    priority: 'P1',
    deltaAdded: 1520,
    deltaRemoved: 45,
    createdAt: '03:29:11 CT'
  },
  {
    id: 'SHIP-101',
    title: 'Chronicler',
    status: 'AT_BAT',
    detail: 'AT BAT · 05am wait · cut at disks',
    moment: 52,
    assignedAgentId: 'DOC-09',
    dependencies: ['FN-12', 'ING-1461'],
    priority: 'P2',
    deltaAdded: 910,
    deltaRemoved: 29,
    createdAt: '03:33:08 CT'
  },
  {
    id: 'GATE-011',
    title: 'Prod Gate',
    status: 'HELD',
    detail: 'HELD · 2 reviewers (SEC-05, QA-08)',
    moment: 45,
    assignedAgentId: 'SRE-10',
    dependencies: ['FN-11', 'SHIP-101'],
    priority: 'P0',
    deltaAdded: 681,
    deltaRemoved: 20,
    createdAt: '03:36:50 CT'
  }
];

export const INITIAL_SHIP_LOG = [
  {
    id: 'ship-1',
    hash: '3f8a52c21',
    time: '02:14:09 CT',
    wireId: 'INF-160',
    agentId: 'SRE-10',
    message: 'feat(mesh): multi-region edge ingress cutover with P99 canary guard',
    delta: '+1840/-142',
    stage: 'PRODUCTION'
  },
  {
    id: 'ship-2',
    hash: '8c19e4b02',
    time: '02:48:33 CT',
    wireId: 'UIX-094',
    agentId: 'UIX-03',
    message: 'feat(floor): isometric 3D depth agency canvas & 1280-particle engine',
    delta: '+1420/-118',
    stage: 'PRODUCTION'
  },
  {
    id: 'ship-3',
    hash: 'a41d09f77',
    time: '03:11:19 CT',
    wireId: 'SEC-088',
    agentId: 'SEC-05',
    message: 'security(auth): enforce strict Neon RBAC & zero-trust HS256 boundary',
    delta: '+1190/-95',
    stage: 'PRODUCTION'
  },
  {
    id: 'ship-4',
    hash: '27b25a333',
    time: '03:35:44 CT',
    wireId: 'ING-1461',
    agentId: 'EXEC-07',
    message: 'feat(agents): parallel Grok council debate & OpenAI Dots DAG wire scheduler',
    delta: '+1193/-84',
    stage: 'PREVIEW'
  }
];

export const INITIAL_CHATTER = [
  { id: 'chat-1', agentId: 'ORCH-01', tag: 'DISPATCH', time: '03:36:52', text: 'Routing parallel DAG wires across 10 specialists via Neon Hydrogen.' },
  { id: 'chat-2', agentId: 'ARCH-02', tag: 'WIRE', time: '03:36:58', text: 'INF-163 topology graph verified; zero circular dependencies.' },
  { id: 'chat-3', agentId: 'SEC-05', tag: 'GATE', time: '03:37:04', text: 'Holding FN-11 pending dual-key HMAC webhook rotation verification.' },
  { id: 'chat-4', agentId: 'DOC-09', tag: 'COMMIT', time: '03:37:11', text: 'Appended verified delta 27b25a333 to immutable ship-log tape.' },
  { id: 'chat-5', agentId: 'EXEC-07', tag: 'TOOL', time: '03:37:19', text: 'Compiled OkHttp3 slim worker & 120fps canvas runtime in sandbox.' },
  { id: 'chat-6', agentId: 'DATA-04', tag: 'WIRE', time: '03:37:26', text: 'Neon PostgreSQL replication latency steady under 45ms.' }
];

export const MISSION_PRESETS = {
  id: [
    'Buat arsitektur payment API zero-trust & audit keamanan OWASP',
    'Bangun Cyber Packet Runner arcade game interaktif 120fps di Sandbox',
    'Susun manual arsitektur buku digital interaktif untuk tim agensi',
    'Jalankan optimasi pipeline Neon Hydrogen & debat konsensus Dewan Grok'
  ],
  en: [
    'Architect zero-trust payment API & run full OWASP audit',
    'Build 120fps Cyber Packet Runner interactive arcade game in Sandbox',
    'Compile interactive digital architecture book reader manual',
    'Execute Neon Hydrogen pipeline optimization & Grok Council consensus'
  ]
};

export const LOCALES = {
  id: {
    brand: {
      name: 'Argon Multi-Agent Agency',
      modelBadge: 'GEMINI 4 ARGON HIGH',
      neonBadge: 'NEON HYDROGEN xHIGH',
      subtitle: 'WORKSTATION AGENSI MULTI-AGEN · OPENAI DOTS DAG + DEWAN GROK'
    },
    tabs: {
      floor: 'Lantai Agensi 3D',
      dots: 'OpenAI Dots DAG',
      council: 'Dewan Grok',
      artifacts: 'Artefak & Tape'
    },
    controls: {
      apiLive: 'API: LANGSUNG',
      aiCore: 'PRO CREDIT: AKTIF',
      switchLang: 'Ganti bahasa tampilan',
      switchTheme: 'Ganti mode warna gelap atau terang',
      promote: 'Promosi',
      unblock: 'Buka',
      inspect: 'Inspeksi',
      councilSummon: 'Panggil Dewan',
      councilReturn: 'Kembali ke Meja',
      runDagWave: 'Jalankan Gelombang DAG',
      copyCode: 'Salin Kode',
      copied: 'Tersalin',
      openSandbox: 'Buka Sandbox',
      dispatch: 'Kirim',
      downloadExe: 'Unduh Desktop .EXE'
    },
    sidebar: {
      clusterTitle: 'CLUSTER',
      clusterMesh: 'ARGON EDGE MESH',
      prodTitle: 'PRODUCTION',
      prodSub: 'LIVE staging',
      previewTitle: 'PREVIEW',
      previewUnconfirmed: 'unconfirmed',
      previewVerified: 'verified ready',
      previewHeld: 'HELD on Edge Gate',
      previewSynced: 'SYNCED on Edge Gate',
      workforceTitle: 'WORKFORCE · REALTIME TELEMETRY',
      agentsOnFloor: 'AGENTS ON FLOOR',
      workBotTime: 'WORK BOT TIME',
      keepAlive: '100% keep-alive',
      codeDelta: 'CODE DELTA',
      commitsSinceMidnight: 'commits since cycle start',
      shipLog: 'SHIP-LOG',
      appendOnlyTape: 'append-only tape',
      wiresHeader: 'WIRES — Moment bars, not % complete',
      wiresLive: 'WIRES LIVE',
      floorChatter: 'FLOOR CHATTER'
    },
    chat: {
      header: 'GEMINI 4 ARGON (HIGH) · LIVE CHAT',
      readyBadge: 'MULTI-AGENT READY',
      modeAutoDag: 'DOTS AUTO-DAG',
      modeGrokCouncil: 'DEWAN GROK',
      modeDirect: 'POD LANGSUNG',
      targetLabel: 'Target:',
      allAgency: '@Semua-Agensi (10 Agen)',
      placeholder: 'Perintahkan Gemini 4 Argon High & Neon Hydrogen untuk membagi tugas ke agensi...',
      executing: 'Gemini 4 Argon (High) + Neon Hydrogen sedang mengorkestrasi agen di lantai...',
      userSender: 'DIREKTIF EKSEKUTIF (ANDA)',
      tracesHeader: 'JEJAK EKSEKUSI SUB-AGEN PARALEL (OPENAI DOTS)',
      councilHeader: 'KONSENSUS DEWAN MULTI-AGEN GROK'
    },
    engineModal: {
      title: 'Konfigurasi Mesin Gemini 4 Argon (High) + Antigravity Pro Bridge',
      description: 'Mesin Orkestrasi Multi-Agen bawaan aktif langsung menggunakan Antigravity Pro Plan Credit (tanpa perlu API key). Opsional: masukkan kunci Google Gemini API jika ingin mengaktifkan direct streaming tambahan di RAM sesi ini.',
      keyLabel: 'KUNCI API GOOGLE GEMINI (OPSIONAL)'
    }
  },
  en: {
    brand: {
      name: 'Argon Multi-Agent Agency',
      modelBadge: 'GEMINI 4 ARGON HIGH',
      neonBadge: 'NEON HYDROGEN xHIGH',
      subtitle: 'MULTI-AGENT AGENCY WORKSTATION · OPENAI DOTS DAG + GROK COUNCIL'
    },
    tabs: {
      floor: '3D Agency Floor',
      dots: 'OpenAI Dots DAG',
      council: 'Grok Council',
      artifacts: 'Artifacts & Tape'
    },
    controls: {
      apiLive: 'API: LIVE',
      aiCore: 'PRO CREDIT: LIVE',
      switchLang: 'Switch interface language',
      switchTheme: 'Toggle dark or light color mode',
      promote: 'Promote',
      unblock: 'Unblock',
      inspect: 'Inspect',
      councilSummon: 'Council Sync',
      councilReturn: 'Return to Desks',
      runDagWave: 'Run DAG Wave',
      copyCode: 'Copy Code',
      copied: 'Copied',
      openSandbox: 'Open Sandbox',
      dispatch: 'Dispatch',
      downloadExe: 'Download Desktop .EXE'
    },
    sidebar: {
      clusterTitle: 'CLUSTER',
      clusterMesh: 'ARGON EDGE MESH',
      prodTitle: 'PRODUCTION',
      prodSub: 'LIVE staging',
      previewTitle: 'PREVIEW',
      previewUnconfirmed: 'unconfirmed',
      previewVerified: 'verified ready',
      previewHeld: 'HELD on Edge Gate',
      previewSynced: 'SYNCED on Edge Gate',
      workforceTitle: 'WORKFORCE · REALTIME TELEMETRY',
      agentsOnFloor: 'AGENTS ON FLOOR',
      workBotTime: 'WORK BOT TIME',
      keepAlive: '100% keep-alive',
      codeDelta: 'CODE DELTA',
      commitsSinceMidnight: 'commits since cycle start',
      shipLog: 'SHIP-LOG',
      appendOnlyTape: 'append-only tape',
      wiresHeader: 'WIRES — Moment bars, not % complete',
      wiresLive: 'WIRES LIVE',
      floorChatter: 'FLOOR CHATTER'
    },
    chat: {
      header: 'GEMINI 4 ARGON (HIGH) · LIVE CHAT',
      readyBadge: 'MULTI-AGENT READY',
      modeAutoDag: 'DOTS AUTO-DAG',
      modeGrokCouncil: 'GROK COUNCIL',
      modeDirect: 'DIRECT POD',
      targetLabel: 'Target:',
      allAgency: '@Full-Agency (10 Agents)',
      placeholder: 'Command Gemini 4 Argon High & Neon Hydrogen to delegate agency tasks...',
      executing: 'Gemini 4 Argon (High) + Neon Hydrogen orchestrating floor agents & DAG wires...',
      userSender: 'EXECUTIVE DIRECTIVE (YOU)',
      tracesHeader: 'PARALLEL SUB-AGENT TRACES (OPENAI DOTS)',
      councilHeader: 'GROK MULTI-AGENT COUNCIL CONSENSUS'
    },
    engineModal: {
      title: 'Gemini 4 Argon (High) + Antigravity Pro Bridge Configuration',
      description: 'Built-in multi-agent orchestration runs directly on Antigravity Pro Plan Credits (no API key required). Optionally enter a session Google Gemini API key below (stored only in volatile session RAM).',
      keyLabel: 'GOOGLE GEMINI API KEY (OPTIONAL)'
    }
  }
};

export const BOOK_CHAPTERS = [
  {
    id: 'ch-01',
    titleId: 'Bab 1: Orkestrasi DAG Paralel 10-Agen',
    titleEn: 'Chapter 1: 10-Agent Parallel DAG Orchestration',
    bodyId: 'Arsitektur Argon Multi-Agent Agency memecah direktif tingkat tinggi menjadi graf berarah asiklik (DAG). Agen ORCH-01 (Argon Director) mendistribusikan beban kerja ke sembilan spesialis pada lantai spasial 3D tanpa kebuntuan dependensi.',
    bodyEn: 'Argon Multi-Agent Agency decomposes high-level directives into an acyclic execution graph (DAG). ORCH-01 (Argon Director) routes parallel tasks across nine floor specialists with deterministic dependency verification.'
  },
  {
    id: 'ch-02',
    titleId: 'Bab 2: Jembatan Antigravity MCP & Neon Hydrogen',
    titleEn: 'Chapter 2: Antigravity MCP Bridge & Neon Hydrogen',
    bodyId: 'Seluruh status sesi, persetujuan akun oleh Master Admin, dan ship-log disimpan secara transaksional di Neon PostgreSQL. Sub-agen Neon Hydrogen xHigh terhubung melalui protokol MCP JSON-RPC 2.0 menggunakan jalur kredit Pro Plan.',
    bodyEn: 'Session authorization, Master Admin account approvals, and append-only ship-logs persist transactionally in Neon PostgreSQL. Neon Hydrogen xHigh connects via the MCP JSON-RPC 2.0 bridge on the Pro Plan credit channel.'
  },
  {
    id: 'ch-03',
    titleId: 'Bab 3: Dewan Konsensus & Audit Zero-Trust',
    titleEn: 'Chapter 3: Grok Consensus Council & Zero-Trust Audit',
    bodyId: 'Sebelum setiap gerbang rilis dibuka, agen SEC-05 (Zero-Trust CSO) dan QA-08 (Red-Team Critic) menjalankan pemindaian batas input, validasi kriptografi HS256, dan uji regresi performa 120fps.',
    bodyEn: 'Before any release gate promotes to Production, SEC-05 (Zero-Trust CSO) and QA-08 (Red-Team Critic) enforce strict input validation, HS256 token pinning, and 120fps regression budgets.'
  },
  {
    id: 'ch-04',
    titleId: 'Bab 4: Kinetika 3D Depth & Klien Desktop',
    titleEn: 'Chapter 4: 3D Depth Kinetics & Desktop Client',
    bodyId: 'Mesin render hybrid tiga lapis memanfaatkan OffscreenCanvas untuk geometri statis, proyeksi 3D dinamis untuk meja dan rak server, serta 1.280 partikel kinetik berbasis Float32Array. Klien desktop Windows tersedia langsung untuk sinkronisasi lokal.',
    bodyEn: 'The three-layer hybrid renderer pairs OffscreenCanvas static geometry with dynamic 3D extruded desks, server racks, volumetric light cones, and 1,280 Float32Array kinetic particles alongside the Windows desktop installer.'
  }
];

