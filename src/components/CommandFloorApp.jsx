import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  Check,
  Code2,
  Cpu,
  Download,
  ExternalLink,
  GitBranch,
  Globe,
  Key,
  Layers,
  LogOut,
  Moon,
  Play,
  Radio,
  Send,
  ShieldCheck,
  Sun,
  Terminal,
  Unlock,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap
} from 'lucide-react';
import FloorCanvas3D from './FloorCanvas3D';
import MasterAdminModal from './MasterAdminModal';
import SandboxPreview from './SandboxPreview';
import {
  INITIAL_AGENTS,
  INITIAL_CHATTER,
  INITIAL_SHIP_LOG,
  INITIAL_WIRES,
  LOCALES,
  MISSION_PRESETS,
  WAYPOINTS
} from '../lib/agencyData';
import { audioEngine } from '../lib/audioEngine';

function formatTimer(totalSec) {
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function randomHex9() {
  return Array.from({ length: 9 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export default function CommandFloorApp({ token, user, onLogout }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('argon-agency-theme') || 'dark');
  const [locale, setLocale] = useState(() => localStorage.getItem('argon-agency-locale') || 'id');
  const [activeTab, setActiveTab] = useState('FLOOR');
  const [muted, setMuted] = useState(false);

  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [wires, setWires] = useState(INITIAL_WIRES);
  const [shipLog, setShipLog] = useState(INITIAL_SHIP_LOG);
  const [neonLogs, setNeonLogs] = useState([]);
  const [chatter, setChatter] = useState(INITIAL_CHATTER);

  const [selectedAgentId, setSelectedAgentId] = useState('ORCH-01');
  const [selectedWireId, setSelectedWireId] = useState('FN-12');
  const [activeArtifact, setActiveArtifact] = useState(INITIAL_WIRES[1].artifact);
  const [showDagLinks, setShowDagLinks] = useState(true);
  const [councilActive, setCouncilActive] = useState(false);
  const [burstSignal, setBurstSignal] = useState(0);

  // Release & Workforce telemetry
  const [prodHash, setProdHash] = useState('3f8a52c21');
  const [previewHash, setPreviewHash] = useState('27b25a333');
  const [previewHeld, setPreviewHeld] = useState(true);
  const [codeAdded, setCodeAdded] = useState(5643);
  const [codeRemoved, setCodeRemoved] = useState(439);
  const [commitsCount, setCommitsCount] = useState(131);
  const [workBotSeconds, setWorkBotSeconds] = useState(14058);
  const [wireCounter, setWireCounter] = useState(1);

  // Live Chat & Orchestration state
  const [chatMode, setChatMode] = useState('AUTO_DAG');
  const [targetAgent, setTargetAgent] = useState('ALL');
  const [priority, setPriority] = useState('P1');
  const [useNeonHydrogen, setUseNeonHydrogen] = useState(true);
  const [promptInput, setPromptInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      role: 'assistant',
      engine: 'Gemini 4 Argon High + Neon Hydrogen xHigh',
      transport: 'ANTIGRAVITY_PRO_CREDIT_BRIDGE',
      text: 'Command Floor online. 10 spesialis aktif, Neon PostgreSQL tersinkronisasi, dan jembatan Antigravity MCP Pro Plan Credit siap mengeksekusi direktif tanpa API key.',
      wires: ['FN-11', 'FN-12', 'INF-163'],
      traces: [],
      councilVotes: []
    }
  ]);

  // Modals & Bridges
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [aiProvider, setAiProvider] = useState('ANTIGRAVITY_MCP');
  const [aiModel, setAiModel] = useState('neon-hydrogen-xhigh');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [apiTestStatus, setApiTestStatus] = useState('');
  const [mcpInfo, setMcpInfo] = useState(null);
  const [mcpPingResult, setMcpPingResult] = useState(null);
  const [copiedFlag, setCopiedFlag] = useState(false);

  const chatEndRef = useRef(null);
  const t = LOCALES[locale] || LOCALES.id;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('argon-agency-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('argon-agency-locale', locale);
  }, [locale]);

  useEffect(() => {
    audioEngine.setMuted(muted);
  }, [muted]);

  const appendChatter = useCallback((agentId, tag, text) => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    setChatter(prev => [{ id: `ch-${Date.now()}-${Math.random()}`, agentId, tag, time, text }, ...prev].slice(0, 30));
  }, []);

  // Fetch initial MCP bridge telemetry, Neon logs, and Master pending count
  const refreshBridgeAndLogs = useCallback(async () => {
    try {
      const [mcpRes, logsRes] = await Promise.all([
        fetch('/api/agent/mcp-bridge', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/agent/orchestrate', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (mcpRes.ok) {
        const mData = await mcpRes.json();
        setMcpInfo(mData);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setNeonLogs(lData.logs || []);
      }
      if (user?.role === 'MASTER_ADMIN') {
        const uRes = await fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } });
        if (uRes.ok) {
          const uData = await uRes.json();
          setPendingUsersCount(uData.pendingCount || 0);
        }
      }
    } catch {
      // Retain last known telemetry
    }
  }, [token, user]);

  useEffect(() => {
    refreshBridgeAndLogs();
  }, [refreshBridgeAndLogs]);

  // Real-time workforce timer, moment bar progression, and breakroom autonomous wander (2400ms cycle)
  useEffect(() => {
    const secTimer = setInterval(() => {
      setWorkBotSeconds(s => s + 1);
    }, 1000);

    const floorTick = setInterval(() => {
      setWires(prev =>
        prev.map(w => {
          if (w.status === 'IN_PROGRESS' || w.status === 'LIVE' || w.status === 'WOKEN') {
            const nextM = w.moment >= 99 ? 68 : w.moment + 1;
            return { ...w, moment: nextM };
          }
          return w;
        })
      );

      if (!councilActive) {
        setAgents(prev =>
          prev.map(a => {
            if (a.id === 'ORCH-01') return a;
            if (Math.random() < 0.18) {
              const atDesk = Math.hypot(a.targetCoord.x - a.deskCoord.x, a.targetCoord.y - a.deskCoord.y) < 0.2;
              if (atDesk) {
                const wp = WAYPOINTS.BREAKROOM[Math.floor(Math.random() * WAYPOINTS.BREAKROOM.length)];
                return { ...a, targetCoord: { x: wp.x, y: wp.y }, state: 'THINKING' };
              }
              return { ...a, targetCoord: { ...a.deskCoord }, state: 'TYPING' };
            }
            return a;
          })
        );
      }
    }, 2400);

    return () => {
      clearInterval(secTimer);
      clearInterval(floorTick);
    };
  }, [councilActive]);

  const toggleCouncil = useCallback(() => {
    audioEngine.play('doubleTick');
    setBurstSignal(s => s + 1);
    setCouncilActive(prev => {
      const next = !prev;
      setAgents(curr =>
        curr.map((ag, idx) => {
          if (next) {
            const wp = WAYPOINTS.CONFERENCE[idx % WAYPOINTS.CONFERENCE.length];
            return {
              ...ag,
              state: 'DEBATING',
              targetCoord: {
                x: wp.x + ((idx % 3) * 0.28 - 0.25),
                y: wp.y + (Math.floor(idx / 3) * 0.22 - 0.2)
              },
              speechBubble: `Council debate active on ${ag.activeWireId}.`
            };
          }
          return {
            ...ag,
            state: ag.id === 'SEC-05' || ag.id === 'QA-08' ? 'REVIEWING' : 'TYPING',
            targetCoord: { ...ag.deskCoord }
          };
        })
      );
      appendChatter(
        'ORCH-01',
        'DEBATE',
        next
          ? 'Summoned all 10 specialists to Conference Room for Grok Council debate.'
          : 'Grok Council adjourned; all 10 specialists returning to workstation desks.'
      );
      return next;
    });
  }, [appendChatter]);

  const handlePromote = () => {
    audioEngine.play('chimeB');
    setBurstSignal(s => s + 1);
    const oldPreview = previewHash;
    const nextPreview = randomHex9();
    setProdHash(oldPreview);
    setPreviewHash(nextPreview);
    setPreviewHeld(false);
    setCommitsCount(c => c + 1);
    const nowTime = new Date().toTimeString().slice(0, 8) + ' CT';
    setShipLog(prev => [
      {
        id: `ship-${Date.now()}`,
        hash: oldPreview,
        time: nowTime,
        wireId: 'GATE-011',
        agentId: 'SRE-10',
        message: `release(prod): promoted verified build ${oldPreview} via Edge Release Gate`,
        delta: '+214/-18',
        stage: 'PRODUCTION'
      },
      ...prev
    ]);
    appendChatter('SRE-10', 'COMMIT', `Promoted ${oldPreview} to PRODUCTION. Next preview ${nextPreview} warm.`);
  };

  const handleUnblockWire = wireId => {
    audioEngine.play('chimeA');
    setBurstSignal(s => s + 1);
    setWires(prev =>
      prev.map(w =>
        w.id === wireId
          ? { ...w, status: 'VERIFIED', moment: 100, detail: 'VERIFIED · gate cleared by operator & SEC-05' }
          : w
      )
    );
    appendChatter('SEC-05', 'GATE', `Unblocked wire ${wireId}: cryptographic & regression gate cleared.`);
  };

  const handleCopyCode = async code => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedFlag(true);
      audioEngine.play('tick');
      setTimeout(() => setCopiedFlag(false), 1800);
    } catch {
      // Clipboard blocked
    }
  };

  const dispatchMission = async customPrompt => {
    const text = (customPrompt ?? promptInput).trim();
    if (!text || isExecuting) return;

    audioEngine.play('blip');
    setIsExecuting(true);
    setBurstSignal(s => s + 1);
    if (customPrompt === undefined) setPromptInput('');

    setMessages(prev => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: 'user',
        text,
        mode: chatMode,
        target: targetAgent,
        priority
      }
    ]);

    if (chatMode === 'GROK_COUNCIL') {
      setAgents(curr =>
        curr.map((ag, idx) => {
          if (targetAgent !== 'ALL' && ag.id !== targetAgent && ag.id !== 'ORCH-01') return ag;
          const wp = WAYPOINTS.CONFERENCE[idx % WAYPOINTS.CONFERENCE.length];
          return {
            ...ag,
            state: 'DEBATING',
            targetCoord: { x: wp.x + ((idx % 3) - 1) * 0.22, y: wp.y + (Math.floor(idx / 3) - 1) * 0.18 },
            speechBubble: `Debating: ${text.slice(0, 32)}...`
          };
        })
      );
    }

    try {
      const res = await fetch('/api/agent/orchestrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: text,
          mode: chatMode,
          targetAgent,
          priority,
          wireCounter,
          useNeonHydrogen,
          provider: aiProvider,
          model: aiModel,
          apiKey: geminiApiKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          { id: `err-${Date.now()}`, role: 'assistant', text: data.error || 'Gagal menjalankan orkestrasi agen.', traces: [], councilVotes: [] }
        ]);
        return;
      }

      audioEngine.play('chimeB');
      setWireCounter(c => c + 3);
      if (data.newWires?.length) {
        const wiredWithArt = data.newWires.map((w, idx) => (idx === 1 ? { ...w, artifact: data.artifact } : w));
        setWires(prev => [...wiredWithArt, ...prev]);
        setSelectedWireId(wiredWithArt[1]?.id || wiredWithArt[0].id);
        setCodeAdded(c => c + 1175);
        setCodeRemoved(c => c + 71);
        setCommitsCount(c => c + 1);
      }
      if (data.artifact) {
        setActiveArtifact(data.artifact);
      }

      // Update floor agents telemetry & bubbles
      setAgents(prev =>
        prev.map(a => {
          const tr = data.traces?.find(x => x.agentId === a.id);
          if (!tr) return a;
          return {
            ...a,
            activeWireId: tr.wireId,
            tokensProcessed: a.tokensProcessed + tr.tokens,
            tasksCompleted: a.tasksCompleted + 1,
            speechBubble: `${tr.tool}: ${tr.wireId} (${tr.confidence}%)`,
            speechUpdatedAt: Date.now()
          };
        })
      );

      appendChatter(
        'ORCH-01',
        'DISPATCH',
        `Neon Hydrogen executed "${text.slice(0, 48)}" -> ${data.newWires?.map(w => w.id).join(', ')} (${data.totalTokens} tokens).`
      );

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          engine: data.engine,
          transport: data.transport,
          text: data.synthesis,
          wires: data.newWires?.map(w => w.id) || [],
          traces: data.traces || [],
          councilVotes: data.councilVotes || [],
          dagSchedule: data.dagSchedule || null,
          auditReport: data.auditReport || null,
          councilQuorum: data.councilQuorum || null,
          providerUsed: data.providerUsed || 'ANTIGRAVITY_MCP',
          artifact: data.artifact,
          executionId: data.executionId,
          elapsedMs: data.elapsedMs
        }
      ]);

      refreshBridgeAndLogs();

      if (chatMode === 'GROK_COUNCIL' && !councilActive) {
        setTimeout(() => {
          setAgents(curr => curr.map(ag => ({ ...ag, targetCoord: { ...ag.deskCoord }, state: 'TYPING' })));
        }, 1800);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', text: 'Koneksi ke endpoint orkestrasi terputus.', traces: [], councilVotes: [] }
      ]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  };

  const testGeminiDirect = async () => {
    if (!geminiApiKey.trim()) {
      setApiTestStatus('Mode Antigravity Pro Plan Credit Bridge aktif langsung tanpa API key.');
      return;
    }
    setApiTestStatus('Menguji koneksi ke Google Gemini API...');
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(geminiApiKey.trim())}`);
      if (r.ok) {
        setApiTestStatus('TERHUBUNG: Google Gemini Direct API aktif di RAM sesi ini.');
      } else {
        setApiTestStatus('Kunci API ditolak. Sistem tetap berjalan penuh via Antigravity Pro Plan Credit Bridge.');
      }
    } catch {
      setApiTestStatus('Gagal menjangkau endpoint Gemini. Menggunakan Antigravity Pro Plan Credit Bridge.');
    }
  };

  const pingMcpBridge = async cmd => {
    audioEngine.play('tick');
    try {
      const res = await fetch('/api/agent/mcp-bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setMcpInfo(data);
      setMcpPingResult(data.rpcResponse || null);
      audioEngine.play('chimeA');
    } catch {
      setMcpPingResult({ ack: false, command: cmd });
    }
  };

  const selectedAgent = useMemo(
    () => agents.find(a => a.id === selectedAgentId) || agents[0],
    [agents, selectedAgentId]
  );

  const selectedWire = useMemo(
    () => wires.find(w => w.id === selectedWireId) || wires[0],
    [wires, selectedWireId]
  );

  const wireBarColor = status => {
    if (status === 'BLOCKED') return 'bg-wire-red';
    if (status === 'HELD' || status === 'AT_BAT') return 'bg-wire-amber';
    if (status === 'VERIFIED' || status === 'SHIPPED') return 'bg-wire-green';
    return 'bg-wire-cyan';
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-bg text-fg">
      {/* TOP HEADER BAR */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-terminal-card px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg border border-accent/50 bg-accent/15 font-display text-sm font-extrabold text-accent">
            AR
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="font-display text-sm font-extrabold tracking-tight text-fg sm:text-base">
                {t.brand.name}
              </h1>
              <span className="rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-accent">
                {t.brand.modelBadge}
              </span>
              <span className="hidden rounded border border-wire-cyan/40 bg-wire-cyan/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-wire-cyan md:inline">
                {t.brand.neonBadge}
              </span>
            </div>
            <p className="hidden font-mono text-[9.5px] uppercase tracking-wider text-muted xl:block">
              {t.brand.subtitle}
            </p>
          </div>
        </div>

        {/* Center View Mode Tabs */}
        <nav aria-label="Workspace views" className="flex items-center gap-1">
          {[
            { id: 'FLOOR', label: t.tabs.floor, icon: Layers },
            { id: 'DOTS_DAG', label: t.tabs.dots, icon: GitBranch },
            { id: 'GROK_COUNCIL', label: t.tabs.council, icon: Users },
            { id: 'ARTIFACTS', label: t.tabs.artifacts, icon: Code2 }
          ].map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  audioEngine.play('tick');
                  setActiveTab(item.id);
                }}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? 'bg-fg text-bg'
                    : 'border border-line bg-terminal-bg text-muted hover:text-fg'
                }`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowMcpModal(true)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded border border-wire-green/50 bg-wire-green/10 px-2.5 py-1 font-mono text-[10.5px] font-semibold text-wire-green hover:bg-wire-green/20"
          >
            <Radio className="size-3.5 animate-pulse" aria-hidden="true" />
            <span className="hidden sm:inline">MCP: {mcpInfo?.status || 'LIVE'}</span>
          </button>

          <a
            href="/api/download/setup"
            className="inline-flex min-h-9 items-center gap-1.5 rounded border border-wire-cyan/50 bg-wire-cyan/10 px-2.5 py-1 font-mono text-[10.5px] font-semibold text-wire-cyan hover:bg-wire-cyan/20"
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span className="hidden xl:inline">{t.controls.downloadExe}</span>
          </a>

          {user?.role === 'MASTER_ADMIN' && (
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded border border-accent bg-accent/15 px-2.5 py-1 font-mono text-[10.5px] font-bold text-accent hover:bg-accent/25"
            >
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              <span>ADMIN ACC</span>
              {pendingUsersCount > 0 && (
                <span className="rounded-full bg-accent px-1.5 py-0.2 text-[9px] text-bg">
                  {pendingUsersCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowEngineModal(true)}
            className="inline-flex min-h-9 items-center gap-1 rounded border border-line-strong bg-terminal-bg px-2.5 py-1 font-mono text-[10.5px] font-semibold text-fg hover:border-wire-cyan"
          >
            <Key className="size-3.5 text-wire-amber" aria-hidden="true" />
            <span className="hidden sm:inline">
              {aiProvider === 'ANTIGRAVITY_MCP' ? t.controls.aiCore : `${aiProvider}: LIVE`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMuted(m => !m)}
            aria-label="Toggle audio"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-line bg-terminal-bg text-muted hover:text-fg"
          >
            {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setLocale(l => (l === 'id' ? 'en' : 'id'))}
            aria-label={t.controls.switchLang}
            className="inline-flex min-h-9 items-center gap-1 rounded border border-line bg-terminal-bg px-2 font-mono text-[10.5px] font-semibold uppercase text-muted hover:text-fg"
          >
            <Globe className="size-3.5" aria-hidden="true" />
            <span>{locale}</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(th => (th === 'dark' ? 'light' : 'dark'))}
            aria-label={t.controls.switchTheme}
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-line bg-terminal-bg text-muted hover:text-fg"
          >
            {theme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>

          <button
            type="button"
            onClick={onLogout}
            title={`Keluar (${user?.username})`}
            aria-label="Logout"
            className="inline-flex min-h-9 items-center gap-1 rounded border border-line bg-terminal-bg px-2 font-mono text-[10.5px] text-muted hover:border-wire-red hover:text-wire-red"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            <span className="hidden 2xl:inline">{user?.username}</span>
          </button>
        </div>
      </header>

      {/* MAIN WORKSTATION BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT TELEMETRY & WIRES SIDEBAR */}
        <aside className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-line bg-terminal-bg p-3 lg:flex xl:w-80">
          {/* CLUSTER / EDGE COMPUTE MESH */}
          <div className="rounded-lg border border-line bg-terminal-card p-3">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted">
              <span>{t.sidebar.clusterTitle}</span>
              <span className="text-wire-cyan">{t.sidebar.clusterMesh}</span>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div className="rounded border border-line bg-terminal-bg p-2">
                <p className="font-mono text-[9.5px] uppercase text-wire-green">{t.sidebar.prodTitle}</p>
                <p className="mt-0.5 font-mono text-xs font-bold text-fg">{prodHash}</p>
                <p className="font-mono text-[9px] text-muted">{t.sidebar.prodSub}</p>
              </div>
              <div className="rounded border border-line bg-terminal-bg p-2">
                <p className="font-mono text-[9.5px] uppercase text-wire-amber">{t.sidebar.previewTitle}</p>
                <p className="mt-0.5 font-mono text-xs font-bold text-fg">{previewHash}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted">
                    {previewHeld ? t.sidebar.previewUnconfirmed : t.sidebar.previewVerified}
                  </span>
                  <button
                    type="button"
                    onClick={handlePromote}
                    className="rounded bg-accent px-1.5 py-0.5 font-mono text-[9px] font-bold text-bg hover:opacity-90"
                  >
                    {t.controls.promote}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WORKFORCE TELEMETRY */}
          <div className="mt-3 rounded-lg border border-line bg-terminal-card p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
              {t.sidebar.workforceTitle}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono">
              <div className="rounded border border-line bg-terminal-bg p-2">
                <p className="text-[9px] text-muted">{t.sidebar.agentsOnFloor}</p>
                <p className="text-sm font-bold text-wire-green">10 / 10</p>
                <p className="text-[9px] text-faint">{t.sidebar.keepAlive}</p>
              </div>
              <div className="rounded border border-line bg-terminal-bg p-2">
                <p className="text-[9px] text-muted">{t.sidebar.workBotTime}</p>
                <p className="text-sm font-bold text-fg">{formatTimer(workBotSeconds)}</p>
                <p className="text-[9px] text-faint">ING 124.8k · Fetch 32940</p>
              </div>
              <div className="rounded border border-line bg-terminal-bg p-2">
                <p className="text-[9px] text-muted">{t.sidebar.codeDelta}</p>
                <p className="text-xs font-bold text-wire-cyan">+{codeAdded} / -{codeRemoved}</p>
                <p className="text-[9px] text-faint">+{commitsCount} {t.sidebar.commitsSinceMidnight}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ARTIFACTS')}
                className="rounded border border-line bg-terminal-bg p-2 text-left transition-colors hover:border-wire-cyan"
              >
                <p className="text-[9px] text-muted">{t.sidebar.shipLog}</p>
                <p className="text-xs font-bold text-fg">{shipLog.length + neonLogs.length} entries</p>
                <p className="text-[9px] text-wire-cyan">{t.sidebar.appendOnlyTape}</p>
              </button>
            </div>
          </div>

          {/* WIRES MOMENT BARS */}
          <div className="mt-3 rounded-lg border border-line bg-terminal-card p-3">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-muted">{t.sidebar.wiresHeader}</span>
              <span className="font-bold text-wire-cyan">{wires.length}</span>
            </div>

            <div className="mt-2.5 space-y-2">
              {wires.slice(0, 8).map(w => {
                const isSel = selectedWireId === w.id;
                const clamped = Math.max(12, Math.min(100, w.moment));
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedWireId(w.id);
                      setSelectedAgentId(w.assignedAgentId);
                      if (w.artifact) setActiveArtifact(w.artifact);
                      audioEngine.play('tick');
                    }}
                    className={`cursor-pointer rounded border p-2 transition-colors ${
                      isSel
                        ? 'border-wire-cyan bg-wire-cyan/10'
                        : 'border-line bg-terminal-bg hover:border-line-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 font-mono text-[10.5px]">
                      <span className="font-bold text-fg">{w.id}</span>
                      <span className="truncate text-[10px] text-muted">{w.assignedAgentId}</span>
                      {(w.status === 'BLOCKED' || w.status === 'HELD') && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleUnblockWire(w.id);
                          }}
                          className="inline-flex items-center gap-0.5 rounded bg-wire-amber px-1.5 py-0.5 text-[9px] font-bold text-bg hover:opacity-90"
                        >
                          <Unlock className="size-2.5" /> {t.controls.unblock}
                        </button>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-fg">{w.title}</p>
                    <p className="truncate font-mono text-[9.5px] text-muted">{w.detail}</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full transition-all duration-500 ${wireBarColor(w.status)}`}
                        style={{ width: `${clamped}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FLOOR CHATTER */}
          <div className="mt-3 rounded-lg border border-line bg-terminal-card p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
              {t.sidebar.floorChatter}
            </p>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto pr-1 font-mono text-[10px]">
              {chatter.map(c => (
                <div key={c.id} className="border-l-2 border-line-strong pl-2">
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="font-bold text-wire-cyan">{c.agentId}</span>
                    <span className="text-faint">{c.tag} · {c.time}</span>
                  </div>
                  <p className="mt-0.5 text-muted">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER PRIMARY WORKSPACE + RIGHT LIVE ORCHESTRATOR */}
        <main className="flex flex-1 flex-col overflow-hidden xl:flex-row">
          {/* CENTER VIEWPORT */}
          <section className="relative flex flex-1 flex-col overflow-hidden">
            {activeTab === 'FLOOR' && (
              <>
                <FloorCanvas3D
                  agents={agents}
                  wires={wires}
                  selectedAgentId={selectedAgentId}
                  onSelectAgent={id => {
                    setSelectedAgentId(id);
                    audioEngine.play('tick');
                  }}
                  showDagLinks={showDagLinks}
                  onToggleDagLinks={() => {
                    setShowDagLinks(v => !v);
                    audioEngine.play('tick');
                  }}
                  onSummonCouncil={toggleCouncil}
                  councilActive={councilActive}
                  theme={theme}
                  locale={locale}
                  t={t}
                  burstSignal={burstSignal}
                />

                {/* Preview Hold Toast */}
                {previewHeld && (
                  <div className="absolute bottom-16 left-3 z-20 flex items-center gap-3 rounded-lg border border-wire-amber/60 bg-terminal-card/95 px-3 py-2 font-mono text-[11px] shadow-lg backdrop-blur-sm">
                    <span className="text-wire-amber">
                      {t.sidebar.previewHeld} ({previewHash})
                    </span>
                    <button
                      type="button"
                      onClick={handlePromote}
                      className="rounded bg-wire-amber px-2 py-0.5 text-[10px] font-bold text-bg hover:opacity-90"
                    >
                      {t.controls.promote}
                    </button>
                  </div>
                )}

                {/* Selected Agent Telemetry Strip */}
                {selectedAgent && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-terminal-card px-4 py-2 font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-wire-cyan/15 px-2 py-0.5 font-bold text-wire-cyan">
                        {selectedAgent.id}
                      </span>
                      <span className="font-bold text-fg">{selectedAgent.name}</span>
                      <span className="text-muted">({selectedAgent.scrantonAlias})</span>
                      <span className="hidden text-faint md:inline">
                        · {locale === 'id' ? selectedAgent.roleId : selectedAgent.roleEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-muted">
                        Wire: <strong className="text-fg">{selectedAgent.activeWireId}</strong>
                      </span>
                      <span className="hidden text-muted sm:inline">
                        Tokens: <strong className="text-wire-green">{selectedAgent.tokensProcessed.toLocaleString()}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetAgent(selectedAgent.id);
                          setChatMode('DIRECT_ASSIGN');
                          audioEngine.play('tick');
                        }}
                        className="rounded border border-wire-cyan/50 bg-wire-cyan/10 px-2 py-0.5 font-bold text-wire-cyan hover:bg-wire-cyan/20"
                      >
                        @{selectedAgent.id}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'DOTS_DAG' && (
              <div className="flex-1 overflow-y-auto bg-terminal-bg p-5">
                <div className="mx-auto max-w-4xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-wire-cyan">
                        OPENAI DOTS DAG · PARALLEL WIRE ORCHESTRATION GRAPH
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-fg">
                        {locale === 'id' ? 'Graf Eksekusi Paralel & Dependensi Wire' : 'Parallel Execution Graph & Wire Dependencies'}
                      </h2>
                    </div>
                    <button
                      type="button"
                      disabled={isExecuting}
                      onClick={() => dispatchMission('Jalankan gelombang optimasi DAG lintas 10 agen dengan verifikasi Neon Hydrogen')}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded bg-wire-cyan px-3.5 py-1.5 font-mono text-xs font-bold text-bg disabled:opacity-50"
                    >
                      <Play className="size-3.5" aria-hidden="true" />
                      <span>{t.controls.runDagWave}</span>
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {wires.map(w => (
                      <div
                        key={w.id}
                        className="rounded-lg border border-line bg-terminal-card p-4 transition-colors hover:border-wire-cyan"
                      >
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-wire-cyan">DOT // {w.id}</span>
                          <span className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
                            {w.priority} · {w.status}
                          </span>
                        </div>
                        <h3 className="mt-2 font-sans text-sm font-bold text-fg">{w.title}</h3>
                        <p className="mt-1 font-mono text-[11px] text-muted">{w.detail}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5 font-mono text-[10.5px]">
                          <span className="text-fg">Agent: {w.assignedAgentId}</span>
                          <span className="text-wire-green">+{w.deltaAdded} / -{w.deltaRemoved} LOC</span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-faint">
                          Deps: {w.dependencies?.length ? w.dependencies.join(', ') : 'ROOT_NODE'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'GROK_COUNCIL' && (
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
                        setChatMode('GROK_COUNCIL');
                        toggleCouncil();
                      }}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded bg-wire-purple px-3.5 py-1.5 font-mono text-xs font-bold text-bg"
                    >
                      <Users className="size-3.5" aria-hidden="true" />
                      <span>{councilActive ? t.controls.councilReturn : t.controls.councilSummon}</span>
                    </button>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {agents.map(ag => (
                      <div
                        key={ag.id}
                        onClick={() => setSelectedAgentId(ag.id)}
                        className={`cursor-pointer rounded-lg border bg-terminal-card p-4 transition-colors ${
                          selectedAgentId === ag.id ? 'border-wire-purple' : 'border-line hover:border-wire-purple/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-wire-purple">{ag.id}</span>
                            <span className="ml-2 font-sans text-sm font-bold text-fg">{ag.name}</span>
                            <span className="ml-1.5 font-mono text-[11px] text-muted">({ag.scrantonAlias})</span>
                          </div>
                          <span className="rounded bg-wire-green/15 px-2 py-0.5 font-mono text-[10.5px] font-bold text-wire-green">
                            {ag.confidenceScore}%
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-wire-cyan">
                          {locale === 'id' ? ag.roleId : ag.roleEn}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          {locale === 'id' ? ag.directiveId : ag.directiveEn}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {ag.tools.map(tool => (
                            <span
                              key={tool}
                              className="rounded border border-line bg-terminal-bg px-2 py-0.5 font-mono text-[10px] text-muted"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ARTIFACTS' && (
              <div className="flex-1 overflow-y-auto bg-terminal-bg p-5">
                <div className="mx-auto max-w-5xl space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-wire-green">
                        SANDBOX ARTIFACTS & APPEND-ONLY NEON SHIP-LOG TAPE
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-fg">
                        {locale === 'id' ? 'Pratinjau Sandbox & Rekaman Tape Terverifikasi' : 'Sandbox Runtime & Verified Tape Ledger'}
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {wires.filter(w => w.artifact).map(w => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setSelectedWireId(w.id);
                            setActiveArtifact(w.artifact);
                          }}
                          className={`rounded border px-2.5 py-1 font-mono text-[11px] font-semibold ${
                            activeArtifact?.wireId === w.id
                              ? 'border-wire-cyan bg-wire-cyan/15 text-wire-cyan'
                              : 'border-line bg-terminal-card text-muted hover:text-fg'
                          }`}
                        >
                          {w.id}: {w.artifact.filename.split('/').pop()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SandboxPreview
                    artifact={activeArtifact}
                    wire={selectedWire}
                    locale={locale}
                    onCopy={handleCopyCode}
                    isCopied={copiedFlag}
                  />

                  {/* Append-Only Ship-Log + Live Neon PostgreSQL Audit Entries */}
                  <div className="rounded-xl border border-line-strong bg-terminal-card p-4">
                    <div className="flex items-center justify-between border-b border-line pb-2.5">
                      <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-fg">
                        APPEND-ONLY SHIP-LOG TAPE (NEON POSTGRESQL PERSISTED)
                      </h3>
                      <span className="font-mono text-[10.5px] text-wire-green">
                        {neonLogs.length} Neon DB Records + {shipLog.length} Release Commits
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 font-mono text-xs">
                      {neonLogs.map(log => (
                        <div key={`db-${log.id}`} className="rounded border border-wire-cyan/30 bg-terminal-bg p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <span className="font-bold text-wire-cyan">
                              NEON-LOG #{log.id} · {log.agent_id} · {log.wire_id}
                            </span>
                            <span className="text-wire-green">
                              {log.confidence}% conf · {log.tokens} tok · {new Date(log.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="mt-1 text-fg">{log.task_action}</p>
                        </div>
                      ))}

                      {shipLog.map(item => (
                        <div key={item.id} className="rounded border border-line bg-terminal-bg p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <span className="font-bold text-fg">
                              {item.hash} · {item.wireId} · {item.agentId}
                            </span>
                            <span className={item.stage === 'PRODUCTION' ? 'text-wire-green' : 'text-wire-amber'}>
                              {item.stage} · {item.delta} · {item.time}
                            </span>
                          </div>
                          <p className="mt-1 text-muted">{item.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT LIVE ORCHESTRATOR CHAT PANEL */}
          <section className="flex h-[38vh] w-full shrink-0 flex-col border-t border-line bg-terminal-card xl:h-full xl:w-[410px] xl:border-t-0 xl:border-l">
            <div className="border-b border-line p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-wider text-fg">
                  {t.chat.header}
                </span>
                <span className="rounded bg-wire-green/15 px-2 py-0.5 font-mono text-[9.5px] font-bold text-wire-green">
                  {t.chat.readyBadge}
                </span>
              </div>

              {/* Mode Selector + Neon Hydrogen Toggle */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'AUTO_DAG', label: t.chat.modeAutoDag, cls: 'border-wire-cyan bg-wire-cyan/15 text-wire-cyan' },
                  { id: 'GROK_COUNCIL', label: t.chat.modeGrokCouncil, cls: 'border-wire-purple bg-wire-purple/15 text-wire-purple' },
                  { id: 'DIRECT_ASSIGN', label: t.chat.modeDirect, cls: 'border-accent bg-accent/15 text-accent' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setChatMode(m.id)}
                    className={`rounded border px-2 py-1 font-mono text-[10px] font-semibold transition-colors ${
                      chatMode === m.id ? m.cls : 'border-line bg-terminal-bg text-muted hover:text-fg'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setUseNeonHydrogen(v => !v)}
                  className={`ml-auto inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-[10px] font-bold ${
                    useNeonHydrogen
                      ? 'border-wire-green bg-wire-green/15 text-wire-green'
                      : 'border-line bg-terminal-bg text-muted'
                  }`}
                >
                  <Zap className="size-3" />
                  <span>NEON-H2</span>
                </button>
              </div>

              {/* Target & Priority Row */}
              <div className="mt-2 flex items-center gap-2 font-mono text-[10.5px]">
                <label htmlFor="target-agent" className="text-muted">{t.chat.targetLabel}</label>
                <select
                  id="target-agent"
                  value={targetAgent}
                  onChange={e => setTargetAgent(e.target.value)}
                  className="flex-1 rounded border border-line bg-terminal-bg px-2 py-1 text-fg outline-none focus:border-wire-cyan"
                >
                  <option value="ALL">{t.chat.allAgency}</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      @{a.id} ({a.name})
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  {['P0', 'P1', 'P2'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                        priority === p ? 'border-accent bg-accent text-bg' : 'border-line bg-terminal-bg text-muted'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`animate-argon-enter rounded-lg border p-3 font-mono text-xs ${
                    msg.role === 'user'
                      ? 'border-accent/40 bg-accent/10'
                      : 'border-line bg-terminal-bg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px]">
                    <span className={msg.role === 'user' ? 'font-bold text-accent' : 'font-bold text-wire-cyan'}>
                      {msg.role === 'user' ? t.chat.userSender : msg.engine || 'GEMINI 4 ARGON HIGH'}
                    </span>
                    {msg.elapsedMs && <span className="text-faint">{msg.elapsedMs}ms</span>}
                  </div>

                  <p className="mt-1.5 whitespace-pre-wrap text-[11.5px] leading-relaxed text-fg">
                    {msg.text}
                  </p>

                  {msg.auditReport && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className={`rounded border px-1.5 py-0.5 font-bold ${msg.auditReport.passed ? 'border-wire-green/50 bg-wire-green/10 text-wire-green' : 'border-wire-red/50 bg-wire-red/10 text-wire-red'}`}>
                        ZERO-TRUST {msg.auditReport.securityScore}/100
                      </span>
                      {msg.dagSchedule && (
                        <span className="rounded border border-wire-cyan/40 bg-wire-cyan/10 px-1.5 py-0.5 font-bold text-wire-cyan">
                          KAHN DAG: {msg.dagSchedule.criticalPathDepth} WAVES ({msg.dagSchedule.acyclic ? 'ACYCLIC' : 'CYCLE'})
                        </span>
                      )}
                      {msg.councilQuorum && (
                        <span className="rounded border border-wire-purple/40 bg-wire-purple/10 px-1.5 py-0.5 font-bold text-wire-purple">
                          QUORUM {msg.councilQuorum.clearVotes}/{msg.councilQuorum.totalVoters}
                        </span>
                      )}
                    </div>
                  )}

                  {msg.wires?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.wires.map(wId => (
                        <button
                          key={wId}
                          type="button"
                          onClick={() => {
                            setSelectedWireId(wId);
                            setActiveTab('DOTS_DAG');
                          }}
                          className="rounded border border-wire-cyan/40 bg-wire-cyan/10 px-1.5 py-0.5 text-[10px] font-bold text-wire-cyan hover:bg-wire-cyan/20"
                        >
                          {wId}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.traces?.length > 0 && (
                    <details className="mt-2 rounded border border-line bg-terminal-card p-2">
                      <summary className="cursor-pointer text-[10px] font-bold text-wire-cyan">
                        {t.chat.tracesHeader} ({msg.traces.length})
                      </summary>
                      <div className="mt-1.5 space-y-1 text-[10px] text-muted">
                        {msg.traces.map(tr => (
                          <p key={tr.agentId}>
                            <strong className="text-fg">{tr.agentId}</strong>: {tr.verdict}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}

                  {msg.councilVotes?.length > 0 && (
                    <div className="mt-2 rounded border border-wire-purple/40 bg-wire-purple/5 p-2">
                      <p className="text-[10px] font-bold text-wire-purple">{t.chat.councilHeader}</p>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">
                        {msg.councilVotes.map(v => (
                          <div key={v.agentId} className="rounded border border-line bg-terminal-bg px-1.5 py-1">
                            <span className="font-bold text-fg">{v.agentId}</span>
                            <span className="ml-1 text-wire-green">{v.vote} {v.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.artifact && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveArtifact(msg.artifact);
                          setActiveTab('ARTIFACTS');
                        }}
                        className="inline-flex items-center gap-1 rounded bg-wire-green px-2 py-1 text-[10px] font-bold text-bg"
                      >
                        <ExternalLink className="size-3" /> {t.controls.openSandbox}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(msg.artifact.code)}
                        className="inline-flex items-center gap-1 rounded border border-line-strong px-2 py-1 text-[10px] text-fg"
                      >
                        {copiedFlag ? <Check className="size-3 text-wire-green" /> : <Code2 className="size-3" />}
                        <span>{copiedFlag ? t.controls.copied : t.controls.copyCode}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isExecuting && (
                <div className="rounded-lg border border-wire-cyan/40 bg-wire-cyan/10 p-3 font-mono text-xs text-wire-cyan animate-pulse">
                  {t.chat.executing}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Mission Presets & Composer */}
            <div className="border-t border-line p-3">
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {(MISSION_PRESETS[locale] || MISSION_PRESETS.id).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isExecuting}
                    onClick={() => dispatchMission(preset)}
                    className="shrink-0 rounded border border-line bg-terminal-bg px-2 py-1 font-mono text-[10px] text-muted transition-colors hover:border-wire-cyan hover:text-fg"
                  >
                    {preset.slice(0, 34)}...
                  </button>
                ))}
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  dispatchMission();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  rows={2}
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      dispatchMission();
                    }
                  }}
                  placeholder={t.chat.placeholder}
                  className="flex-1 resize-none rounded-lg border border-line-strong bg-terminal-bg p-2 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
                />
                <button
                  type="submit"
                  disabled={isExecuting || !promptInput.trim()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 font-mono text-xs font-bold uppercase text-bg hover:opacity-90 disabled:opacity-40"
                >
                  <Send className="size-3.5" aria-hidden="true" />
                  <span>{t.controls.dispatch}</span>
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>

      {/* ENGINE CONFIG MODAL */}
      {showEngineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-line-strong bg-terminal-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Cpu className="size-5 text-wire-cyan" />
                <h2 className="font-display text-lg font-bold text-fg">{t.engineModal.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowEngineModal(false)}
                className="rounded border border-line p-1 text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">{t.engineModal.description}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="ai-provider" className="block font-mono text-[10.5px] font-bold uppercase text-muted">
                  MULTI-AI PROVIDER ADAPTER (SEAMLESS SWITCH)
                </label>
                <select
                  id="ai-provider"
                  value={aiProvider}
                  onChange={e => {
                    const next = e.target.value;
                    setAiProvider(next);
                    const defaults = {
                      ANTIGRAVITY_MCP: 'neon-hydrogen-xhigh',
                      GEMINI: 'gemini-2.0-flash',
                      OPENAI: 'gpt-4o-mini',
                      ANTHROPIC: 'claude-3-5-sonnet-latest',
                      XAI_GROK: 'grok-2-latest',
                      OPENROUTER: 'deepseek/deepseek-chat'
                    };
                    setAiModel(defaults[next] || 'neon-hydrogen-xhigh');
                    setApiTestStatus('');
                  }}
                  className="mt-1.5 min-h-10 w-full rounded-lg border border-line-strong bg-terminal-bg px-3 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
                >
                  <option value="ANTIGRAVITY_MCP">Antigravity MCP Pro Credit Bridge (Default · Tanpa API Key)</option>
                  <option value="GEMINI">Google Gemini Direct API</option>
                  <option value="OPENAI">OpenAI Chat Completions (GPT-4o / o3)</option>
                  <option value="ANTHROPIC">Anthropic Claude Messages API</option>
                  <option value="XAI_GROK">xAI Grok API</option>
                  <option value="OPENROUTER">OpenRouter Multi-AI (DeepSeek / Llama / Qwen)</option>
                </select>
              </div>

              <div>
                <label htmlFor="ai-model" className="block font-mono text-[10.5px] font-bold uppercase text-muted">
                  TARGET MODEL ID
                </label>
                <input
                  id="ai-model"
                  type="text"
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  className="mt-1.5 min-h-10 w-full rounded-lg border border-line-strong bg-terminal-bg px-3 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
                />
              </div>

              {aiProvider !== 'ANTIGRAVITY_MCP' && (
                <div>
                  <label htmlFor="gemini-key" className="block font-mono text-[10.5px] font-bold uppercase text-muted">
                    SESSION API KEY ({aiProvider} · RAM ONLY)
                  </label>
                  <input
                    id="gemini-key"
                    type="password"
                    value={geminiApiKey}
                    onChange={e => setGeminiApiKey(e.target.value)}
                    placeholder={`Masukkan API key ${aiProvider} (fallback otomatis ke Antigravity jika kosong)`}
                    className="mt-1.5 min-h-10 w-full rounded-lg border border-line-strong bg-terminal-bg px-3 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
                  />
                </div>
              )}
            </div>

            {apiTestStatus && (
              <p className="mt-3 rounded border border-wire-cyan/40 bg-wire-cyan/10 p-2.5 font-mono text-[11px] text-wire-cyan">
                {apiTestStatus}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={testGeminiDirect}
                className="rounded border border-line-strong bg-terminal-bg px-3 py-2 font-mono text-xs font-semibold text-fg hover:border-wire-cyan"
              >
                Test Direct Connection
              </button>
              <button
                type="button"
                onClick={() => setShowEngineModal(false)}
                className="rounded bg-accent px-4 py-2 font-mono text-xs font-bold text-bg"
              >
                Simpan di RAM Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANTIGRAVITY MCP & NEON BRIDGE INSPECTOR MODAL */}
      {showMcpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-line-strong bg-terminal-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-wire-green" />
                <div>
                  <h2 className="font-display text-lg font-bold text-fg">
                    Antigravity MCP Pro Plan Bridge & Neon Telemetry
                  </h2>
                  <p className="font-mono text-[11px] text-wire-green">
                    {mcpInfo?.billingChannel || 'Antigravity Pro Plan Account Credit (Non-API-Key Direct Runtime)'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMcpModal(false)}
                className="rounded border border-line p-1 text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="rounded border border-line bg-terminal-bg p-3">
                <p className="text-[10px] text-muted">MCP PROTOCOL</p>
                <p className="mt-1 font-bold text-fg">{mcpInfo?.status || 'CONNECTED'}</p>
              </div>
              <div className="rounded border border-line bg-terminal-bg p-3">
                <p className="text-[10px] text-muted">NEON POSTGRESQL LATENCY</p>
                <p className="mt-1 font-bold text-wire-cyan">
                  {mcpInfo?.neonDatabase?.latencyMs ?? '--'} ms
                </p>
              </div>
              <div className="rounded border border-line bg-terminal-bg p-3">
                <p className="text-[10px] text-muted">NEON AUDIT LOGS</p>
                <p className="mt-1 font-bold text-wire-green">
                  {mcpInfo?.neonDatabase?.persistedAuditLogs ?? 0} rows
                </p>
              </div>
              <div className="rounded border border-line bg-terminal-bg p-3">
                <p className="text-[10px] text-muted">OPERATOR SESSION</p>
                <p className="mt-1 font-bold text-accent">
                  {user?.username} ({user?.role})
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['PING_MCP', 'SYNC_NEON_HYDROGEN', 'VERIFY_PROVIDERS', 'RUN_DEEP_AUDIT', 'RUN_DAG_WAVE', 'COUNCIL_CONSENSUS'].map(cmd => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => pingMcpBridge(cmd)}
                  className="inline-flex items-center gap-1 rounded border border-wire-cyan/50 bg-wire-cyan/10 px-2.5 py-1.5 font-mono text-[10.5px] font-semibold text-wire-cyan hover:bg-wire-cyan/20"
                >
                  <Terminal className="size-3" /> {cmd}
                </button>
              ))}
            </div>

            {mcpPingResult && (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-wire-green/40 bg-terminal-bg p-3 font-mono text-[11px] text-wire-green">
                {JSON.stringify(mcpPingResult, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* MASTER ADMIN APPROVAL CONSOLE (ONLY FOR nayrbryanGaming) */}
      {showAdminModal && user?.role === 'MASTER_ADMIN' && (
        <MasterAdminModal
          token={token}
          onClose={() => setShowAdminModal(false)}
          onPendingChange={setPendingUsersCount}
        />
      )}
    </div>
  );
}

