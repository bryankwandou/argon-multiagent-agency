import React, { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, ShieldAlert, ShieldCheck, X } from 'lucide-react';

interface NeonUserRecord {
  id: number;
  username: string;
  email: string | null;
  role: string;
  status: string;
  created_at: string;
  approved_by: string | null;
}

interface MasterAdminModalProps {
  token: string;
  onClose: () => void;
  onPendingChange?: (count: number) => void;
}

export function MasterAdminModal({
  token,
  onClose,
  onPendingChange,
}: MasterAdminModalProps) {
  const [users, setUsers] = useState<NeonUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memuat daftar akun dari Neon.');
        return;
      }
      setUsers(data.users || []);
      if (onPendingChange) onPendingChange(data.pendingCount || 0);
    } catch {
      setError('Gagal menghubungi server Neon PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, [token, onPendingChange]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAction = async (userId: number, action: 'APPROVE' | 'REJECT') => {
    setBusyId(userId);
    setError('');
    setFeedback('');
    try {
      const res = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memperbarui status akun.');
        return;
      }
      setFeedback(data.message);
      await loadUsers();
    } catch {
      setError('Gagal memperbarui status akun di Neon.');
    } finally {
      setBusyId(null);
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
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line-strong bg-terminal-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-wire-green" aria-hidden="true" />
            <div>
              <h2 className="font-display text-lg font-bold text-fg">
                Master Admin Approval Console (Neon PostgreSQL)
              </h2>
              <p className="font-mono text-[11px] text-muted">
                Otoritas Eksklusif Master Account: nayrbryanGaming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex min-h-9 items-center gap-1.5 rounded border border-line-strong bg-terminal-bg px-3 py-1 font-mono text-xs text-fg hover:border-wire-cyan"
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Segarkan</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-line-strong bg-terminal-bg text-muted hover:text-fg"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-wire-red/60 bg-wire-red/10 px-3.5 py-2.5 font-mono text-xs text-wire-red">
              <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {feedback && (
            <div className="mb-4 rounded-lg border border-wire-green/50 bg-wire-green/10 px-3.5 py-2.5 font-mono text-xs text-wire-green">
              {feedback}
            </div>
          )}

          {loading ? (
            <div className="py-10 text-center font-mono text-xs text-muted">
              Membaca tabel argon_users dari Neon PostgreSQL...
            </div>
          ) : (
            <div className="space-y-2.5">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-terminal-bg p-3.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-fg">{u.username}</span>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          u.role === 'MASTER_ADMIN'
                            ? 'bg-accent/20 text-accent'
                            : u.status === 'APPROVED'
                              ? 'bg-wire-green/15 text-wire-green'
                              : u.status === 'PENDING_APPROVAL'
                                ? 'bg-wire-amber/15 text-wire-amber'
                                : 'bg-wire-red/15 text-wire-red'
                        }`}
                      >
                        {u.role === 'MASTER_ADMIN' ? 'MASTER_ADMIN' : u.status}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted">
                      {u.email || 'Tanpa email'} · {new Date(u.created_at).toLocaleString('id-ID')}
                      {u.approved_by ? ` · Oleh: ${u.approved_by}` : ''}
                    </p>
                  </div>

                  {u.role !== 'MASTER_ADMIN' && (
                    <div className="flex items-center gap-2">
                      {u.status !== 'APPROVED' && (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleAction(u.id, 'APPROVE')}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded bg-wire-green px-3 py-1 font-mono text-xs font-bold text-bg hover:opacity-90 disabled:opacity-50"
                        >
                          <Check className="size-3.5" aria-hidden="true" />
                          <span>ACC / Setujui</span>
                        </button>
                      )}
                      {u.status !== 'REJECTED' && (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => handleAction(u.id, 'REJECT')}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded border border-wire-red/60 bg-wire-red/10 px-3 py-1 font-mono text-xs font-semibold text-wire-red hover:bg-wire-red/20 disabled:opacity-50"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          <span>Tolak</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

