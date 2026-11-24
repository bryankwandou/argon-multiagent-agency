import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  Download,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
  UserPlus,
  Zap
} from 'lucide-react';
import { audioEngine } from '../lib/audioEngine';

function AuthParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const count = 1050;
    const data = new Float32Array(count * 6); // x, y, z, vx, vy, hueKind
    let mouseX = -999;
    let mouseY = -999;

    const reset = (w, h) => {
      for (let i = 0; i < count; i++) {
        const o = i * 6;
        data[o] = Math.random() * w;
        data[o + 1] = Math.random() * h;
        data[o + 2] = 0.25 + Math.random() * 0.85;
        data[o + 3] = (Math.random() - 0.5) * 0.42;
        data[o + 4] = (Math.random() - 0.5) * 0.42;
        data[o + 5] = i % 3;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      reset(window.innerWidth, window.innerHeight);
    };
    resize();

    const onMove = e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);

    let rafId = 0;
    const colors = ['#38bdf8', '#ff5c2a', '#a78bfa'];

    const loop = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillStyle = 'rgba(11, 13, 18, 0.26)';
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < count; i++) {
        const o = i * 6;
        let x = data[o];
        let y = data[o + 1];
        const z = data[o + 2];

        const dx = x - mouseX;
        const dy = y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 14000 && distSq > 1) {
          const force = (1 - Math.sqrt(distSq) / 118) * 1.4;
          x += (dx / Math.sqrt(distSq)) * force;
          y += (dy / Math.sqrt(distSq)) * force;
        }

        x += data[o + 3] * z;
        y += data[o + 4] * z;
        if (x < 0) x = w;
        if (x > w) x = 0;
        if (y < 0) y = h;
        if (y > h) y = 0;

        data[o] = x;
        data[o + 1] = y;

        ctx.fillStyle = colors[data[o + 5]];
        ctx.globalAlpha = 0.28 + z * 0.55;
        ctx.fillRect(x, y, 1.4 + z * 1.4, 1.4 + z * 1.4);
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 h-full w-full pointer-events-none" />;
}

export default function AuthGate({ onAuthenticated }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [googleNotice, setGoogleNotice] = useState(false);
  const [mcpLive, setMcpLive] = useState(null);

  useEffect(() => {
    fetch('/api/agent/mcp-bridge')
      .then(r => r.json())
      .then(d => setMcpLive(d))
      .catch(() => setMcpLive({ status: 'STANDBY' }));
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    audioEngine.play('tick');

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login' ? { username, password } : { username, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Autentikasi gagal.');
        audioEngine.play('blip');
        return;
      }

      if (tab === 'register') {
        audioEngine.play('chimeA');
        setSuccessMsg(data.message);
        setPassword('');
        return;
      }

      audioEngine.play('chimeB');
      onAuthenticated(data.token, data.user);
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server autentikasi Neon PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg px-4 py-10 text-fg">
      <AuthParticleCanvas />

      <div className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-12">
        {/* Left Identity & Capabilities Brief */}
        <div className="flex flex-col justify-between rounded-xl border border-line-strong bg-terminal-card/90 p-7 backdrop-blur-md lg:col-span-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                <Cpu className="size-3.5" aria-hidden="true" />
                GEMINI 4 ARGON HIGH
              </span>
              <span className="inline-flex items-center gap-1.5 rounded border border-wire-cyan/40 bg-wire-cyan/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-wire-cyan">
                <Zap className="size-3.5" aria-hidden="true" />
                NEON HYDROGEN xHIGH
              </span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
              Argon Multi-Agent Agency
            </h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">
              3D Spatial Command Floor · OpenAI Dots DAG · Grok Multi-Agent Council
            </p>

            <div className="mt-6 space-y-3 border-t border-line pt-5 text-sm text-muted">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-wire-green" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-fg">Akses Web 100% Gratis · Terverifikasi Neon PostgreSQL</p>
                  <p className="text-xs text-muted">
                    Seluruh pembuatan akun baru masuk antrean persetujuan langsung di database Neon dan hanya dapat di-ACC oleh Master Account (nayrbryanGaming).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 size-4 shrink-0 text-wire-cyan" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-fg">Antigravity MCP Pro Plan Bridge (Tanpa API Key)</p>
                  <p className="text-xs text-muted">
                    Orkestrasi real-time 10 agen lantai kerja, sub-agen Neon Hydrogen xHigh, dan papan 3D 1.280 partikel aktif secara langsung.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-line pt-5">
            <div className="flex items-center justify-between rounded-lg border border-line bg-terminal-bg px-3.5 py-2.5 font-mono text-[11px]">
              <span className="flex items-center gap-2 text-muted">
                <span className="size-2 rounded-full bg-wire-green animate-pulse" />
                MCP & NEON BRIDGE
              </span>
              <span className="font-semibold text-wire-green">
                {mcpLive?.status || 'CONNECTING...'}
              </span>
            </div>

            <a
              href="/api/download/setup"
              className="flex min-h-12 w-full items-center justify-between rounded-lg border border-line-strong bg-bg-elevated px-4 py-2.5 font-mono text-xs font-semibold text-fg transition-colors hover:border-wire-cyan hover:text-wire-cyan"
            >
              <span className="flex items-center gap-2">
                <Download className="size-4 text-wire-cyan" aria-hidden="true" />
                <span>Download Desktop Installer (.EXE v0.62.0)</span>
              </span>
              <span className="text-[10px] text-muted">111.54 MB · WIN64</span>
            </a>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="rounded-xl border border-line-strong bg-terminal-card/95 p-7 backdrop-blur-md lg:col-span-6">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-terminal-bg p-1">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`min-h-11 rounded-md font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === 'login' ? 'bg-fg text-bg' : 'text-muted hover:text-fg'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`min-h-11 rounded-md font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                tab === 'register' ? 'bg-fg text-bg' : 'text-muted hover:text-fg'
              }`}
            >
              Buat Akun Baru
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="argon-username" className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                Username
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
                <input
                  id="argon-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Masukkan username akun Anda"
                  className="min-h-11 w-full rounded-lg border border-line-strong bg-terminal-bg py-2.5 pr-3 pl-9 font-mono text-sm text-fg outline-none focus:border-wire-cyan"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label htmlFor="argon-email" className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Email (Opsional)
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
                  <input
                    id="argon-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    className="min-h-11 w-full rounded-lg border border-line-strong bg-terminal-bg py-2.5 pr-3 pl-9 font-mono text-sm text-fg outline-none focus:border-wire-cyan"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="argon-password" className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-muted">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden="true" />
                <input
                  id="argon-password"
                  type="password"
                  required
                  minLength={tab === 'register' ? 8 : 1}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="min-h-11 w-full rounded-lg border border-line-strong bg-terminal-bg py-2.5 pr-3 pl-9 font-mono text-sm text-fg outline-none focus:border-wire-cyan"
                />
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="rounded-lg border border-error/50 bg-error/10 px-3.5 py-2.5 font-mono text-xs text-wire-red">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div role="status" className="flex items-start gap-2 rounded-lg border border-wire-green/50 bg-wire-green/10 px-3.5 py-2.5 font-mono text-xs text-wire-green">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {tab === 'login' ? (
                <>
                  <KeyRound className="size-4" aria-hidden="true" />
                  <span>{loading ? 'Memverifikasi Neon DB...' : 'Masuk Command Floor'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-4" aria-hidden="true" />
                  <span>{loading ? 'Mengirim ke Neon DB...' : 'Ajukan Pembuatan Akun'}</span>
                </>
              )}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">ATAU</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={() => setGoogleNotice(true)}
            className="flex min-h-12 w-full items-center justify-between rounded-lg border border-line-strong bg-terminal-bg px-4 py-2.5 font-mono text-xs font-semibold text-fg transition-colors hover:border-wire-amber"
          >
            <span className="flex items-center gap-2.5">
              <span className="inline-flex size-5 items-center justify-center rounded-full border border-line-strong text-[11px] font-bold">
                G
              </span>
              <span>Login dengan Google</span>
            </span>
            <span className="rounded border border-wire-amber/50 bg-wire-amber/10 px-2 py-0.5 text-[10px] font-bold uppercase text-wire-amber">
              Coming Soon
            </span>
          </button>

          {googleNotice && (
            <p className="mt-2 rounded border border-wire-amber/30 bg-wire-amber/5 px-3 py-2 font-mono text-[11px] text-wire-amber">
              Google OAuth (Firebase Auto-Link) berstatus Coming Soon karena membutuhkan konfigurasi konsol OAuth manual. Gunakan autentikasi Neon PostgreSQL di atas secara gratis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

