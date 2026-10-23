import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Cpu,
  Gamepad2,
  GitBranch,
  GitCommit,
  Globe,
  KeyRound,
  Layers,
  Moon,
  Network,
  Play,
  Send,
  ShieldCheck,
  Sun,
  Terminal,
  Unlock,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';
import type {
  AgencyAgent,
  AgencyChatMessage,
  AgentRoleId,
  FloorChatterItem,
  OrchestrationMode,
  PriorityLevel,
  ShipLogEntry,
  TaskWire,
} from '../types/agency';
import {
  INITIAL_AGENTS,
  INITIAL_CHATTER,
  INITIAL_SHIP_LOG,
  INITIAL_WIRES,
  ROOM_WAYPOINTS,
  executeGeminiArgonMission,
  formatCurrentTimeCT,
  generateCommitHash,
  sanitizePromptInput,
  validateGeminiApiKey,
} from '../services/geminiArgonEngine';
import { IsometricOfficeCanvas } from './IsometricOfficeCanvas';
import { InteractiveSandboxRunner } from './InteractiveSandboxRunner';

type CenterTab = 'FLOOR' | 'DOTS_DAG' | 'GROK_COUNCIL' | 'ARTIFACTS';

const IDLE_SPEECH_POOL_ID: Record<AgentRoleId, string[]> = {
  'ORCH-01': [
    'Menyinkronkan graf DAG lintas 10 agen lantai.',
    'Gemini 4 Argon High memantau antrean P0.',
    'Meninjau alokasi pod arsitektur & keamanan.',
  ],
  'ARCH-02': [
    'Memvalidasi kontrak skema INF-163.',
    'Topologi konsensus terdistribusi terkunci.',
    'Latensi antar-node di bawah 4.2ms.',
  ],
  'UIX-03': [
    'Token warna gelap/terang tersinkronisasi.',
    'Render kanvas isometrik stabil 60fps.',
    'Memeriksa rasio kontras WCAG AA+.',
  ],
  'DATA-04': [
    'Aliran Value-Baseline FN-12 bersih 99.98%.',
    'Mengindeks partisi telemetri real-time.',
    'Window agregator P99 diperbarui.',
  ],
  'SEC-05': [
    'Menahan FN-11 sampai kunci webhook dirotasi.',
    'Memindai batas payload & sanitasi input.',
    'Zero-trust attestation diverifikasi.',
  ],
  'RES-06': [
    'Info Note: mengindeks vektor korpus aktif.',
    'Membandingkan tolok ukur latensi multi-agen.',
    'Peta sitasi arsitektur diperbarui.',
  ],
  'EXEC-07': [
    'Worker OkHttp3 ING-1461 terkompilasi.',
    'Menjalankan verifikasi AST di sandbox.',
    'Delta kode bersih tanpa regresi.',
  ],
  'QA-08': [
    'Toleransi regresi nol pada GATE-011.',
    'Menguji batas timeout & pembatalan asinkron.',
    'Semua asersi Red-Team lulus.',
  ],
  'DOC-09': [
    'Catatan ship-log prioritas rendah ditambahkan.',
    'Pita rilis append-only tersinkronisasi.',
    'Mendokumentasikan perubahan skema DAG.',
  ],
  'SRE-10': [
    'Preview Cloud Run 27b25a333 siap promosi.',
    'Memantau metrik canary P99 di 14 zona edge.',
    'Gerbang produksi menunggu persetujuan akhir.',
  ],
};

const IDLE_SPEECH_POOL_EN: Record<AgentRoleId, string[]> = {
  'ORCH-01': [
    'Routing DAG wires across 10 floor specialists.',
    'Gemini 4 Argon High scanning P0 queue.',
    'Rebalancing architecture and security pods.',
  ],
  'ARCH-02': [
    'INF-163 ingestion topology locked.',
    'Distributed consensus schema verified.',
    'Inter-node hop latency under 4.2ms.',
  ],
  'UIX-03': [
    '120fps token matrix synced.',
    'Isometric floor buffer locked at 60fps.',
    'WCAG AA+ contrast boundaries verified.',
  ],
  'DATA-04': [
    'Value-Baseline stream 99.98% clean.',
    'Indexing partitioned telemetry ledger.',
    'Rolling P99 window flushed cleanly.',
  ],
  'SEC-05': [
    'Holding FN-11 until webhook secret rotates.',
    'Scanning payload boundaries & input schema.',
    'Zero-trust attestation verified.',
  ],
  'RES-06': [
    'Info Note: indexing live corpus vectors.',
    'Benchmarking multi-agent throughput curves.',
    'Citation graph synced with latest RFC.',
  ],
  'EXEC-07': [
    'Slim-through OkHttp3 worker compiled.',
    'Running isolated AST verification pass.',
    'Sandbox diff clean with zero warnings.',
  ],
  'QA-08': [
    'Zero regression tolerance on GATE-011.',
    'Probing async cancellation & timeout edges.',
    'All Red-Team property assertions green.',
  ],
  'DOC-09': [
    'Low-prio ship-log note appended.',
    'Append-only release tape synchronized.',
    'Indexing DAG architectural changelog.',
  ],
  'SRE-10': [
    'Cloud Run preview 27b25a333 warm.',
    'Canary P99 stable across 14 edge zones.',
    'Prod gate standing by for promotion.',
  ],
};

export function MultiAgentAgencyView() {
  const { theme, toggleTheme, locale, toggleLocale, t } = useAppSettings();

  const [agents, setAgents] = useState<AgencyAgent[]>(INITIAL_AGENTS);
  const [wires, setWires] = useState<TaskWire[]>(INITIAL_WIRES);
  const [chatter, setChatter] = useState<FloorChatterItem[]>(INITIAL_CHATTER);
  const [shipLog, setShipLog] = useState<ShipLogEntry[]>(INITIAL_SHIP_LOG);

  const [selectedAgentId, setSelectedAgentId] = useState<AgentRoleId>('ORCH-01');
  const [selectedWireId, setSelectedWireId] = useState<string>('FN-12');
  const [centerTab, setCenterTab] = useState<CenterTab>('FLOOR');
  const [showDagLinks, setShowDagLinks] = useState(true);
  const [councilActive, setCouncilActive] = useState(false);

  const [prodCommit, setProdCommit] = useState('3f8a52c21');
  const [previewCommit, setPreviewCommit] = useState('27b25a333');
  const [previewHeld, setPreviewHeld] = useState(true);
  const [codeAdded, setCodeAdded] = useState(5643);
  const [codeRemoved, setCodeRemoved] = useState(439);
  const [commitCount, setCommitCount] = useState(131);
  const [uptimeSeconds, setUptimeSeconds] = useState(234 * 60 + 18);
  const [clockCT, setClockCT] = useState(formatCurrentTimeCT());
  const [liveIngest, setLiveIngest] = useState(124820);
  const [liveRpm, setLiveRpm] = useState(32943);
  const [liveFetch, setLiveFetch] = useState(32940);
  const [liveDagNodes, setLiveDagNodes] = useState(1237);

  const [floatingToastExpanded, setFloatingToastExpanded] = useState(true);

  const [chatInput, setChatInput] = useState('');
  const [orchestrationMode, setOrchestrationMode] = useState<OrchestrationMode>('AUTO_DAG');
  const [priority, setPriority] = useState<PriorityLevel>('P0');
  const [targetAgent, setTargetAgent] = useState<AgentRoleId | 'ALL'>('ALL');
  const [isExecutingMission, setIsExecutingMission] = useState(false);
  const [wireCounter, setWireCounter] = useState(1);
  const [copiedArtifactId, setCopiedArtifactId] = useState<string | null>(null);

  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const [messages, setMessages] = useState<AgencyChatMessage[]>(() => [
    {
      id: 'msg-init-1',
      sender: 'ORCHESTRATOR',
      agentId: 'ORCH-01',
      agentName: 'Argon Director',
      roleLabel: 'Gemini 4 Argon (High) · Chief Orchestrator',
      timestamp: '03:40:00 CT',
      mode: 'AUTO_DAG',
      priority: 'P0',
      modelBadge: 'Gemini 4 Argon (High)',
      content:
        locale === 'id'
          ? 'Sistem Agensi Multi-Agen Antigravity Argon aktif. 10 spesialis lantai berada di posisi (ORCH-01 hingga SRE-10). Kirimkan instruksi misi di bawah untuk memecah tugas secara otomatis ke dalam graf OpenAI Dots (WIRES), memicu debat silang Dewan Grok di Ruang Konferensi, dan menghasilkan kode produksi.'
          : 'Antigravity Argon Multi-Agent Agency Floor is online. All 10 specialist agents (ORCH-01 through SRE-10) are stationed on the floor. Dispatch any mission below to decompose tasks into OpenAI Dots DAG wires, summon Grok Council cross-critique in the Conference Room, and fabricate production code.',
      decomposedWires: ['FN-11', 'FN-12', 'INF-163', 'ING-1461', 'SHIP-101', 'GATE-011'],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isExecutingMission]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setUptimeSeconds((s) => s + 2);
      setClockCT(formatCurrentTimeCT());
      setLiveIngest((v) => v + Math.floor(Math.random() * 45));
      setLiveRpm((v) => v + Math.floor(Math.random() * 14) - 4);
      setLiveFetch((v) => v + Math.floor(Math.random() * 18));

      setWires((prevWires) =>
        prevWires.map((w) => {
          if (w.status === 'IN_PROGRESS' || w.status === 'LIVE' || w.status === 'WOKEN') {
            const nextProg = w.progress >= 99 ? 68 : w.progress + 1;
            return { ...w, progress: nextProg };
          }
          return w;
        })
      );

      setAgents((prevAgents) => {
        const idxToSpeak = Math.floor(Math.random() * prevAgents.length);
        return prevAgents.map((ag, idx) => {
          if (idx !== idxToSpeak) return ag;
          const pool =
            locale === 'id' ? IDLE_SPEECH_POOL_ID[ag.id] : IDLE_SPEECH_POOL_EN[ag.id];
          const nextSpeech = pool[Math.floor(Math.random() * pool.length)] ?? ag.speechBubble;

          let nextTarget = ag.targetCoord;
          if (!councilActive && Math.random() < 0.18 && ag.id !== 'ORCH-01') {
            const atDesk =
              Math.hypot(ag.targetCoord.x - ag.deskCoord.x, ag.targetCoord.y - ag.deskCoord.y) <
              0.2;
            if (atDesk) {
              const breakSpots = ROOM_WAYPOINTS.BREAKROOM;
              nextTarget =
                breakSpots[Math.floor(Math.random() * breakSpots.length)] ?? ag.deskCoord;
            } else {
              nextTarget = { ...ag.deskCoord };
            }
          }

          return {
            ...ag,
            speechBubble: nextSpeech,
            speechUpdatedAt: Date.now(),
            targetCoord: nextTarget,
            tokensProcessed: ag.tokensProcessed + Math.floor(Math.random() * 240 + 60),
          };
        });
      });
    }, 2400);

    return () => window.clearInterval(interval);
  }, [locale, councilActive]);

  const formatWorkBotTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const handleToggleCouncil = () => {
    const nextState = !councilActive;
    setCouncilActive(nextState);

    const confSpots = ROOM_WAYPOINTS.CONFERENCE;
    setAgents((prev) =>
      prev.map((ag, idx) => {
        if (nextState) {
          const spot = confSpots[idx % confSpots.length] ?? ag.deskCoord;
          const jitterX = (idx % 3) * 0.28 - 0.25;
          const jitterY = Math.floor(idx / 3) * 0.22 - 0.2;
          return {
            ...ag,
            state: 'DEBATING',
            targetCoord: { x: spot.x + jitterX, y: spot.y + jitterY },
            speechBubble:
              locale === 'id'
                ? `Sidang Dewan: memverifikasi konsensus ${ag.activeWireId ?? 'DAG'}.`
                : `Council sync: cross-auditing ${ag.activeWireId ?? 'DAG'} consensus.`,
          };
        }
        return {
          ...ag,
          state: 'TYPING',
          targetCoord: { ...ag.deskCoord },
          speechBubble:
            locale === 'id'
              ? 'Kembali ke meja kerja untuk eksekusi wire.'
              : 'Returning to desk station for wire execution.',
        };
      })
    );

    const logEntry: FloorChatterItem = {
      id: `chat-${Date.now()}`,
      time: formatCurrentTimeCT(),
      agentId: 'ORCH-01',
      agentName: 'Argon Director',
      category: 'DEBATE',
      text: nextState
        ? locale === 'id'
          ? 'Dewan Multi-Agen Grok dipanggil ke Ruang Konferensi untuk debat silang.'
          : 'Grok Multi-Agent Council summoned to Conference Room for cross-critique.'
        : locale === 'id'
        ? 'Sidang Dewan selesai. Seluruh agen kembali ke meja produksi.'
        : 'Council session concluded. All floor agents returning to production desks.',
    };
    setChatter((prev) => [logEntry, ...prev.slice(0, 29)]);
  };

  const handleResolveWire = (wireId: string) => {
    setWires((prev) =>
      prev.map((w) => {
        if (w.id !== wireId) return w;
        return {
          ...w,
          status: 'VERIFIED',
          statusDetail:
            locale === 'id'
              ? 'VERIFIED · kunci dirotasi & gerbang disetujui'
              : 'VERIFIED · secret rotated & gate approved',
          progress: 100,
        };
      })
    );

    const resolvedWire = wires.find((w) => w.id === wireId);
    const agentId = resolvedWire?.assignedAgentId ?? 'SEC-05';
    const logEntry: FloorChatterItem = {
      id: `chat-${Date.now()}`,
      time: formatCurrentTimeCT(),
      agentId,
      agentName: agents.find((a) => a.id === agentId)?.name ?? 'Zero-Trust CSO',
      wireId,
      category: 'GATE',
      text:
        locale === 'id'
          ? `Wire ${wireId} dibuka blokirnya dan diverifikasi untuk rilis.`
          : `Wire ${wireId} unblocked and verified for production cutover.`,
    };
    setChatter((prev) => [logEntry, ...prev.slice(0, 29)]);
  };

  const handlePromotePreview = () => {
    const nextProdHash = previewCommit;
    const nextPrevHash = generateCommitHash();
    setProdCommit(nextProdHash);
    setPreviewCommit(nextPrevHash);
    setPreviewHeld(false);
    setCommitCount((c) => c + 1);

    const newShip: ShipLogEntry = {
      id: `ship-${Date.now()}`,
      commitHash: nextProdHash,
      timestamp: formatCurrentTimeCT(),
      wireId: selectedWireId || 'GATE-011',
      agentId: 'SRE-10',
      summary: `feat(release): promote Cloud Run build ${nextProdHash} to PRODUCTION`,
      deltaAdded: 312,
      deltaRemoved: 24,
      environment: 'PRODUCTION',
    };
    setShipLog((prev) => [newShip, ...prev]);

    const logEntry: FloorChatterItem = {
      id: `chat-${Date.now()}`,
      time: formatCurrentTimeCT(),
      agentId: 'SRE-10',
      agentName: 'Cloud Run SRE',
      wireId: 'GATE-011',
      category: 'COMMIT',
      text:
        locale === 'id'
          ? `Promosi Cloud Run selesai: ${nextProdHash} kini LIVE di PRODUCTION.`
          : `Cloud Run cutover complete: ${nextProdHash} is now LIVE in PRODUCTION.`,
    };
    setChatter((prev) => [logEntry, ...prev.slice(0, 29)]);
  };

  const handleDispatchMission = async (customPrompt?: string) => {
    const rawPrompt = customPrompt ?? chatInput;
    const clean = sanitizePromptInput(rawPrompt);
    if (!clean || isExecutingMission) return;

    if (!customPrompt) {
      setChatInput('');
    }
    setIsExecutingMission(true);

    const userMsg: AgencyChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'USER',
      timestamp: formatCurrentTimeCT(),
      content: clean,
      mode: orchestrationMode,
      priority,
    };
    setMessages((prev) => [...prev, userMsg]);

    const confSpots = ROOM_WAYPOINTS.CONFERENCE;
    const useCouncilWalk = orchestrationMode === 'GROK_COUNCIL';
    if (useCouncilWalk) {
      setCouncilActive(true);
    }

    setAgents((prev) =>
      prev.map((ag, idx) => {
        const isTargeted = targetAgent === 'ALL' || ag.id === targetAgent || ag.id === 'ORCH-01';
        if (!isTargeted) return ag;

        const targetCoord = useCouncilWalk
          ? {
              x:
                (confSpots[idx % confSpots.length]?.x ?? ag.deskCoord.x) +
                ((idx % 3) - 1) * 0.22,
              y:
                (confSpots[idx % confSpots.length]?.y ?? ag.deskCoord.y) +
                (Math.floor(idx / 3) - 1) * 0.18,
            }
          : { ...ag.deskCoord };

        return {
          ...ag,
          state: useCouncilWalk ? 'DEBATING' : 'THINKING',
          targetCoord,
          speechBubble:
            ag.id === 'ORCH-01'
              ? locale === 'id'
                ? `Memecah misi "${clean.slice(0, 28)}..." ke graf DAG.`
                : `Decomposing "${clean.slice(0, 28)}..." into DAG wires.`
              : locale === 'id'
              ? `Mengeksekusi sub-tugas (${orchestrationMode})...`
              : `Executing specialist node (${orchestrationMode})...`,
          speechUpdatedAt: Date.now(),
        };
      })
    );

    const dispatchChatter: FloorChatterItem = {
      id: `chat-disp-${Date.now()}`,
      time: formatCurrentTimeCT(),
      agentId: 'ORCH-01',
      agentName: 'Argon Director',
      category: 'DISPATCH',
      text:
        locale === 'id'
          ? `Gemini 4 Argon (High) menerima misi [${priority} · ${orchestrationMode}]: "${clean.slice(0, 56)}"`
          : `Gemini 4 Argon (High) accepted mission [${priority} · ${orchestrationMode}]: "${clean.slice(0, 56)}"`,
    };
    setChatter((prev) => [dispatchChatter, ...prev.slice(0, 29)]);

    try {
      const plan = await executeGeminiArgonMission({
        prompt: clean,
        mode: orchestrationMode,
        priority,
        targetAgentId: targetAgent,
        locale,
        apiKey: geminiApiKey || undefined,
        wireCounter,
      });

      if (plan.newWires.length > 0) {
        setWireCounter((c) => c + plan.newWires.length);
        setWires((prev) => [...plan.newWires, ...prev]);
        if (plan.newWires[0]) {
          setSelectedWireId(plan.newWires[0].id);
        }

        setCodeAdded((a) => a + plan.totalAddedLines);
        setCodeRemoved((r) => r + plan.totalRemovedLines);
        setCommitCount((c) => c + plan.newWires.length);
        setLiveDagNodes((n) => n + plan.newWires.length);

        const newHash = generateCommitHash();
        setPreviewCommit(newHash);
        setPreviewHeld(true);

        const newShipEntry: ShipLogEntry = {
          id: `ship-${Date.now()}`,
          commitHash: newHash,
          timestamp: formatCurrentTimeCT(),
          wireId: plan.newWires[0]?.id ?? 'AG-200',
          agentId: 'EXEC-07',
          summary: `feat(agency): ${plan.missionTitle}`,
          deltaAdded: plan.totalAddedLines,
          deltaRemoved: plan.totalRemovedLines,
          environment: 'PREVIEW',
        };
        setShipLog((prev) => [newShipEntry, ...prev]);

        setAgents((prev) =>
          prev.map((ag) => {
            const trace = plan.traces.find((tr) => tr.agentId === ag.id);
            const vote = plan.councilVotes.find((v) => v.agentId === ag.id);
            const assignedWire = plan.newWires.find((w) => w.assignedAgentId === ag.id);

            return {
              ...ag,
              state: 'TYPING',
              targetCoord: { ...ag.deskCoord },
              activeWireId: assignedWire?.id ?? ag.activeWireId,
              tasksCompleted: plan.selectedAgents.includes(ag.id)
                ? ag.tasksCompleted + 1
                : ag.tasksCompleted,
              tokensProcessed: ag.tokensProcessed + 1420,
              speechBubble: trace
                ? trace.outputSummary.slice(0, 56)
                : vote
                ? `${vote.stance}: ${vote.critique.slice(0, 48)}`
                : ag.speechBubble,
              speechUpdatedAt: Date.now(),
            };
          })
        );
      } else {
        setAgents((prev) =>
          prev.map((ag) =>
            ag.id === 'ORCH-01'
              ? {
                  ...ag,
                  speechBubble: plan.orchestratorSummary.slice(0, 64),
                  speechUpdatedAt: Date.now(),
                }
              : ag
          )
        );
      }

      if (plan.councilVotes.length > 0 && useCouncilWalk) {
        window.setTimeout(() => setCouncilActive(false), 1800);
      }

      if (plan.traces.length > 0) {
        const traceChatter: FloorChatterItem[] = plan.traces.map((tr, i) => ({
          id: `chat-tr-${Date.now()}-${i}`,
          time: formatCurrentTimeCT(),
          agentId: tr.agentId,
          agentName: tr.agentName,
          wireId: tr.wireId,
          category: 'TOOL',
          text: `${tr.wireId} [${tr.toolCalls.join(' -> ')}]: ${tr.outputSummary}`,
        }));
        setChatter((prev) => [...traceChatter, ...prev.slice(0, 26)]);
      }

      const responseMsg: AgencyChatMessage = {
        id: `msg-orch-${Date.now()}`,
        sender: 'ORCHESTRATOR',
        agentId: 'ORCH-01',
        agentName: 'Argon Director',
        roleLabel: plan.usedLiveApi
          ? 'Gemini 4 Argon (High) · Live API Stream'
          : 'Gemini 4 Argon (High) · Multi-Agent Synthesis Core',
        timestamp: formatCurrentTimeCT(),
        content: plan.orchestratorSummary,
        mode: orchestrationMode,
        priority,
        modelBadge: 'Gemini 4 Argon (High)',
        decomposedWires: plan.newWires.length > 0 ? plan.newWires.map((w) => w.id) : undefined,
        traces: plan.traces.length > 0 ? plan.traces : undefined,
        councilVotes: plan.councilVotes.length > 0 ? plan.councilVotes : undefined,
        artifact: plan.artifact,
        latencyMs: plan.latencyMs,
      };

      setMessages((prev) => [...prev, responseMsg]);

      // Auto-switch center tab to ARTIFACTS for games/visual components so the user sees results immediately
      if (
        plan.artifact &&
        (plan.artifact.filename.toLowerCase().includes('game') ||
          plan.artifact.filename.toLowerCase().includes('hello') ||
          plan.artifact.filename.toLowerCase().includes('hi'))
      ) {
        setCenterTab('ARTIFACTS');
      }
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'Mission execution encountered an unexpected state.';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'ORCHESTRATOR',
          agentId: 'SEC-05',
          agentName: 'Zero-Trust CSO',
          timestamp: formatCurrentTimeCT(),
          content: errMsg,
          mode: orchestrationMode,
        },
      ]);
    } finally {
      setIsExecutingMission(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? agents[0];
  const selectedWire = wires.find((w) => w.id === selectedWireId) ?? wires[0];

  const missionPresets =
    locale === 'id'
      ? [
          {
            label: 'Cutover Auth Zero-Trust',
            prompt:
              'Rancang dan implementasikan cutover autentikasi Zero-Trust dengan rotasi kunci webhook HMAC-SHA256 otomatis dan audit OWASP.',
          },
          {
            label: 'Pipeline Telemetri Real-Time',
            prompt:
              'Bangun pipeline agregator telemetri multi-agen berkecepatan tinggi dengan perlindungan dead-letter queue dan pemantauan P99.',
          },
          {
            label: 'Arsitektur UI Spasial 120fps',
            prompt:
              'Buat sistem orkestrasi DAG frontend interaktif dengan token tema adaptif gelap/terang dan verifikasi aksesibilitas WCAG AA+.',
          },
          {
            label: 'Sidang Audit Dewan Grok',
            prompt:
              'Jalankan evaluasi Red-Team penuh lintas 10 agen untuk memverifikasi ketahanan beban puncak Cloud Run dan keamanan API.',
          },
        ]
      : [
          {
            label: 'Zero-Trust Auth Cutover',
            prompt:
              'Architect and implement a Zero-Trust authentication cutover with automated HMAC-SHA256 webhook key rotation and OWASP gate verification.',
          },
          {
            label: 'Real-Time Telemetry Pipeline',
            prompt:
              'Build a partitioned multi-agent telemetry stream coordinator with dead-letter queue isolation and rolling P99 latency metrics.',
          },
          {
            label: '120fps Spatial UI DAG',
            prompt:
              'Engineer an interactive frontend DAG orchestration engine with adaptive light/dark tokens and strict WCAG AA+ contrast compliance.',
          },
          {
            label: 'Grok Council Red-Team Audit',
            prompt:
              'Run a full 10-agent Red-Team Council critique to verify Cloud Run peak-load resilience and cryptographic API boundaries.',
          },
        ];

  const handleCopyArtifact = (id: string, code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedArtifactId(id);
    window.setTimeout(() => {
      setCopiedArtifactId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKeyDraft.trim();
    if (!trimmed) {
      setGeminiApiKey('');
      setApiKeyError(null);
      setApiModalOpen(false);
      return;
    }
    if (!validateGeminiApiKey(trimmed)) {
      setApiKeyError(
        locale === 'id'
          ? 'Format kunci API Gemini tidak valid (wajib diawali AIza...). Kosongkan untuk menggunakan mesin otonom bawaan.'
          : 'Invalid Gemini API key format (must start with AIza...). Leave blank to use the built-in autonomous engine.'
      );
      return;
    }
    setGeminiApiKey(trimmed);
    setApiKeyError(null);
    setApiModalOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-terminal-bg font-sans text-fg lg:h-screen lg:overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line bg-terminal-card px-3 py-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 rounded border border-line-strong bg-terminal-bg px-2.5 py-1">
            <span className="size-2 animate-pulse rounded-full bg-wire-green" />
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-fg">
              {t.brand.name}
            </span>
            <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent">
              {t.brand.modelBadge}
            </span>
          </div>

          <span className="hidden font-mono text-[11px] text-muted xl:inline">
            {t.brand.subtitle}
          </span>
        </div>

        <nav aria-label="Workstation Views" className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCenterTab('FLOOR')}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              centerTab === 'FLOOR'
                ? 'bg-fg text-bg'
                : 'border border-line bg-terminal-bg text-muted hover:text-fg'
            }`}
          >
            <Layers className="size-3.5" aria-hidden="true" />
            <span>{t.tabs.floor}</span>
          </button>

          <button
            type="button"
            onClick={() => setCenterTab('DOTS_DAG')}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              centerTab === 'DOTS_DAG'
                ? 'bg-fg text-bg'
                : 'border border-line bg-terminal-bg text-muted hover:text-fg'
            }`}
          >
            <Network className="size-3.5 text-wire-cyan" aria-hidden="true" />
            <span>{t.tabs.dots}</span>
          </button>

          <button
            type="button"
            onClick={() => setCenterTab('GROK_COUNCIL')}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              centerTab === 'GROK_COUNCIL'
                ? 'bg-fg text-bg'
                : 'border border-line bg-terminal-bg text-muted hover:text-fg'
            }`}
          >
            <Users className="size-3.5 text-wire-purple" aria-hidden="true" />
            <span>{t.tabs.council}</span>
          </button>

          <button
            type="button"
            onClick={() => setCenterTab('ARTIFACTS')}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
              centerTab === 'ARTIFACTS'
                ? 'bg-fg text-bg'
                : 'border border-line bg-terminal-bg text-muted hover:text-fg'
            }`}
          >
            <Code2 className="size-3.5 text-wire-green" aria-hidden="true" />
            <span>{t.tabs.artifacts}</span>
          </button>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setApiKeyDraft(geminiApiKey);
              setApiKeyError(null);
              setApiModalOpen(true);
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded border border-line bg-terminal-bg px-2.5 py-1 font-mono text-[11px] text-fg hover:border-line-strong"
          >
            <KeyRound
              className={`size-3.5 ${geminiApiKey ? 'text-wire-green' : 'text-accent'}`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">
              {geminiApiKey ? t.controls.apiLive : t.controls.aiCore}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t.controls.switchLang}
            className="inline-flex min-h-9 items-center gap-1 rounded border border-line bg-terminal-bg px-2.5 py-1 font-mono text-[11px] font-semibold uppercase text-fg hover:border-line-strong"
          >
            <Globe className="size-3.5 text-wire-cyan" aria-hidden="true" />
            <span>{locale.toUpperCase()}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t.controls.switchTheme}
            className="grid size-9 place-items-center rounded border border-line bg-terminal-bg text-fg hover:border-line-strong"
          >
            {theme === 'dark' ? (
              <Sun className="size-4 text-wire-amber" aria-hidden="true" />
            ) : (
              <Moon className="size-4 text-wire-cyan" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* LEFT SIDEBAR: ENV, WORKFORCE, WIRES & FLOOR CHATTER */}
        <aside className="flex w-full shrink-0 flex-col border-b border-line bg-terminal-bg lg:h-full lg:w-[350px] lg:border-r lg:border-b-0 xl:w-[375px]">
          <div className="flex-1 space-y-2.5 overflow-y-auto p-2.5">
            <section aria-label="Environment Status">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  {t.sidebar.envTitle}
                </span>
                <span className="font-mono text-[10px] text-faint">{t.sidebar.envMesh}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-line bg-terminal-card p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-wire-green" />
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-fg">
                      {t.sidebar.prodTitle}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    running · +{codeAdded}/-{codeRemoved} today
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="rounded bg-wire-cyan/20 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-wire-cyan">
                      {prodCommit}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted">{t.sidebar.prodSub}</p>
                </div>

                <div className="rounded border border-line bg-terminal-card p-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full ${
                          previewHeld ? 'bg-wire-amber' : 'bg-wire-green'
                        }`}
                      />
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-fg">
                        {t.sidebar.previewTitle}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePromotePreview}
                      className="rounded border border-line-strong bg-terminal-bg px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-wire-cyan hover:border-wire-cyan"
                    >
                      {t.controls.promote}
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {previewHeld ? t.sidebar.previewUnconfirmed : t.sidebar.previewVerified}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <span className="rounded bg-wire-cyan/20 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-wire-cyan">
                      {previewCommit}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {previewHeld ? t.sidebar.previewHeld : t.sidebar.previewSynced}
                  </p>
                </div>
              </div>
            </section>

            <section aria-label="Workforce Telemetry">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {t.sidebar.workforceTitle}
                </span>
                <span className="font-mono text-[10px] text-wire-green">10/10 ONLINE</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-line bg-terminal-card p-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {t.sidebar.agentsOnFloor}
                  </p>
                  <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-fg">
                    {agents.length}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-wire-green">
                    +{agents.length} active · Bull Bear
                  </p>
                </div>

                <div className="rounded border border-line bg-terminal-card p-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {t.sidebar.workBotTime}
                  </p>
                  <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-fg">
                    {formatWorkBotTime(uptimeSeconds)}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted">
                    {t.sidebar.keepAlive}
                  </p>
                </div>

                <div className="rounded border border-line bg-terminal-card p-2.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {t.sidebar.codeDelta}
                  </p>
                  <p className="mt-0.5 font-mono text-lg font-bold tabular-nums">
                    <span className="text-wire-green">+{codeAdded}</span>{' '}
                    <span className="text-muted">/</span>{' '}
                    <span className="text-wire-red">-{codeRemoved}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted">
                    +{commitCount} {t.sidebar.commitsSinceMidnight}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCenterTab('ARTIFACTS')}
                  className="rounded border border-line bg-terminal-card p-2.5 text-left transition-colors hover:border-line-strong"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {t.sidebar.shipLog}
                  </p>
                  <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums text-fg">
                    {shipLog.length}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-wire-cyan">
                    {t.sidebar.appendOnlyTape}
                  </p>
                </button>
              </div>
            </section>

            <section aria-label="Active Task Wires">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
                  {t.sidebar.wiresHeader}
                </span>
                <span className="font-mono text-[10px] text-wire-cyan">
                  {wires.length} ACTIVE
                </span>
              </div>

              <div className="space-y-1.5">
                {wires.slice(0, 8).map((wire) => {
                  const isSelected = wire.id === selectedWireId;
                  const barColor =
                    wire.status === 'BLOCKED'
                      ? 'bg-wire-red'
                      : wire.status === 'HELD' || wire.status === 'AT_BAT'
                      ? 'bg-wire-amber'
                      : wire.status === 'VERIFIED' || wire.status === 'SHIPPED'
                      ? 'bg-wire-green'
                      : 'bg-wire-cyan';

                  return (
                    <div
                      key={wire.id}
                      onClick={() => {
                        setSelectedWireId(wire.id);
                        setSelectedAgentId(wire.assignedAgentId);
                      }}
                      className={`cursor-pointer rounded border p-2 transition-colors ${
                        isSelected
                          ? 'border-wire-cyan bg-terminal-card'
                          : 'border-line bg-terminal-card/70 hover:border-line-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-mono text-[11px] font-bold text-fg">
                          <span className="text-wire-cyan">{wire.id}</span> {wire.title}
                        </p>
                        <span className="shrink-0 rounded border border-line px-1 font-mono text-[9px] text-muted">
                          {wire.assignedAgentId}
                        </span>
                      </div>

                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-sm bg-terminal-bg">
                        <div
                          className={`h-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${Math.max(12, Math.min(100, wire.progress))}%` }}
                        />
                      </div>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="truncate font-mono text-[10px] text-muted">
                          {wire.statusDetail}
                        </p>
                        {(wire.status === 'BLOCKED' || wire.status === 'HELD') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveWire(wire.id);
                            }}
                            className="inline-flex shrink-0 items-center gap-1 rounded bg-wire-amber/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-wire-amber hover:bg-wire-amber/30"
                          >
                            <Unlock className="size-2.5" aria-hidden="true" />
                            <span>{t.controls.unblock}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="rounded border border-line bg-terminal-card px-2.5 py-1.5 font-mono text-[10px] text-muted">
              <span className="font-bold uppercase text-fg">{t.sidebar.wiresLive}</span> · ING{' '}
              {(liveIngest / 1000).toFixed(1)}k · Rpmg {liveRpm} · Fetch {liveFetch} · Rddtrd{' '}
              {liveDagNodes}
            </div>

            <section aria-label="Floor Chatter Log" className="flex flex-col">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {t.sidebar.floorChatter} — {clockCT}
                </span>
                <Terminal className="size-3 text-wire-cyan" aria-hidden="true" />
              </div>

              <div className="max-h-48 space-y-1.5 overflow-y-auto rounded border border-line bg-terminal-card p-2 font-mono text-[11px] leading-snug">
                {chatter.map((item) => (
                  <div key={item.id} className="border-b border-line/50 pb-1 last:border-b-0">
                    <span className="text-faint">{item.time.slice(0, 8)} </span>
                    <span className="font-semibold text-wire-cyan">{item.agentName}</span>
                    {item.wireId && (
                      <span className="text-wire-amber"> [{item.wireId}]</span>
                    )}
                    <span className="text-fg/90">: {item.text}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* CENTER STAGE */}
        <main className="relative flex min-h-[460px] flex-1 flex-col overflow-hidden bg-floor-canvas">
          {centerTab === 'FLOOR' && (
            <IsometricOfficeCanvas
              agents={agents}
              wires={wires}
              selectedAgentId={selectedAgentId}
              onSelectAgent={(id) => setSelectedAgentId(id)}
              showDagLinks={showDagLinks}
              onToggleDagLinks={() => setShowDagLinks((v) => !v)}
              onSummonCouncil={handleToggleCouncil}
              councilActive={councilActive}
            />
          )}

          {centerTab === 'DOTS_DAG' && (
            <div className="flex-1 overflow-y-auto bg-terminal-bg p-5">
              <div className="mx-auto max-w-4xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-wire-cyan">
                      OPENAI DOTS ARCHITECTURE · DIRECTED ACYCLIC GRAPH (DAG)
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-fg">
                      {locale === 'id'
                        ? 'Topologi Ketergantungan Tugas & Eksekusi Node'
                        : 'Live Task Dependency Graph & Execution Nodes'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDispatchMission(
                        locale === 'id'
                          ? 'Optimalkan topologi DAG dan selesaikan semua wire yang tertahan.'
                          : 'Optimize DAG topology and execute parallel verification across active wires.'
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded bg-wire-cyan px-3 py-1.5 font-mono text-xs font-semibold text-bg"
                  >
                    <Play className="size-3.5" aria-hidden="true" />
                    <span>{t.controls.runDagWave}</span>
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {wires.map((wire) => {
                    const agent = agents.find((a) => a.id === wire.assignedAgentId);
                    return (
                      <div
                        key={wire.id}
                        onClick={() => setSelectedWireId(wire.id)}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          wire.id === selectedWireId
                            ? 'border-wire-cyan bg-terminal-card'
                            : 'border-line bg-terminal-card/70 hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded bg-wire-cyan/15 px-2 py-0.5 font-mono text-xs font-bold text-wire-cyan">
                            DOT // {wire.id}
                          </span>
                          <span className="font-mono text-[11px] font-semibold text-muted">
                            {wire.priority} · {wire.status}
                          </span>
                        </div>

                        <h3 className="mt-2 font-display text-base font-semibold text-fg">
                          {wire.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-muted">{wire.statusDetail}</p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[11px]">
                          <span className="text-fg">
                            <strong className="text-wire-amber">
                              {agent?.name} ({wire.assignedAgentId})
                            </strong>
                          </span>
                          <span className="text-wire-green">
                            +{wire.codeDelta.added} / -{wire.codeDelta.removed} LOC
                          </span>
                        </div>

                        {wire.dependencies.length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-muted">
                            <GitBranch className="size-3 text-wire-purple" aria-hidden="true" />
                            <span>Deps: {wire.dependencies.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {centerTab === 'GROK_COUNCIL' && (
            <div className="flex-1 overflow-y-auto bg-terminal-bg p-5">
              <div className="mx-auto max-w-4xl">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-wire-purple">
                      GROK HEAVY MULTI-AGENT COUNCIL · PARALLEL DEBATE & RED-TEAM CRITIQUE
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-fg">
                      {locale === 'id'
                        ? 'Dewan Konsensus 10-Agen & Verifikasi Silang'
                        : '10-Agent Consensus Council & Cross-Verification'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOrchestrationMode('GROK_COUNCIL');
                      handleToggleCouncil();
                    }}
                    className="inline-flex items-center gap-1.5 rounded bg-wire-purple px-3 py-1.5 font-mono text-xs font-semibold text-bg"
                  >
                    <Users className="size-3.5" aria-hidden="true" />
                    <span>
                      {councilActive ? t.controls.councilReturn : t.controls.councilSummon}
                    </span>
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {agents.map((ag) => (
                    <div
                      key={ag.id}
                      onClick={() => setSelectedAgentId(ag.id)}
                      className="cursor-pointer rounded-lg border border-line bg-terminal-card p-4 transition-colors hover:border-wire-purple"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-wire-purple">
                            {ag.id} · {ag.name}
                          </span>
                          <p className="font-mono text-[11px] text-muted">
                            {ag.scrantonAlias} — {locale === 'id' ? ag.roleId : ag.roleEn}
                          </p>
                        </div>
                        <span className="rounded bg-wire-green/15 px-2 py-0.5 font-mono text-xs font-bold text-wire-green">
                          {ag.confidenceScore}%
                        </span>
                      </div>

                      <p className="mt-2.5 text-xs leading-relaxed text-fg/90">
                        {locale === 'id' ? ag.directiveId : ag.directiveEn}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-2.5">
                        {ag.tools.map((tool) => (
                          <span
                            key={tool}
                            className="rounded border border-line bg-terminal-bg px-2 py-0.5 font-mono text-[10px] text-wire-cyan"
                          >
                            {tool}()
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {centerTab === 'ARTIFACTS' && (
            <div className="flex-1 overflow-y-auto bg-terminal-bg p-5">
              <div className="mx-auto max-w-4xl space-y-6">
                <div className="border-b border-line pb-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-wire-green">
                    SANDBOX ARTIFACTS & APPEND-ONLY SHIP-LOG TAPE
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold text-fg">
                    {locale === 'id'
                      ? 'Repositori Kode Produksi & Jejak Rilis'
                      : 'Production Code Artifacts & Release Tape'}
                  </h2>
                </div>

                {selectedWire?.artifact ? (
                  <InteractiveSandboxRunner
                    artifact={selectedWire.artifact}
                    wire={selectedWire}
                    locale={locale}
                    onCopy={handleCopyArtifact}
                    isCopied={copiedArtifactId === selectedWire.id}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-line p-6 text-center text-xs font-mono text-muted">
                    {locale === 'id'
                      ? 'Pilih wire di sidebar kiri atau jalankan misi baru untuk melihat artefak sandbox.'
                      : 'Select a wire in the sidebar or run a new mission to view sandbox artifacts.'}
                  </div>
                )}

                <div className="rounded-lg border border-line bg-terminal-card p-4">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-fg">
                    SHIP-LOG APPEND-ONLY TAPE ({shipLog.length} RECORDS)
                  </h3>
                  <div className="mt-3 space-y-2">
                    {shipLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-line bg-terminal-bg px-3 py-2 font-mono text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <GitCommit className="size-3.5 text-wire-cyan" aria-hidden="true" />
                          <span className="rounded bg-wire-cyan/15 px-1.5 py-0.5 font-semibold text-wire-cyan">
                            {entry.commitHash}
                          </span>
                          <span className="text-muted">[{entry.wireId}]</span>
                          <span className="text-fg">{entry.summary}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-wire-green">+{entry.deltaAdded}</span>
                          <span className="text-wire-red">-{entry.deltaRemoved}</span>
                          <span className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
                            {entry.environment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom-Right Floating Cloud Run Status Toast Card */}
          <div className="pointer-events-auto absolute right-3 bottom-14 z-30 w-64 rounded-lg border border-line-strong bg-fg text-bg shadow-xl">
            <div className="flex items-center justify-between border-b border-bg/15 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-wire-amber" />
                <span className="font-mono text-[11px] font-bold">
                  {shipLog.length} Ingest Hold Cloud Run
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFloatingToastExpanded((v) => !v)}
                aria-label="Toggle Cloud Run Hold Details"
                className="rounded p-0.5 hover:bg-bg/10"
              >
                {floatingToastExpanded ? (
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                ) : (
                  <ChevronUp className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
            {floatingToastExpanded && (
              <div className="space-y-1.5 px-3 py-2 font-mono text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Cpu className="size-3 text-accent" aria-hidden="true" />
                    <span>Argon High working</span>
                  </span>
                  <button
                    type="button"
                    onClick={handlePromotePreview}
                    className="underline opacity-80 hover:opacity-100"
                  >
                    {t.controls.promote}
                  </button>
                </div>
                <p className="truncate opacity-75">
                  NOMAD01 — Build {previewCommit} ready for cutover
                </p>
              </div>
            )}
          </div>

          {selectedAgent && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line bg-terminal-card px-3 py-2 font-mono text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-wire-amber/20 px-2 py-0.5 font-bold text-wire-amber">
                  {selectedAgent.id}
                </span>
                <span className="font-bold text-fg">{selectedAgent.name}</span>
                <span className="text-muted">({selectedAgent.scrantonAlias})</span>
                <span className="hidden text-faint md:inline">·</span>
                <span className="hidden text-wire-cyan md:inline">
                  {locale === 'id' ? selectedAgent.roleId : selectedAgent.roleEn}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-muted">
                  Wire:{' '}
                  <strong className="text-fg">{selectedAgent.activeWireId ?? 'IDLE'}</strong>
                </span>
                <span className="hidden text-muted sm:inline">
                  Tokens:{' '}
                  <strong className="text-wire-green">
                    {selectedAgent.tokensProcessed.toLocaleString()}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setTargetAgent(selectedAgent.id);
                    setOrchestrationMode('DIRECT_ASSIGN');
                  }}
                  className="rounded border border-wire-cyan bg-wire-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-wire-cyan hover:bg-wire-cyan/20"
                >
                  @{selectedAgent.id}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: GEMINI 4 ARGON (HIGH) LIVE CHAT & TASK DELEGATOR */}
        <section
          aria-label="Gemini 4 Argon High Live Multi-Agent Chat"
          className="flex w-full shrink-0 flex-col border-t border-line bg-terminal-card lg:h-full lg:w-[410px] lg:border-t-0 lg:border-l xl:w-[445px]"
        >
          <div className="border-b border-line p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-accent" aria-hidden="true" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-fg">
                  {t.chat.header}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-wire-green/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-wire-green">
                <Zap className="size-2.5" aria-hidden="true" />
                <span>{t.chat.readyBadge}</span>
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setOrchestrationMode('AUTO_DAG')}
                className={`rounded border px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                  orchestrationMode === 'AUTO_DAG'
                    ? 'border-wire-cyan bg-wire-cyan/15 text-wire-cyan'
                    : 'border-line bg-terminal-bg text-muted hover:text-fg'
                }`}
              >
                {t.chat.modeAutoDag}
              </button>
              <button
                type="button"
                onClick={() => setOrchestrationMode('GROK_COUNCIL')}
                className={`rounded border px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                  orchestrationMode === 'GROK_COUNCIL'
                    ? 'border-wire-purple bg-wire-purple/15 text-wire-purple'
                    : 'border-line bg-terminal-bg text-muted hover:text-fg'
                }`}
              >
                {t.chat.modeGrokCouncil}
              </button>
              <button
                type="button"
                onClick={() => setOrchestrationMode('DIRECT_ASSIGN')}
                className={`rounded border px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                  orchestrationMode === 'DIRECT_ASSIGN'
                    ? 'border-wire-amber bg-wire-amber/15 text-wire-amber'
                    : 'border-line bg-terminal-bg text-muted hover:text-fg'
                }`}
              >
                {t.chat.modeDirect}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {missionPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isExecutingMission}
                  onClick={() => handleDispatchMission(preset.prompt)}
                  className="rounded border border-line bg-terminal-bg px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((msg) => (
              <article
                key={msg.id}
                className={`rounded-lg border p-3 text-xs ${
                  msg.sender === 'USER'
                    ? 'ml-6 border-accent/40 bg-terminal-bg text-fg'
                    : 'border-line bg-terminal-bg/90 text-fg'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-line/60 pb-1.5 font-mono text-[10px]">
                  <span className="font-bold text-wire-cyan">
                    {msg.sender === 'USER'
                      ? t.chat.userSender
                      : `${msg.agentName ?? 'Argon Director'} [${msg.agentId ?? 'ORCH-01'}]`}
                  </span>
                  <span className="text-faint">{msg.timestamp}</span>
                </div>

                {msg.roleLabel && (
                  <p className="mt-1 font-mono text-[10px] text-accent">{msg.roleLabel}</p>
                )}

                <p className="mt-2 leading-relaxed whitespace-pre-line text-fg/95">
                  {msg.content}
                </p>

                {msg.decomposedWires && msg.decomposedWires.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1">
                    <span className="font-mono text-[10px] text-muted">WIRES:</span>
                    {msg.decomposedWires.map((wId) => (
                      <button
                        key={wId}
                        type="button"
                        onClick={() => {
                          setSelectedWireId(wId);
                          setCenterTab('DOTS_DAG');
                        }}
                        className="rounded border border-wire-cyan/40 bg-wire-cyan/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-wire-cyan hover:bg-wire-cyan/20"
                      >
                        {wId}
                      </button>
                    ))}
                  </div>
                )}

                {msg.traces && msg.traces.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-line pt-2.5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-wire-cyan">
                      {t.chat.tracesHeader}
                    </p>
                    {msg.traces.map((tr) => (
                      <div
                        key={`${msg.id}-${tr.agentId}`}
                        className="rounded border border-line bg-terminal-card p-2 font-mono text-[10px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-fg">
                            {tr.agentId} · {tr.agentName}
                          </span>
                          <span className="text-wire-green">{tr.durationMs} ms</span>
                        </div>
                        <p className="mt-0.5 text-wire-amber">
                          Tools: {tr.toolCalls.join(' -> ')}
                        </p>
                        <p className="mt-1 font-sans text-[11px] text-muted">
                          {tr.outputSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {msg.councilVotes && msg.councilVotes.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-line pt-2.5">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-wire-purple">
                      {t.chat.councilHeader}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {msg.councilVotes.map((vote) => (
                        <div
                          key={`${msg.id}-vote-${vote.agentId}`}
                          className="rounded border border-line bg-terminal-card p-2 font-mono text-[10px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-wire-purple">{vote.agentId}</span>
                            <span className="text-wire-green">{vote.confidence}%</span>
                          </div>
                          <p className="mt-0.5 font-bold text-fg">{vote.stance}</p>
                          <p className="mt-1 line-clamp-2 font-sans text-[10px] text-muted">
                            {vote.critique}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {msg.artifact && (
                  <div className="mt-3 rounded border border-line-strong bg-terminal-card p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[10px] font-bold text-wire-green">
                        {msg.artifact.filename}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyArtifact(msg.id, msg.artifact!.code)}
                          className="inline-flex items-center gap-1 rounded border border-line bg-terminal-bg px-2 py-0.5 font-mono text-[10px] text-fg hover:border-wire-cyan"
                        >
                          <Copy className="size-2.5 text-wire-cyan" aria-hidden="true" />
                          <span>
                            {copiedArtifactId === msg.id
                              ? t.controls.copied
                              : t.controls.copyCode}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (msg.decomposedWires && msg.decomposedWires[0]) {
                              setSelectedWireId(msg.decomposedWires[0]);
                            }
                            setCenterTab('ARTIFACTS');
                          }}
                          className="inline-flex items-center gap-1 rounded bg-wire-cyan/20 px-2.5 py-1 font-mono text-[10px] font-bold text-wire-cyan hover:bg-wire-cyan/30"
                        >
                          <Play className="size-2.5" aria-hidden="true" />
                          <span>{t.controls.openSandbox}</span>
                        </button>
                      </div>
                    </div>

                    {/* Prominent Play Game Banner */}
                    {(msg.artifact.filename.toLowerCase().includes('game') ||
                      msg.artifact.filename.toLowerCase().includes('hello') ||
                      msg.artifact.filename.toLowerCase().includes('hi')) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (msg.decomposedWires && msg.decomposedWires[0]) {
                            setSelectedWireId(msg.decomposedWires[0]);
                          }
                          setCenterTab('ARTIFACTS');
                        }}
                        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded border border-wire-green/40 bg-wire-green/15 py-2 font-mono text-xs font-bold text-wire-green hover:bg-wire-green/25 active:scale-98 transition-all"
                      >
                        <Gamepad2 className="size-4" aria-hidden="true" />
                        <span>
                          {locale === 'id'
                            ? '▶ Buka Layar Penuh & Mainkan Game Sekarang'
                            : '▶ Open Fullscreen & Play Game Now'}
                        </span>
                      </button>
                    )}

                    <pre className="mt-2 max-h-36 overflow-x-auto rounded bg-terminal-bg p-2 font-mono text-[10px] leading-relaxed text-fg/90">
                      <code>{msg.artifact.code}</code>
                    </pre>
                  </div>
                )}
              </article>
            ))}

            {isExecutingMission && (
              <div className="rounded-lg border border-wire-cyan bg-terminal-bg p-3 font-mono text-xs text-wire-cyan">
                <div className="flex items-center gap-2">
                  <Activity className="size-4 animate-spin" aria-hidden="true" />
                  <span>{t.chat.executing}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDispatchMission();
            }}
            className="border-t border-line bg-terminal-bg p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <label htmlFor="agent-target-select" className="text-muted">
                  {t.chat.targetLabel}
                </label>
                <select
                  id="agent-target-select"
                  value={targetAgent}
                  onChange={(e) => setTargetAgent(e.target.value as AgentRoleId | 'ALL')}
                  className="rounded border border-line bg-terminal-card px-2 py-1 text-[10px] font-semibold text-fg outline-none focus:border-wire-cyan"
                >
                  <option value="ALL">{t.chat.allAgency}</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      @{ag.id} · {ag.name} ({ag.scrantonAlias})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                {(['P0', 'P1', 'P2'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      priority === p
                        ? 'bg-accent text-bg'
                        : 'border border-line bg-terminal-card text-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleDispatchMission();
                  }
                }}
                placeholder={t.chat.placeholder}
                aria-label={t.chat.placeholder}
                className="flex-1 resize-none rounded border border-line bg-terminal-card p-2.5 text-xs text-fg outline-none focus:border-wire-cyan"
              />
              <button
                type="submit"
                disabled={isExecutingMission || !chatInput.trim()}
                className="inline-flex h-12 items-center gap-1.5 rounded bg-accent px-4 font-mono text-xs font-bold uppercase tracking-wider text-bg transition-transform active:scale-95 disabled:opacity-40"
              >
                <Send className="size-3.5" aria-hidden="true" />
                <span>{t.controls.dispatch}</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {apiModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="api-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
          onClick={() => setApiModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-line-strong bg-terminal-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-wire-green" aria-hidden="true" />
                <h3 id="api-modal-title" className="font-display text-lg font-bold text-fg">
                  {t.modal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApiModalOpen(false)}
                className="rounded p-1 text-muted hover:text-fg"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted">{t.modal.description}</p>

            <form onSubmit={handleSaveApiKey} className="mt-4 space-y-3">
              {apiKeyError && (
                <div className="rounded border border-wire-red bg-wire-red/10 p-2.5 text-xs text-wire-red">
                  {apiKeyError}
                </div>
              )}

              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {t.modal.keyLabel}
                </span>
                <input
                  type="password"
                  value={apiKeyDraft}
                  onChange={(e) => setApiKeyDraft(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  className="mt-1.5 h-10 w-full rounded border border-line bg-terminal-bg px-3 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApiModalOpen(false)}
                  className="rounded border border-line px-4 py-2 font-mono text-xs text-muted hover:text-fg"
                >
                  {t.modal.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded bg-wire-cyan px-4 py-2 font-mono text-xs font-bold text-bg"
                >
                  {t.modal.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
