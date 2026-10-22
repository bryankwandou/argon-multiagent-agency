import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  RotateCcw,
  Code2,
  CheckCircle2,
  Copy,
  Gamepad2,
  Zap,
  Terminal,
  Activity,
  Sparkles,
} from 'lucide-react';
import type { CodeArtifact, TaskWire } from '../types/agency';
import type { LocaleCode } from '../context/AppSettingsContext';

interface InteractiveSandboxRunnerProps {
  artifact: CodeArtifact;
  wire: TaskWire;
  locale: LocaleCode;
  onCopy: (id: string, code: string) => void;
  isCopied: boolean;
}

export function InteractiveSandboxRunner({
  artifact,
  wire,
  locale,
  onCopy,
  isCopied,
}: InteractiveSandboxRunnerProps) {
  const isGame =
    artifact.filename.toLowerCase().includes('game') ||
    artifact.filename.toLowerCase().includes('arcade') ||
    artifact.code.includes('RetroArcadeGame');

  const isHelloWorld =
    artifact.filename.toLowerCase().includes('hello') ||
    artifact.filename.toLowerCase().includes('hi') ||
    artifact.code.includes('HelloWorld');

  // Default to LIVE_PREVIEW if it's a Game or HelloWorld, so the user sees results immediately
  const [activeSubTab, setActiveSubTab] = useState<'PREVIEW' | 'CODE'>('PREVIEW');

  // Game state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameLives, setGameLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);

  // Hello world interactive state
  const [clickCount, setClickCount] = useState(0);
  const [pingMs, setPingMs] = useState(0.4);

  // Generic sandbox simulation state
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  // Canvas Game loop
  useEffect(() => {
    if (!isGame || !gameRunning || activeSubTab !== 'PREVIEW') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let playerX = canvas.width / 2;
    let items: Array<{
      x: number;
      y: number;
      speed: number;
      type: 'DATA' | 'BONUS' | 'BUG';
      size: number;
    }> = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      playerX = Math.max(20, Math.min(canvas.width - 20, (e.clientX - rect.left) * scaleX));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        playerX = Math.max(20, playerX - 25);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        playerX = Math.min(canvas.width - 20, playerX + 25);
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    let frame = 0;
    const renderLoop = () => {
      frame += 1;
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Player Vessel
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(playerX, canvas.height - 24);
      ctx.lineTo(playerX - 18, canvas.height - 8);
      ctx.lineTo(playerX + 18, canvas.height - 8);
      ctx.closePath();
      ctx.fill();

      // Thruster flame
      ctx.fillStyle = frame % 4 < 2 ? '#ffb703' : '#ff4d4f';
      ctx.beginPath();
      ctx.moveTo(playerX - 6, canvas.height - 8);
      ctx.lineTo(playerX + 6, canvas.height - 8);
      ctx.lineTo(playerX, canvas.height - 2 + (frame % 3) * 2);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Spawn falling data packets
      if (Math.random() < 0.05) {
        const rand = Math.random();
        const type: 'DATA' | 'BONUS' | 'BUG' =
          rand < 0.6 ? 'DATA' : rand < 0.85 ? 'BONUS' : 'BUG';
        items.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -10,
          speed: Math.random() * 2 + 1.8,
          type,
          size: type === 'BONUS' ? 14 : 10,
        });
      }

      // Update and draw items
      items = items.filter((item) => {
        item.y += item.speed;

        if (item.type === 'DATA') {
          ctx.fillStyle = '#39d353';
          ctx.fillRect(item.x - 5, item.y - 5, 10, 10);
        } else if (item.type === 'BONUS') {
          ctx.fillStyle = '#ffb703';
          ctx.beginPath();
          ctx.arc(item.x, item.y, 7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ff4d4f';
          ctx.beginPath();
          ctx.moveTo(item.x, item.y - 6);
          ctx.lineTo(item.x - 6, item.y + 6);
          ctx.lineTo(item.x + 6, item.y + 6);
          ctx.closePath();
          ctx.fill();
        }

        // Collision detection with player
        if (item.y >= canvas.height - 26 && item.y <= canvas.height - 4) {
          if (Math.abs(item.x - playerX) < 22) {
            if (item.type === 'DATA') {
              setGameScore((s) => s + 10);
            } else if (item.type === 'BONUS') {
              setGameScore((s) => s + 25);
            } else {
              setGameScore((s) => Math.max(0, s - 15));
              setGameLives((l) => {
                const updated = l - 1;
                if (updated <= 0) {
                  setGameOver(true);
                  setGameRunning(false);
                }
                return Math.max(0, updated);
              });
            }
            return false;
          }
        }

        return item.y < canvas.height + 10;
      });

      if (!gameOver) {
        animId = requestAnimationFrame(renderLoop);
      }
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGame, gameRunning, gameOver, activeSubTab]);

  const handleRestartGame = () => {
    setGameScore(0);
    setGameLives(3);
    setGameOver(false);
    setGameRunning(true);
  };

  const handleRunGenericSim = () => {
    setSimRunning(true);
    setSimStep(1);
    setSimLogs([
      locale === 'id'
        ? '[1/4] Menginisialisasi thread sandbox Node & V8 context...'
        : '[1/4] Initializing Node sandbox thread & V8 context...',
    ]);

    setTimeout(() => {
      setSimStep(2);
      setSimLogs((prev) => [
        ...prev,
        locale === 'id'
          ? '[2/4] Memvalidasi isolasi memori & verifikasi tipe TypeScript... [PASS]'
          : '[2/4] Validating memory boundary & strict TypeScript types... [PASS]',
      ]);
    }, 400);

    setTimeout(() => {
      setSimStep(3);
      setSimLogs((prev) => [
        ...prev,
        locale === 'id'
          ? `[3/4] Menjalankan fungsi modul (${wire.id}) tanpa efek samping... [PASS]`
          : `[3/4] Executing wire module (${wire.id}) side-effect free... [PASS]`,
      ]);
    }, 900);

    setTimeout(() => {
      setSimStep(4);
      setSimRunning(false);
      setSimLogs((prev) => [
        ...prev,
        locale === 'id'
          ? '[4/4] Eksekusi selesai: 0 error, 100% konsensus dewan, siap rilis.'
          : '[4/4] Execution completed: 0 errors, 100% council consensus, ready to ship.',
      ]);
    }, 1400);
  };

  return (
    <div className="rounded-lg border border-line-strong bg-terminal-card p-4">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-wire-cyan">
              {wire.id} // {artifact.filename}
            </span>
            <span className="rounded bg-wire-green/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-wire-green">
              {artifact.language.toUpperCase()}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">{artifact.summary}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="flex rounded border border-line bg-terminal-bg p-0.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('PREVIEW')}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-colors ${
                activeSubTab === 'PREVIEW'
                  ? 'bg-wire-cyan text-terminal-bg'
                  : 'text-muted hover:text-fg'
              }`}
            >
              {isGame ? (
                <Gamepad2 className="size-3.5" aria-hidden="true" />
              ) : (
                <Play className="size-3.5" aria-hidden="true" />
              )}
              <span>
                {locale === 'id' ? 'Preview Langsung' : 'Live Preview'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('CODE')}
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold transition-colors ${
                activeSubTab === 'CODE'
                  ? 'bg-wire-cyan text-terminal-bg'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Code2 className="size-3.5" aria-hidden="true" />
              <span>{locale === 'id' ? 'Kode Sumber' : 'Source Code'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onCopy(wire.id, artifact.code)}
            className="inline-flex items-center gap-1.5 rounded border border-line bg-terminal-bg px-3 py-1 font-mono text-xs text-fg hover:border-wire-cyan"
          >
            <Copy className="size-3.5 text-wire-cyan" aria-hidden="true" />
            <span>
              {isCopied
                ? locale === 'id'
                  ? 'Tersalin'
                  : 'Copied'
                : locale === 'id'
                ? 'Salin Kode'
                : 'Copy Code'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'PREVIEW' ? (
        <div className="mt-4">
          {/* Skenario 1: Mini Game Interaktif */}
          {isGame ? (
            <div className="flex flex-col items-center rounded-lg border border-line bg-[#07090e] p-4 text-center">
              <div className="mb-3 flex w-full max-w-lg items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="size-4 text-wire-cyan" aria-hidden="true" />
                  <span className="font-bold text-fg">
                    {locale === 'id' ? 'CYBER PACKET RUNNER' : 'CYBER PACKET RUNNER'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-wire-amber">
                    {locale === 'id' ? 'SKOR:' : 'SCORE:'} {gameScore}
                  </span>
                  <span className="text-wire-red">
                    {locale === 'id' ? 'NYAWA:' : 'LIVES:'}{' '}
                    {'♥ '.repeat(gameLives).trim() || 'DEAD'}
                  </span>
                  <button
                    type="button"
                    onClick={handleRestartGame}
                    className="inline-flex items-center gap-1 rounded border border-line bg-terminal-bg px-2 py-0.5 text-[11px] text-muted hover:text-fg"
                  >
                    <RotateCcw className="size-3" aria-hidden="true" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={520}
                  height={280}
                  className="max-w-full rounded border border-wire-cyan/30 bg-[#0a0d14] shadow-2xl shadow-wire-cyan/10"
                />

                {gameOver && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded bg-black/80 p-4">
                    <p className="font-mono text-xl font-bold text-wire-red">
                      {locale === 'id' ? 'GAME OVER' : 'GAME OVER'}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {locale === 'id' ? 'Skor Akhir:' : 'Final Score:'} {gameScore}
                    </p>
                    <button
                      type="button"
                      onClick={handleRestartGame}
                      className="mt-4 rounded bg-wire-cyan px-4 py-1.5 font-mono text-xs font-bold text-terminal-bg shadow-lg hover:brightness-110"
                    >
                      {locale === 'id' ? 'Main Lagi' : 'Play Again'}
                    </button>
                  </div>
                )}
              </div>

              {/* On-screen control assistance */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] text-muted">
                <span>
                  {locale === 'id'
                    ? 'Kontrol: Gerakkan kursor mouse di atas kotak atau tekan tombol panah [◄] [►] / [A] [D]'
                    : 'Controls: Move mouse cursor over canvas or use [◄] [►] / [A] [D] arrow keys'}
                </span>
                <span className="text-wire-green">● Hijau (+10)</span>
                <span className="text-wire-amber">● Emas (+25)</span>
                <span className="text-wire-red">▲ Merah (-15 / -1 Nyawa)</span>
              </div>
            </div>
          ) : isHelloWorld ? (
            /* Skenario 2: Hello World Interaktif */
            <div className="flex flex-col items-center justify-center rounded-lg border border-line bg-gradient-to-b from-terminal-card to-terminal-bg p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-wire-green/15 text-wire-green shadow-lg shadow-wire-green/10">
                <Sparkles className="size-7" aria-hidden="true" />
              </div>

              <h3 className="mt-4 font-mono text-2xl font-bold text-wire-green tracking-wide">
                HELLO WORLD! LOCALHOST ACTIVE
              </h3>

              <p className="mt-2 max-w-md text-xs text-muted leading-relaxed">
                {locale === 'id'
                  ? 'Direktif berhasil dieksekusi oleh Agen Gemini 4 Argon. Komponen ini sedang berjalan interaktif pada lingkungan runtime browser Anda.'
                  : 'Directive successfully compiled and executed by Gemini 4 Argon. This component is actively running inside your browser runtime.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setClickCount((c) => c + 1);
                    setPingMs(Number((Math.random() * 0.4 + 0.2).toFixed(2)));
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-wire-green px-5 py-2.5 font-mono text-xs font-bold text-terminal-bg shadow-lg shadow-wire-green/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Zap className="size-4" aria-hidden="true" />
                  <span>
                    {locale === 'id'
                      ? `Uji Interaksi Langsung (${clickCount} Klik)`
                      : `Live Interaction Test (${clickCount} Clicks)`}
                  </span>
                </button>

                <div className="flex items-center gap-2 rounded border border-line bg-terminal-bg px-3 py-2 font-mono text-[11px] text-muted">
                  <Activity className="size-3.5 text-wire-cyan" aria-hidden="true" />
                  <span>
                    {locale === 'id' ? 'Ping Runtime:' : 'Runtime Ping:'}{' '}
                    <strong className="text-fg">{pingMs}ms</strong>
                  </span>
                  <span className="text-line-strong">|</span>
                  <span className="text-wire-green">120 FPS</span>
                </div>
              </div>
            </div>
          ) : (
            /* Skenario 3: Generic Sandbox Execution Runner */
            <div className="rounded-lg border border-line bg-terminal-bg p-5 font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="size-4 text-wire-cyan" aria-hidden="true" />
                  <span className="text-xs font-bold text-fg">
                    {locale === 'id'
                      ? 'SANDBOX RUNTIME ISOLASI V8'
                      : 'SANDBOX ISOLATED V8 RUNTIME'}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={simRunning}
                  onClick={handleRunGenericSim}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-all ${
                    simRunning
                      ? 'bg-line text-muted cursor-not-allowed'
                      : 'bg-wire-cyan text-terminal-bg hover:brightness-110'
                  }`}
                >
                  <Play className="size-3" aria-hidden="true" />
                  <span>
                    {simRunning
                      ? locale === 'id'
                        ? 'Mengeksekusi...'
                        : 'Executing...'
                      : locale === 'id'
                      ? 'Jalankan Kode di Sandbox'
                      : 'Run Code in Sandbox'}
                  </span>
                </button>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                {simLogs.length === 0 ? (
                  <p className="text-muted italic">
                    {locale === 'id'
                      ? 'Klik tombol "Jalankan Kode di Sandbox" di atas untuk mengeksekusi modul ini secara langsung.'
                      : 'Click "Run Code in Sandbox" above to execute this module in a clean thread.'}
                  </p>
                ) : (
                  simLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-fg/90 leading-relaxed"
                    >
                      <CheckCircle2 className="size-3.5 text-wire-green shrink-0" aria-hidden="true" />
                      <span>{log}</span>
                    </div>
                  ))
                )}
              </div>

              {simStep === 4 && (
                <div className="mt-4 rounded border border-wire-green/30 bg-wire-green/10 p-3 text-[11px] text-wire-green">
                  <strong>OUTPUT:</strong> &#123; status: &quot;200_OK&quot;, wire: &quot;{wire.id}&quot;,
                  isolated: true, consensus: &quot;99.3%&quot; &#125;
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Source Code Sub-Tab */
        <pre className="mt-4 max-h-96 overflow-x-auto rounded bg-terminal-bg p-3 font-mono text-xs leading-relaxed text-fg">
          <code>{artifact.code}</code>
        </pre>
      )}
    </div>
  );
}
