import React, { useState } from 'react';
import { Activity, Terminal, X } from 'lucide-react';
import type { AuthUser } from './AuthModal';

export interface McpBridgeInfo {
  status?: string;
  billingChannel?: string;
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

const MCP_COMMANDS = [
  'PING_MCP',
  'SYNC_NEON_HYDROGEN',
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
      setRpcOutput({ error: 'Network error reaching MCP bridge' });
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
                Antigravity MCP Bridge & Neon Telemetry
              </h2>
              <p className="font-mono text-[11px] text-wire-green">
                {mcpInfo?.billingChannel ||
                  'Antigravity Pro Plan Account Credit (Non-API-Key Direct Runtime)'}
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
            <p className="text-[10px] text-muted">MCP BRIDGE</p>
            <p className="mt-1 font-bold text-fg">{mcpInfo?.status || 'CONNECTED'}</p>
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
          {MCP_COMMANDS.map((cmd) => (
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

