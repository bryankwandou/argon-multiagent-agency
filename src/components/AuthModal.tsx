import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, X } from 'lucide-react';

export interface AuthUser {
  id: number;
  username: string;
  email?: string | null;
  role: string;
  status: string;
}

interface AuthModalProps {
  initialTab?: 'login' | 'register';
  locale: 'id' | 'en';
  onClose: () => void;
  onAuthenticated: (token: string, user: AuthUser) => void;
}

export function AuthModal({
  initialTab = 'login',
  locale,
  onClose,
  onAuthenticated,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [googleClicked, setGoogleClicked] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        tab === 'login'
          ? { username: username.trim(), password }
          : { username: username.trim(), email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.error || (locale === 'id' ? 'Autentikasi gagal.' : 'Authentication failed.')
        );
        return;
      }

      if (tab === 'register') {
        setSuccessMsg(data.message);
        setPassword('');
        return;
      }

      onAuthenticated(data.token, data.user);
    } catch {
      setErrorMsg(
        locale === 'id'
          ? 'Koneksi ke Neon PostgreSQL gagal. Coba beberapa saat lagi.'
          : 'Unable to reach Neon PostgreSQL authentication service.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="argon-auth-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-line-strong bg-terminal-card text-fg shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              NEON POSTGRESQL ACCESS · FREE TIER
            </p>
            <h2 id="argon-auth-title" className="mt-0.5 font-display text-lg font-bold text-fg">
              {tab === 'login'
                ? locale === 'id'
                  ? 'Masuk Akun Argon'
                  : 'Sign In to Argon'
                : locale === 'id'
                  ? 'Buat Akun Baru (Gratis)'
                  : 'Create Free Account'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-line text-muted hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-line font-mono text-xs uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`min-h-10 border-b-2 transition-colors ${
              tab === 'login'
                ? 'border-accent font-semibold text-fg'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            {locale === 'id' ? 'Masuk' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`min-h-10 border-b-2 transition-colors ${
              tab === 'register'
                ? 'border-accent font-semibold text-fg'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            {locale === 'id' ? 'Buat Akun' : 'Create Account'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 p-5">
          <div>
            <label
              htmlFor="argon-auth-user"
              className="block font-mono text-[10px] uppercase tracking-wider text-muted"
            >
              Username
            </label>
            <input
              id="argon-auth-user"
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={locale === 'id' ? 'Masukkan username' : 'Enter username'}
              className="mt-1 h-10 w-full rounded border border-line-strong bg-terminal-bg px-3 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
            />
          </div>

          {tab === 'register' && (
            <div>
              <label
                htmlFor="argon-auth-email"
                className="block font-mono text-[10px] uppercase tracking-wider text-muted"
              >
                {locale === 'id' ? 'Email (Opsional)' : 'Email (Optional)'}
              </label>
              <input
                id="argon-auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@domain.com"
                className="mt-1 h-10 w-full rounded border border-line-strong bg-terminal-bg px-3 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="argon-auth-pass"
              className="block font-mono text-[10px] uppercase tracking-wider text-muted"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="argon-auth-pass"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={tab === 'register' ? 8 : 1}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={locale === 'id' ? 'Masukkan password' : 'Enter password'}
                className="h-10 w-full rounded border border-line-strong bg-terminal-bg pr-10 pl-3 font-mono text-xs text-fg outline-none focus:border-wire-cyan"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center text-muted hover:text-fg"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <p className="font-mono text-[10.5px] leading-relaxed text-muted">
              {locale === 'id'
                ? 'Akun baru disimpan ke Neon PostgreSQL (PENDING_APPROVAL) dan hanya dapat di-ACC oleh Master Account (nayrbryanGaming).'
                : 'New accounts are stored in Neon PostgreSQL (PENDING_APPROVAL) and approved exclusively by Master Account (nayrbryanGaming).'}
            </p>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="rounded border border-wire-red/60 bg-wire-red/10 px-3 py-2 font-mono text-[11px] text-wire-red"
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="flex items-start gap-2 rounded border border-wire-green/60 bg-wire-green/10 px-3 py-2 font-mono text-[11px] text-wire-green"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded bg-accent px-4 font-mono text-xs font-bold uppercase tracking-wider text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? locale === 'id'
                ? 'Memverifikasi Neon DB...'
                : 'Verifying Neon DB...'
              : tab === 'login'
                ? locale === 'id'
                  ? 'Masuk Command Floor'
                  : 'Sign In'
                : locale === 'id'
                  ? 'Ajukan Akun Gratis'
                  : 'Submit Request'}
          </button>

          <div className="border-t border-line pt-3">
            <button
              type="button"
              onClick={() => setGoogleClicked(true)}
              className="flex h-10 w-full items-center justify-between rounded border border-line-strong bg-terminal-bg px-3 font-mono text-xs text-fg hover:border-wire-amber"
            >
              <span>{locale === 'id' ? 'Login dengan Google' : 'Continue with Google'}</span>
              <span className="rounded bg-wire-amber/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-wire-amber">
                Coming Soon
              </span>
            </button>
            {googleClicked && (
              <p className="mt-2 font-mono text-[10.5px] text-muted">
                {locale === 'id'
                  ? 'Google OAuth (Firebase) berstatus Coming Soon. Gunakan autentikasi Neon PostgreSQL gratis di atas.'
                  : 'Google OAuth (Firebase) is Coming Soon. Use free Neon PostgreSQL authentication above.'}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

