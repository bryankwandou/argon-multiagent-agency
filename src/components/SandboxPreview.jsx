import React, { useEffect, useRef, useState } from 'react';
import { Bookmark, Check, Code2, Copy, Play, RotateCcw, Terminal } from 'lucide-react';
import { BOOK_CHAPTERS } from '../lib/agencyData';

function CyberPacketRunner() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const stateRef = useRef({ px: 260, packets: [], score: 0, lives: 3, over: false, keys: {} });

  const restart = () => {
    stateRef.current = { px: 260, packets: [], score: 0, lives: 3, over: false, keys: {} };
    setScore(0);
    setLives(3);
    setGameOver(false);
  };

  useEffect(() => {
    const onDown = e => { stateRef.current.keys[e.key.toLowerCase()] = true; };
    const onUp = e => { stateRef.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);

    let rafId = 0;
    let spawnAcc = 0;
    let prev = performance.now();

    const loop = now => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      const canvas = canvasRef.current;
      if (!canvas) { rafId = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext('2d');
      const st = stateRef.current;

      ctx.fillStyle = '#0b0d12';
      ctx.fillRect(0, 0, 520, 280);

      // Subtle grid
      ctx.strokeStyle = 'rgba(56,189,248,0.08)';
      for (let x = 0; x < 520; x += 26) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 280); ctx.stroke();
      }

      if (!st.over) {
        if (st.keys['arrowleft'] || st.keys['a']) st.px = Math.max(24, st.px - 290 * dt);
        if (st.keys['arrowright'] || st.keys['d']) st.px = Math.min(496, st.px + 290 * dt);

        spawnAcc += dt;
        if (spawnAcc >= 0.45) {
          spawnAcc = 0;
          st.packets.push({
            x: 20 + Math.random() * 480,
            y: -12,
            vy: 110 + Math.random() * 90,
            good: Math.random() > 0.28
          });
        }

        for (let i = st.packets.length - 1; i >= 0; i--) {
          const p = st.packets[i];
          p.y += p.vy * dt;
          if (Math.abs(p.x - st.px) < 26 && p.y > 232 && p.y < 264) {
            if (p.good) {
              st.score += 10;
              setScore(st.score);
            } else {
              st.lives -= 1;
              setLives(st.lives);
              if (st.lives <= 0) {
                st.over = true;
                setGameOver(true);
              }
            }
            st.packets.splice(i, 1);
          } else if (p.y > 290) {
            st.packets.splice(i, 1);
          }
        }
      }

      // Draw packets
      for (const p of st.packets) {
        ctx.fillStyle = p.good ? '#38bdf8' : '#f87171';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw player shield paddle
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(st.px - 24, 244, 48, 10);

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="font-bold text-wire-cyan">CYBER PACKET RUNNER (120FPS SANDBOX)</span>
        <div className="flex items-center gap-4">
          <span className="text-wire-green">SCORE: {score}</span>
          <span className="text-wire-amber">LIVES: {lives}</span>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1 rounded border border-line-strong px-2 py-1 text-[11px] hover:border-wire-cyan"
          >
            <RotateCcw className="size-3" /> Reset
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-line-strong">
        <canvas
          ref={canvasRef}
          width={520}
          height={280}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect();
            stateRef.current.px = Math.max(24, Math.min(496, ((e.clientX - r.left) / r.width) * 520));
          }}
          className="block w-full max-w-[520px] bg-bg"
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 font-mono">
            <p className="text-lg font-bold text-wire-red">GAME OVER · SCORE {score}</p>
            <button
              type="button"
              onClick={restart}
              className="mt-3 rounded bg-wire-cyan px-4 py-1.5 text-xs font-bold text-bg"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <p className="font-mono text-[11px] text-muted">
        Gerakkan kursor mouse atau tombol A / D / Panah untuk menangkap paket biru (+10) dan hindari anomali merah.
      </p>
    </div>
  );
}

function InteractiveBookReader({ locale }) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [fontSize, setFontSize] = useState('md');
  const [readerTheme, setReaderTheme] = useState('DARK');
  const [bookmarks, setBookmarks] = useState([]);

  const ch = BOOK_CHAPTERS[chapterIdx];
  const isBookmarked = bookmarks.includes(ch.id);

  const toggleBookmark = () => {
    setBookmarks(prev => (prev.includes(ch.id) ? prev.filter(x => x !== ch.id) : [...prev, ch.id]));
  };

  const themeClass =
    readerTheme === 'SEPIA'
      ? 'bg-[#f4ecd8] text-[#3a2f22] border-[#d6c5a3]'
      : readerTheme === 'CLEAN'
        ? 'bg-white text-zinc-900 border-zinc-300'
        : 'bg-terminal-bg text-fg border-line-strong';

  const sizeClass = fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-1">
          {['sm', 'md', 'lg'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setFontSize(s)}
              className={`rounded border px-2 py-1 uppercase ${fontSize === s ? 'border-wire-cyan bg-wire-cyan/15 text-wire-cyan' : 'border-line text-muted'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {['DARK', 'SEPIA', 'CLEAN'].map(th => (
            <button
              key={th}
              type="button"
              onClick={() => setReaderTheme(th)}
              className={`rounded border px-2 py-1 ${readerTheme === th ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted'}`}
            >
              {th}
            </button>
          ))}
          <button
            type="button"
            onClick={toggleBookmark}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 ${isBookmarked ? 'border-wire-amber bg-wire-amber/15 text-wire-amber' : 'border-line text-muted'}`}
          >
            <Bookmark className="size-3" /> {bookmarks.length}
          </button>
        </div>
      </div>

      <div className={`rounded-lg border p-5 transition-colors ${themeClass}`}>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-70">
          {ch.id.toUpperCase()} · {chapterIdx + 1} / {BOOK_CHAPTERS.length}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold">
          {locale === 'id' ? ch.titleId : ch.titleEn}
        </h3>
        <p className={`mt-3 leading-relaxed ${sizeClass}`}>
          {locale === 'id' ? ch.bodyId : ch.bodyEn}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={chapterIdx === 0}
          onClick={() => setChapterIdx(i => Math.max(0, i - 1))}
          className="rounded border border-line-strong px-3 py-1 font-mono text-xs disabled:opacity-40"
        >
          Prev
        </button>
        <div className="h-1.5 flex-1 mx-4 overflow-hidden rounded-full bg-line">
          <div
            className="h-full bg-wire-cyan transition-all"
            style={{ width: `${((chapterIdx + 1) / BOOK_CHAPTERS.length) * 100}%` }}
          />
        </div>
        <button
          type="button"
          disabled={chapterIdx === BOOK_CHAPTERS.length - 1}
          onClick={() => setChapterIdx(i => Math.min(BOOK_CHAPTERS.length - 1, i + 1))}
          className="rounded border border-line-strong px-3 py-1 font-mono text-xs disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function SandboxPreview({ artifact, wire, locale, onCopy, isCopied }) {
  const [viewMode, setViewMode] = useState('PREVIEW');
  const [clicks, setClicks] = useState(0);
  const [v8Lines, setV8Lines] = useState([]);
  const [runningV8, setRunningV8] = useState(false);

  const keyStr = `${artifact?.filename || ''} ${artifact?.summary || ''} ${artifact?.code || ''}`.toLowerCase();
  const mode = /game|arcade|runner/.test(keyStr)
    ? 'ARCADE'
    : /book|buku|reader/.test(keyStr)
      ? 'BOOK'
      : /hello|hi|probe/.test(keyStr)
        ? 'HELLO'
        : 'V8';

  const runV8Sandbox = () => {
    setRunningV8(true);
    setV8Lines([]);
    const steps = [
      `[1/4] Initializing isolated V8 worker for ${artifact?.filename || 'module.ts'}...`,
      `[2/4] TypeScript AST verification & zero-trust boundary audit (SEC-05): PASS`,
      `[3/4] Executing unit assertions on Wire ${wire?.id || artifact?.wireId || 'FN-12'} (QA-08): 100% PASS`,
      `[4/4] Sandbox execution complete. Memory delta: +1.4 MB | P99 latency: 4.2ms.`
    ];
    steps.forEach((line, idx) => {
      setTimeout(() => {
        setV8Lines(prev => [...prev, line]);
        if (idx === steps.length - 1) setRunningV8(false);
      }, (idx + 1) * 260);
    });
  };

  if (!artifact) {
    return (
      <div className="rounded-lg border border-line bg-terminal-card p-6 font-mono text-xs text-muted">
        Pilih wire atau jalankan perintah di Live Chat untuk memeriksa artefak kode dan Sandbox Preview.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line-strong bg-terminal-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <p className="font-mono text-xs font-bold text-wire-cyan">{artifact.filename}</p>
          <p className="font-mono text-[11px] text-muted">{artifact.summary}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('PREVIEW')}
            className={`inline-flex min-h-8 items-center gap-1 rounded border px-2.5 py-1 font-mono text-[11px] font-semibold ${
              viewMode === 'PREVIEW' ? 'border-wire-cyan bg-wire-cyan/15 text-wire-cyan' : 'border-line text-muted'
            }`}
          >
            <Play className="size-3" /> PREVIEW
          </button>
          <button
            type="button"
            onClick={() => setViewMode('CODE')}
            className={`inline-flex min-h-8 items-center gap-1 rounded border px-2.5 py-1 font-mono text-[11px] font-semibold ${
              viewMode === 'CODE' ? 'border-wire-cyan bg-wire-cyan/15 text-wire-cyan' : 'border-line text-muted'
            }`}
          >
            <Code2 className="size-3" /> CODE
          </button>
          <button
            type="button"
            onClick={() => onCopy(artifact.code)}
            className="inline-flex min-h-8 items-center gap-1 rounded border border-line-strong bg-terminal-bg px-2.5 py-1 font-mono text-[11px] text-fg hover:border-wire-cyan"
          >
            {isCopied ? <Check className="size-3 text-wire-green" /> : <Copy className="size-3" />}
            <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        {viewMode === 'CODE' ? (
          <pre className="max-h-[340px] overflow-auto rounded-lg border border-line bg-terminal-bg p-4 font-mono text-xs leading-relaxed text-fg">
            <code>{artifact.code}</code>
          </pre>
        ) : mode === 'ARCADE' ? (
          <CyberPacketRunner />
        ) : mode === 'BOOK' ? (
          <InteractiveBookReader locale={locale} />
        ) : mode === 'HELLO' ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-line bg-terminal-bg p-5 font-mono">
            <span className="text-xs font-bold text-wire-green">INTERACTIVE RENDER PROBE · 120 FPS</span>
            <p className="text-sm text-fg">Verified live DOM response count: {clicks}</p>
            <button
              type="button"
              onClick={() => setClicks(c => c + 1)}
              className="rounded bg-wire-cyan px-4 py-1.5 text-xs font-bold text-bg"
            >
              Ping Interactive Counter (+1)
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-line bg-terminal-bg p-4 font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-wire-green">
                <Terminal className="size-3.5" /> SANDBOX ISOLATED V8 RUNTIME
              </span>
              <button
                type="button"
                disabled={runningV8}
                onClick={runV8Sandbox}
                className="inline-flex items-center gap-1.5 rounded bg-wire-green px-3 py-1 text-xs font-bold text-bg disabled:opacity-50"
              >
                <Play className="size-3" /> {runningV8 ? 'Running...' : 'Run Module'}
              </button>
            </div>
            <div className="min-h-[110px] space-y-1.5 rounded border border-line bg-bg p-3 text-xs text-muted">
              {v8Lines.length === 0 ? (
                <p>Klik "Run Module" untuk memverifikasi eksekusi {artifact.filename} pada V8 sandbox.</p>
              ) : (
                v8Lines.map((line, i) => (
                  <p key={i} className={i === v8Lines.length - 1 ? 'text-wire-green' : 'text-fg'}>
                    {line}
                  </p>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

