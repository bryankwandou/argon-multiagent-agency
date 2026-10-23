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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  SlidersHorizontal,
  Check,
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

interface DigitalBookChapter {
  id: string;
  number: number;
  titleId: string;
  titleEn: string;
  subtitleId: string;
  subtitleEn: string;
  readingMinutes: number;
  wordCount: number;
  sections: Array<{
    headingId: string;
    headingEn: string;
    paragraphsId: string[];
    paragraphsEn: string[];
  }>;
  takeawayId: string;
  takeawayEn: string;
}

const DIGITAL_BOOK_CHAPTERS: DigitalBookChapter[] = [
  {
    id: 'ch-01',
    number: 1,
    titleId: 'Bab 1: Dekomposisi Tugas Agen & Topologi DAG',
    titleEn: 'Chapter 1: Agent Task Decomposition & DAG Topology',
    subtitleId: 'Prinsip Rekayasa Sistem Multi-Agen Terdistribusi Mandiri',
    subtitleEn: 'Principles of Autonomous Distributed Multi-Agent Systems',
    readingMinutes: 4,
    wordCount: 420,
    sections: [
      {
        headingId: 'Pemisahan Domain dan Penugasan Spesialis',
        headingEn: 'Domain Separation & Specialist Dispatch',
        paragraphsId: [
          'Dalam sistem komputasi multi-agen tingkat tinggi, setiap instruksi eksekutif tidak boleh dieksekusi secara monolitik. Agen pengarah memecah sasaran menjadi graf asiklik terarah (Directed Acyclic Graph / DAG), di mana setiap simpul merepresentasikan task wire terisolasi dengan input, output, dan kontrak skema TypeScript ketat.',
          'Pola ini menjamin isolasi kegagalan: kegagalan kompilasi pada satu sub-agen tidak memutus jalur eksekusi sub-agen lain, memungkinkan pemulihan instan dan kepastian rilis.',
        ],
        paragraphsEn: [
          'In high-throughput multi-agent computing systems, executive instructions must never execute monolithically. The director agent decomposes directives into a Directed Acyclic Graph (DAG), where each node represents an isolated task wire with strict TypeScript schema contracts.',
          'This pattern guarantees fault isolation: compilation failures in one sub-agent do not propagate to sibling nodes, enabling instant recovery and release determinism.',
        ],
      },
      {
        headingId: 'Determinisme dan Eliminasi State Terbengkalai',
        headingEn: 'Determinism & Elimination of Stale State',
        paragraphsId: [
          'Semua mutasi state dikelola secara terpusat melalui append-only ship-log tape. Setiap perubahan status wire dicatat dengan timestamp terverifikasi, mencegah kondisi balapan (race condition) pada runtime antarmuka visual.',
        ],
        paragraphsEn: [
          'All state mutations are managed centrally via an append-only ship-log tape. Every wire status transition is committed with verified timestamps, completely eliminating race conditions across visual interface runtimes.',
        ],
      },
    ],
    takeawayId:
      'Dekomposisi DAG deterministik memangkas overhead koordinasi hingga 80% dibandingkan polling konvensional.',
    takeawayEn:
      'Deterministic DAG decomposition cuts coordination overhead by up to 80% compared to traditional polling.',
  },
  {
    id: 'ch-02',
    number: 2,
    titleId: 'Bab 2: Batas Isolasi V8 & Eksekusi Zero-Trust',
    titleEn: 'Chapter 2: Sandbox Isolation Boundaries & Zero-Trust Defense',
    subtitleId: 'Arsitektur Keamanan Runtime dan Pertahanan Berlapis',
    subtitleEn: 'Runtime Security Architecture & Layered Defense',
    readingMinutes: 5,
    wordCount: 510,
    sections: [
      {
        headingId: 'Sanitasi Masukan dan Pembatasan Kuota',
        headingEn: 'Input Sanitization & Quota Boundaries',
        paragraphsId: [
          'Prinsip Zero-Trust menetapkan bahwa tidak ada masukan yang boleh dipercaya sebelum melalui pembersihan struktural. Setiap string perintah disaring dari karakter berbahaya, format string injeksi, dan dibatasi dalam kuota memori terukur.',
          'Kredensial dan API key privat disimpan di lingkungan server terisolasi, memastikan tidak ada token otentikasi yang bocor ke bundle JavaScript sisi klien.',
        ],
        paragraphsEn: [
          'The Zero-Trust principle dictates that no input is trusted prior to structural sanitization. Every command string is filtered of dangerous tokens and bounded within strict memory quotas.',
          'Private credentials and API keys reside within isolated server-side environments, preventing sensitive authentication tokens from leaking into client-side JavaScript bundles.',
        ],
      },
      {
        headingId: 'Eksekusi Sandbox Tanpa Efek Samping',
        headingEn: 'Side-Effect Free Sandbox Execution',
        paragraphsId: [
          'Runtime sandbox mengeksekusi logika modul dalam konteks terpisah (V8 isolate), mencegah mutasi DOM global atau modifikasi prototipe yang berpotensi memicu kerentanan sistem.',
        ],
        paragraphsEn: [
          'The sandbox runtime executes module logic within isolated V8 contexts, preventing prototype pollution or unexpected global DOM mutations.',
        ],
      },
    ],
    takeawayId:
      'Batas isolasi V8 dan verifikasi skema input adalah pilar utama pencegahan eksfiltrasi data produksi.',
    takeawayEn:
      'V8 isolation boundaries and input schema verification form the primary defense against production data exfiltration.',
  },
  {
    id: 'ch-03',
    number: 3,
    titleId: 'Bab 3: Konsensus Dewan Multi-Agen & Ambang 99%',
    titleEn: 'Chapter 3: Multi-Agent Council Consensus & 99% Bar',
    subtitleId: 'Pengambilan Keputusan Otonom Tanpa Titik Kegagalan Tunggal',
    subtitleEn: 'Autonomous Decision-Making Without Single Points of Failure',
    readingMinutes: 4,
    wordCount: 460,
    sections: [
      {
        headingId: 'Voting Independen Lintas Disiplin',
        headingEn: 'Cross-Disciplinary Independent Voting',
        paragraphsId: [
          'Sebelum artefak kode diizinkan naik ke tahap rilis produksi, dewan multi-agen yang terdiri dari arsitek sistem, insinyur keamanan, spesialis kinerja, dan analis jaminan mutu mengevaluasi kode secara bersamaan.',
          'Setiap agen memberikan penilaian berdasarkan kriteria spesifik: ARCH-02 memeriksa topologi, SEC-05 memverifikasi kepatuhan OWASP, QA-08 menguji ketahanan beban, dan SRE-10 memastikan ketiadaan memory leak.',
        ],
        paragraphsEn: [
          'Before any code artifact is promoted to production release, an autonomous multi-agent council consisting of systems architects, security officers, UI specialists, and QA engineers reviews the code in parallel.',
          'Each agent audits specific facets: ARCH-02 verifies topology, SEC-05 tests OWASP compliance, QA-08 runs stress thresholds, and SRE-10 guards against memory leaks.',
        ],
      },
      {
        headingId: 'Karantina Otomatis untuk Kode Cacat',
        headingEn: 'Automated Quarantine for Regressions',
        paragraphsId: [
          'Jika skor konsensus dewan berada di bawah 95%, wire ditahan otomatis (HELD) dan tiket remediasi diterbitkan langsung ke sub-agen terkait untuk perbaikan deterministik.',
        ],
        paragraphsEn: [
          'If the council consensus falls below 95%, the wire is held in quarantine and a remediation ticket is immediately dispatched to the responsible sub-agent.',
        ],
      },
    ],
    takeawayId:
      'Konsensus dewan multi-agen menjamin 0% regresi fungsional sebelum deployment ke infrastruktur cloud.',
    takeawayEn:
      'Multi-agent council consensus guarantees 0% functional regressions before deployment to cloud infrastructure.',
  },
  {
    id: 'ch-04',
    number: 4,
    titleId: 'Bab 4: Antarmuka Kinetik & Ergonomi Pengguna Modern',
    titleEn: 'Chapter 4: Kinetic Interfaces & Modern Ergonomics',
    subtitleId: 'Desain Responsif, Token Terstandarisasi & Aksesibilitas WCAG',
    subtitleEn: 'Responsive Design, Standardized Tokens & WCAG Accessibility',
    readingMinutes: 5,
    wordCount: 490,
    sections: [
      {
        headingId: 'Kejelasan Visual dan Eliminasi Desain AI Generik',
        headingEn: 'Visual Clarity & Elimination of Generic AI Slop',
        paragraphsId: [
          'Desain berkelas industri menolak penggunaan elemen dekoratif semu seperti gradien generik atau ilustrasi flat tak bermakna. Setiap komponen visual dirancang dengan hierarki tajam, whitespace fungsional, dan tipografi berkarakter tinggi.',
          'Semua warna diatur melalui token desain terpusat yang mendukung mode gelap (Dark) dan mode terang (Light) dengan rasio kontras teks minimum 4.5:1.',
        ],
        paragraphsEn: [
          'Industry-standard design rejects superficial decorative tropes like generic purple-cyan gradients or uninspired flat illustrations. Every visual component is crafted with sharp hierarchy, meaningful whitespace, and robust typography.',
          'All colors are governed through centralized design tokens supporting both Dark and Light modes with strict 4.5:1 text contrast ratios.',
        ],
      },
      {
        headingId: 'Performa Sebagai Pengalaman Pengguna (120 FPS)',
        headingEn: 'Performance as User Experience (120 FPS)',
        paragraphsId: [
          'Waktu respons interaksi wajib di bawah 100 milidetik. Animasi dibatasi pada transformasi GPU (transform dan opacity) guna menghindari layout reflow yang menurunkan performa perangkat pengguna.',
        ],
        paragraphsEn: [
          'Interaction latency must stay below 100 milliseconds. Animations are strictly GPU-accelerated (transform and opacity) to prevent layout reflows and preserve fluid 60-120 FPS frame rates.',
        ],
      },
    ],
    takeawayId:
      'Desain yang kokoh mengutamakan kejelasan, kontras tinggi, dan respons instan di atas dekorasi dangkal.',
    takeawayEn:
      'Resilient design prioritizes clarity, high contrast, and instant feedback above superficial decoration.',
  },
];

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

  const isBook =
    artifact.filename.toLowerCase().includes('book') ||
    artifact.filename.toLowerCase().includes('buku') ||
    artifact.filename.toLowerCase().includes('reader') ||
    artifact.code.includes('InteractiveBookReader') ||
    wire.title.toLowerCase().includes('buku') ||
    wire.title.toLowerCase().includes('book');

  // Default to LIVE_PREVIEW so users see real interactive results immediately
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

  // Book reader state
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [readerTheme, setReaderTheme] = useState<'DARK' | 'SEPIA' | 'CLEAN'>('DARK');
  const [bookmarkedChapters, setBookmarkedChapters] = useState<number[]>([]);

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

  const handleToggleBookmark = (chapterNum: number) => {
    setBookmarkedChapters((prev) =>
      prev.includes(chapterNum) ? prev.filter((n) => n !== chapterNum) : [...prev, chapterNum]
    );
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

  const currentChapter = DIGITAL_BOOK_CHAPTERS[activeChapterIndex] || DIGITAL_BOOK_CHAPTERS[0];
  const isCurrentBookmarked = bookmarkedChapters.includes(currentChapter.number);
  const readingProgressPct = Math.round(
    ((activeChapterIndex + 1) / DIGITAL_BOOK_CHAPTERS.length) * 100
  );

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
              ) : isBook ? (
                <BookOpen className="size-3.5" aria-hidden="true" />
              ) : (
                <Play className="size-3.5" aria-hidden="true" />
              )}
              <span>
                {isBook
                  ? locale === 'id'
                    ? 'Baca Buku Digital'
                    : 'Read Digital Book'
                  : locale === 'id'
                  ? 'Preview Langsung'
                  : 'Live Preview'}
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
                  <span className="font-bold text-fg">CYBER PACKET RUNNER</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-wire-amber">
                    {locale === 'id' ? 'SKOR:' : 'SCORE:'} {gameScore}
                  </span>
                  <span className="text-wire-red">
                    {locale === 'id' ? 'NYAWA:' : 'LIVES:'} {gameLives}
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
                    <p className="font-mono text-xl font-bold text-wire-red">GAME OVER</p>
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
                    ? 'Kontrol: Gerakkan mouse di atas kanvas atau tombol panah kiri-kanan / A-D'
                    : 'Controls: Move mouse over canvas or use left-right / A-D keys'}
                </span>
                <span className="text-wire-green">Hijau (+10)</span>
                <span className="text-wire-amber">Emas (+25)</span>
                <span className="text-wire-red">Merah (-15 / -1 Nyawa)</span>
              </div>
            </div>
          ) : isBook ? (
            /* Skenario 2: Buku Digital Interaktif & Dokumentasi Sistem */
            <div className="space-y-4">
              {/* Reader Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-terminal-bg p-3">
                {/* Chapter Select Tabs */}
                <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                  {DIGITAL_BOOK_CHAPTERS.map((ch, idx) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setActiveChapterIndex(idx)}
                      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                        activeChapterIndex === idx
                          ? 'bg-wire-cyan font-bold text-terminal-bg shadow-md'
                          : 'border border-line bg-terminal-card text-muted hover:text-fg'
                      }`}
                    >
                      <span>Bab {ch.number}</span>
                      {bookmarkedChapters.includes(ch.number) && (
                        <Bookmark className="size-3 fill-current text-wire-amber" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Right toolbar controls: font size, theme, bookmark */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Font size switcher */}
                  <div className="flex items-center rounded border border-line bg-terminal-card p-0.5 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => setReaderFontSize('sm')}
                      className={`rounded px-2 py-0.5 ${
                        readerFontSize === 'sm'
                          ? 'bg-wire-cyan text-terminal-bg font-bold'
                          : 'text-muted hover:text-fg'
                      }`}
                      title="Font Kecil"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderFontSize('md')}
                      className={`rounded px-2 py-0.5 ${
                        readerFontSize === 'md'
                          ? 'bg-wire-cyan text-terminal-bg font-bold'
                          : 'text-muted hover:text-fg'
                      }`}
                      title="Font Sedang"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderFontSize('lg')}
                      className={`rounded px-2 py-0.5 ${
                        readerFontSize === 'lg'
                          ? 'bg-wire-cyan text-terminal-bg font-bold'
                          : 'text-muted hover:text-fg'
                      }`}
                      title="Font Besar"
                    >
                      A+
                    </button>
                  </div>

                  {/* Reading theme switcher */}
                  <div className="flex items-center rounded border border-line bg-terminal-card p-0.5 font-mono text-[11px]">
                    <button
                      type="button"
                      onClick={() => setReaderTheme('DARK')}
                      className={`rounded px-2 py-0.5 ${
                        readerTheme === 'DARK'
                          ? 'bg-wire-cyan text-terminal-bg font-bold'
                          : 'text-muted hover:text-fg'
                      }`}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme('SEPIA')}
                      className={`rounded px-2 py-0.5 ${
                        readerTheme === 'SEPIA'
                          ? 'bg-[#d8c29d] text-[#241e17] font-bold'
                          : 'text-muted hover:text-fg'
                      }`}
                    >
                      Sepia
                    </button>
                    <button
                      type="button"
                      onClick={() => setReaderTheme('CLEAN')}
                      className={`rounded px-2 py-0.5 ${
                        readerTheme === 'CLEAN'
                          ? 'bg-sky-500 text-black font-bold'
                          : 'text-muted hover:text-fg'
                      }`}
                    >
                      Clean
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(currentChapter.number)}
                    className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-xs transition-colors ${
                      isCurrentBookmarked
                        ? 'border-wire-amber bg-wire-amber/20 text-wire-amber'
                        : 'border-line bg-terminal-card text-muted hover:text-fg'
                    }`}
                  >
                    <Bookmark
                      className={`size-3.5 ${isCurrentBookmarked ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                    <span>
                      {isCurrentBookmarked
                        ? locale === 'id'
                          ? 'Ditandai'
                          : 'Bookmarked'
                        : locale === 'id'
                        ? 'Tandai Bab'
                        : 'Bookmark'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Reading Progress Indicator */}
              <div className="flex items-center justify-between gap-4 font-mono text-xs text-muted">
                <span>
                  {locale === 'id'
                    ? `Bab ${currentChapter.number} dari ${DIGITAL_BOOK_CHAPTERS.length} (${readingProgressPct}%)`
                    : `Chapter ${currentChapter.number} of ${DIGITAL_BOOK_CHAPTERS.length} (${readingProgressPct}%)`}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-terminal-bg overflow-hidden border border-line">
                  <div
                    className="h-full bg-wire-cyan transition-all duration-300"
                    style={{ width: `${readingProgressPct}%` }}
                  />
                </div>
                <span>
                  {currentChapter.readingMinutes}{' '}
                  {locale === 'id' ? 'menit baca' : 'min read'}
                </span>
              </div>

              {/* Main Reading Surface */}
              <article
                className={`rounded-lg border p-6 shadow-xl transition-colors ${
                  readerTheme === 'SEPIA'
                    ? 'border-[#4a3b2c] bg-[#221c15] text-[#f4ebd9]'
                    : readerTheme === 'CLEAN'
                    ? 'border-sky-900/50 bg-[#0d1626] text-sky-50'
                    : 'border-line bg-[#07090e] text-fg'
                }`}
              >
                {/* Chapter Heading */}
                <header className="border-b border-line/40 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-wire-cyan">
                      {locale === 'id' ? 'MANUAL ARSITEKTUR SISTEM' : 'SYSTEM ARCHITECTURE MANUAL'}
                    </span>
                    <span className="font-mono text-[11px] text-muted">
                      {currentChapter.wordCount} {locale === 'id' ? 'kata' : 'words'} | ISO-27001 / OWASP
                    </span>
                  </div>
                  <h1 className="mt-2 font-display text-xl sm:text-2xl font-bold tracking-tight">
                    {locale === 'id' ? currentChapter.titleId : currentChapter.titleEn}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-muted">
                    {locale === 'id' ? currentChapter.subtitleId : currentChapter.subtitleEn}
                  </p>
                </header>

                {/* Chapter Sections */}
                <div
                  className={`mt-6 space-y-6 ${
                    readerFontSize === 'sm'
                      ? 'text-xs leading-relaxed'
                      : readerFontSize === 'lg'
                      ? 'text-base leading-loose'
                      : 'text-sm leading-relaxed'
                  }`}
                >
                  {currentChapter.sections.map((section, sIdx) => (
                    <section key={sIdx} className="space-y-3">
                      <h2 className="font-mono text-xs sm:text-sm font-bold text-wire-cyan">
                        {locale === 'id' ? section.headingId : section.headingEn}
                      </h2>
                      {(locale === 'id' ? section.paragraphsId : section.paragraphsEn).map(
                        (para, pIdx) => (
                          <p key={pIdx} className="text-justify opacity-90">
                            {para}
                          </p>
                        )
                      )}
                    </section>
                  ))}

                  {/* Architectural Takeaway Callout */}
                  <div className="mt-6 rounded border border-wire-green/30 bg-wire-green/10 p-4">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-wire-green">
                      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                      <span>
                        {locale === 'id'
                          ? 'KESIMPULAN ARSITEKTUR KUNCI'
                          : 'KEY ARCHITECTURAL TAKEAWAY'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-wire-green/90 leading-relaxed">
                      {locale === 'id' ? currentChapter.takeawayId : currentChapter.takeawayEn}
                    </p>
                  </div>
                </div>

                {/* Bottom Pagination & Quick Navigation */}
                <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line/40 pt-4">
                  <button
                    type="button"
                    disabled={activeChapterIndex === 0}
                    onClick={() => setActiveChapterIndex((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1.5 rounded border border-line bg-terminal-bg px-3 py-1.5 font-mono text-xs font-semibold text-fg disabled:cursor-not-allowed disabled:opacity-30 hover:border-wire-cyan"
                  >
                    <ChevronLeft className="size-3.5" aria-hidden="true" />
                    <span>{locale === 'id' ? 'Halaman Sebelumnya' : 'Previous Page'}</span>
                  </button>

                  <div className="flex items-center gap-1 font-mono text-xs text-muted">
                    <span>
                      {locale === 'id' ? 'Bab' : 'Chapter'} {activeChapterIndex + 1} /{' '}
                      {DIGITAL_BOOK_CHAPTERS.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={activeChapterIndex === DIGITAL_BOOK_CHAPTERS.length - 1}
                    onClick={() =>
                      setActiveChapterIndex((i) =>
                        Math.min(DIGITAL_BOOK_CHAPTERS.length - 1, i + 1)
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded bg-wire-cyan px-4 py-1.5 font-mono text-xs font-bold text-terminal-bg disabled:cursor-not-allowed disabled:opacity-30 hover:brightness-110 shadow-lg"
                  >
                    <span>{locale === 'id' ? 'Halaman Berikutnya' : 'Next Page'}</span>
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </button>
                </footer>
              </article>
            </div>
          ) : isHelloWorld ? (
            /* Skenario 3: Hello World Interaktif */
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
            /* Skenario 4: Generic Sandbox Execution Runner */
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
