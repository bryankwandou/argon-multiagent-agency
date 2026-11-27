import React, { useState } from 'react';
import { Activity, PlugZap, Terminal, X } from 'lucide-react';
import type { AuthUser } from './AuthModal';

export interface McpBridgeInfo {
  status?: string;
  protocol?: string;
  mcpEndpoint?: string;
  engineMode?: string;
  neonDatabase?: {
    connected?: boolean;
    latencyMs?: number;
    persistedAuditLogs?: number;
    registeredAccounts?: number;
  };
  rpcResponse?: Record<string, unknown>;
}

interface McpBridgeModalProps {
  token: string;
  user: AuthUser | null;
  mcpInfo: McpBridgeInfo | null;
  onUpdateMcp: (info: McpBridgeInfo) => void;
  onRequestLogin: () => void;
  onClose: () => void;
}

const DIAGNOSTIC_COMMANDS = [
  'PING_MCP',
  'VERIFY_PROVIDERS',
  'RUN_DEEP_AUDIT',
  'RUN_DAG_WAVE',
  'COUNCIL_CONSENSUS',
];

export function McpBridgeModal({
  token,
  user,
  mcpInfo,
  onUpdateMcp,
  onRequestLogin,
  onClose,
}: McpBridgeModalProps) {
  const [rpcOutput, setRpcOutput] = useState<Record<string, unknown> | null>(
    mcpInfo?.rpcResponse || null
  );
  const [busyCmd, setBusyCmd] = useState<string | null>(null);

  const testRealMcpHandshake = async () => {
    setBusyCmd('MCP_HANDSHAKE');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const initRes = await fetch('/mcp', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'argon-web-inspector', version: '2.1.0' },
          },
        }),
      });
      const initData = await initRes.json();

      const listRes = await fetch('/mcp', {
        method: 'POST',
        headers,
        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }),
      });
      const listData = await listRes.json();

      setRpcOutput({
        endpoint: '/mcp',
        protocolVersion: initData?.result?.protocolVersion,
        serverInfo: initData?.result?.serverInfo,
        discoveredTools: (listData?.result?.tools || []).map((t: { name: string }) => t.name),
      });
    } catch {
      setRpcOutput({ error: 'Network error during MCP 2025-03-26 handshake' });
    } finally {
      setBusyCmd(null);
    }
  };

  const sendCommand = async (command: string) => {
    if (!token) {
      onClose();
      onRequestLogin();
      return;
    }
    setBusyCmd(command);
    try {
      const res = await fetch('/api/agent/mcp-bridge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateMcp(data);
        setRpcOutput(data.rpcResponse || data);
      } else {
        setRpcOutput({ error: data.error || 'RPC rejected' });
      }
    } catch {
      setRpcOutput({ error: 'Network error reaching diagnostics endpoint' });
    } finally {
      setBusyCmd(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-xl rounded-xl border border-line-strong bg-terminal-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-wire-green" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-fg">
                MCP 2025-03-26 Server & Neon Telemetry
              </h2>
              <p className="font-mono text-[11px] text-wire-green">
                {mcpInfo?.engineMode ||
                  'Built-in Deterministic Engine (Kahn DAG + OWASP · External LLM requires session API key)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded border border-line p-1 text-muted hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 font-mono text-xs">
          <div className="rounded border border-line bg-terminal-bg p-3">
            <p className="text-[10px] text-muted">MCP STREAMABLE HTTP</p>
            <p className="mt-1 font-bold text-fg">
              {mcpInfo?.mcpEndpoint || '/mcp'} · {mcpInfo?.status || 'CONNECTED'}
            </p>
          </div>
          <div className="rounded border border-line bg-terminal-bg p-3">
            <p className="text-[10px] text-muted">NEON LATENCY</p>
            <p className="mt-1 font-bold text-wire-cyan">
              {mcpInfo?.neonDatabase?.latencyMs !== undefined
                ? `${mcpInfo.neonDatabase.latencyMs} ms`
                : user
                  ? '--'
                  : 'Login untuk cek'}
            </p>
          </div>
          <div className="rounded border border-line bg-terminal-bg p-3">
            <p className="text-[10px] text-muted">NEON AUDIT LOGS</p>
            <p className="mt-1 font-bold text-wire-green">
              {mcpInfo?.neonDatabase?.persistedAuditLogs ?? '--'}
            </p>
          </div>
          <div className="rounded border border-line bg-terminal-bg p-3">
            <p className="text-[10px] text-muted">SESSION OPERATOR</p>
            <p className="mt-1 font-bold text-accent">
              {user ? `${user.username} (${user.role})` : 'Guest Preview'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busyCmd !== null}
            onClick={testRealMcpHandshake}
            className="inline-flex items-center gap-1 rounded border border-wire-green bg-wire-green/15 px-2.5 py-1.5 font-mono text-[10.5px] font-bold text-wire-green hover:bg-wire-green/25 disabled:opacity-50"
          >
            <PlugZap className="size-3" aria-hidden="true" />
            <span>{busyCmd === 'MCP_HANDSHAKE' ? '...' : 'TEST MCP INITIALIZE + TOOLS/LIST'}</span>
          </button>

          {DIAGNOSTIC_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              disabled={busyCmd !== null}
              onClick={() => sendCommand(cmd)}
              className="inline-flex items-center gap-1 rounded border border-wire-cyan/50 bg-wire-cyan/10 px-2.5 py-1.5 font-mono text-[10.5px] font-semibold text-wire-cyan hover:bg-wire-cyan/20 disabled:opacity-50"
            >
              <Terminal className="size-3" aria-hidden="true" />
              <span>{busyCmd === cmd ? '...' : cmd}</span>
            </button>
          ))}
        </div>

        {rpcOutput && (
          <pre className="mt-3 max-h-56 overflow-auto rounded-lg border border-wire-green/40 bg-terminal-bg p-3 font-mono text-[11px] text-wire-green">
            {JSON.stringify(rpcOutput, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
