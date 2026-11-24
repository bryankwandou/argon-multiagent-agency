import React, { useEffect, useState } from 'react';
import AuthGate from './components/AuthGate';
import CommandFloorApp from './components/CommandFloorApp';

const TOKEN_KEY = 'argon_session_token';
const USER_KEY = 'argon_session_user';

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [verifying, setVerifying] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }
    fetch('/api/agent/mcp-bridge', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data || !data.authenticatedOperator) {
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
          setToken('');
          setUser(null);
        }
      })
      .catch(() => {})
      .finally(() => setVerifying(false));
  }, [token]);

  const handleAuthenticated = (nextToken, nextUser) => {
    sessionStorage.setItem(TOKEN_KEY, nextToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg font-mono text-xs text-wire-cyan">
        Memverifikasi sesi Neon PostgreSQL & Antigravity MCP Bridge...
      </div>
    );
  }

  if (!token || !user) {
    return <AuthGate onAuthenticated={handleAuthenticated} />;
  }

  return <CommandFloorApp token={token} user={user} onLogout={handleLogout} />;
}

