import React, { useEffect, useRef, useState } from 'react';
import { Eye, GitBranch, Maximize2, Minus, Plus, RotateCcw, Users } from 'lucide-react';
import { WAYPOINTS } from '../lib/agencyData';

const GRID_W = 11;
const GRID_H = 10;
const TILE_W = 64;
const TILE_H = 32;
const PARTICLE_COUNT = 1280;
const STRIDE = 10; // x, y, z, vx, vy, vz, life, maxLife, kind, seed

const PALETTES = {
  dark: {
    canvasBg: '#0b0e14',
    slabTop: '#161b26',
    slabLeft: '#0e121b',
    slabRight: '#121722',
    slabRim: '#38bdf8',
    floorExecA: '#241e1a',
    floorExecB: '#2a231e',
    floorTileA: '#1b202b',
    floorTileB: '#212734',
    floorWoodA: '#211c17',
    floorWoodB: '#27211b',
    floorCarpetA: '#171c26',
    floorCarpetB: '#1c222f',
    wallTop: '#2a3346',
    wallLeft: '#181e2b',
    wallRight: '#1f2636',
    glassFill: 'rgba(56, 189, 248, 0.08)',
    glassEdge: 'rgba(125, 211, 252, 0.35)',
    deskTop: '#2e3545',
    deskLeft: '#1e2430',
    deskRight: '#252c3b',
    rackBody: '#121620',
    rackSide: '#1b2130',
    wireCyan: '#38bdf8',
    wireGreen: '#4ade80',
    wireAmber: '#fbbf24',
    wireRed: '#f87171',
    wirePurple: '#a78bfa',
    rugExec: '#3b2421',
    rugRec: '#1e2c3a',
    rugConf: '#281f3d',
    couch: '#334155',
    plantPot: '#7c4a32',
    plantLeafA: '#15803d',
    plantLeafB: '#22c55e',
    gridLine: 'rgba(148, 163, 184, 0.08)',
    zoneBorder: 'rgba(148, 163, 184, 0.22)'
  },
  light: {
    canvasBg: '#dcd6cb',
    slabTop: '#c9c1b2',
    slabLeft: '#aba292',
    slabRight: '#b8afa0',
    slabRim: '#0284c7',
    floorExecA: '#cbb79f',
    floorExecB: '#c3ae95',
    floorTileA: '#e2dcd0',
    floorTileB: '#d8d1c4',
    floorWoodA: '#d6c4ae',
    floorWoodB: '#cebb9f',
    floorCarpetA: '#cfd3da',
    floorCarpetB: '#c5cad3',
    wallTop: '#f3efe6',
    wallLeft: '#cfc7b8',
    wallRight: '#ded6c8',
    glassFill: 'rgba(2, 132, 199, 0.12)',
    glassEdge: 'rgba(2, 132, 199, 0.4)',
    deskTop: '#ebe4d6',
    deskLeft: '#c7beae',
    deskRight: '#d8cfbf',
    rackBody: '#272f3d',
    rackSide: '#333d4f',
    wireCyan: '#0284c7',
    wireGreen: '#16a34a',
    wireAmber: '#d97706',
    wireRed: '#dc2626',
    wirePurple: '#7c3aed',
    rugExec: '#a86454',
    rugRec: '#7592ad',
    rugConf: '#8c76b8',
    couch: '#64748b',
    plantPot: '#9a5b3b',
    plantLeafA: '#15803d',
    plantLeafB: '#16a34a',
    gridLine: 'rgba(20, 20, 23, 0.08)',
    zoneBorder: 'rgba(20, 20, 23, 0.22)'
  }
};

const AVATAR_COLORS = {
  skinToneA: '#f2c9ac',
  skinToneB: '#d69d72',
  skinToneC: '#8d5b3e',
  hairDark: '#1c1917',
  hairBrown: '#573620',
  hairBlonde: '#eab308',
  hairAuburn: '#9a3412',
  hairSilver: '#cbd5e1',
  suitNavy: '#1e3a8a',
  suitOlive: '#3f6212',
  suitSlate: '#475569',
  suitCharcoal: '#27272a',
  suitBurgundy: '#881337',
  suitTeal: '#115e59',
  suitIndigo: '#3730a3',
  suitRust: '#9a3412'
};

function createGlowSprite(colorHex) {
  const c = document.createElement('canvas');
  c.width = 24;
  c.height = 24;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(12, 12, 0.5, 12, 12, 12);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.28, colorHex);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 24, 24);
  return c;
}

function projectIso(gx, gy, gz, ox, oy, scale, tiltX = 0, tiltY = 0) {
  const cx = gx - GRID_W * 0.5;
  const cy = gy - GRID_H * 0.5;
  const x = ox + (cx - cy) * (TILE_W * 0.5) * scale + tiltX * gz * 0.12;
  const y = oy + (cx + cy) * (TILE_H * 0.5) * scale - gz * scale + tiltY * (cx + cy) * 0.4;
  return { x, y };
}

function drawIsoBox(ctx, gx, gy, gw, gh, zBase, zHeight, ox, oy, scale, colors, tiltX = 0, tiltY = 0) {
  const p0 = projectIso(gx, gy, zBase, ox, oy, scale, tiltX, tiltY);
  const p1 = projectIso(gx + gw, gy, zBase, ox, oy, scale, tiltX, tiltY);
  const p2 = projectIso(gx + gw, gy + gh, zBase, ox, oy, scale, tiltX, tiltY);
  const p3 = projectIso(gx, gy + gh, zBase, ox, oy, scale, tiltX, tiltY);

  const t0 = projectIso(gx, gy, zBase + zHeight, ox, oy, scale, tiltX, tiltY);
  const t1 = projectIso(gx + gw, gy, zBase + zHeight, ox, oy, scale, tiltX, tiltY);
  const t2 = projectIso(gx + gw, gy + gh, zBase + zHeight, ox, oy, scale, tiltX, tiltY);
  const t3 = projectIso(gx, gy + gh, zBase + zHeight, ox, oy, scale, tiltX, tiltY);

  // Left visible face (p3 -> p2 -> t2 -> t3)
  ctx.beginPath();
  ctx.moveTo(p3.x, p3.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.closePath();
  ctx.fillStyle = colors.left;
  ctx.fill();

  // Right visible face (p1 -> p2 -> t2 -> t1)
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t1.x, t1.y);
  ctx.closePath();
  ctx.fillStyle = colors.right;
  ctx.fill();

  // Top face
  ctx.beginPath();
  ctx.moveTo(t0.x, t0.y);
  ctx.lineTo(t1.x, t1.y);
  ctx.lineTo(t2.x, t2.y);
  ctx.lineTo(t3.x, t3.y);
  ctx.closePath();
  ctx.fillStyle = colors.top;
  ctx.fill();

  if (colors.stroke) {
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = Math.max(0.7, 0.9 * scale);
    ctx.stroke();
  }
}

function drawIsoQuad(ctx, gx, gy, gw, gh, gz, ox, oy, scale, fill, stroke, tiltX = 0, tiltY = 0) {
  const a = projectIso(gx, gy, gz, ox, oy, scale, tiltX, tiltY);
  const b = projectIso(gx + gw, gy, gz, ox, oy, scale, tiltX, tiltY);
  const c = projectIso(gx + gw, gy + gh, gz, ox, oy, scale, tiltX, tiltY);
  const d = projectIso(gx, gy + gh, gz, ox, oy, scale, tiltX, tiltY);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.85;
    ctx.stroke();
  }
}

function drawPlant(ctx, gx, gy, ox, oy, scale, pal, tiltX, tiltY) {
  drawIsoBox(ctx, gx - 0.16, gy - 0.16, 0.32, 0.32, 0, 7, ox, oy, scale, {
    top: pal.plantPot,
    left: '#5b3421',
    right: '#6d3f28'
  }, tiltX, tiltY);
  const c1 = projectIso(gx, gy, 11, ox, oy, scale, tiltX, tiltY);
  const c2 = projectIso(gx - 0.08, gy + 0.06, 15, ox, oy, scale, tiltX, tiltY);
  const c3 = projectIso(gx + 0.07, gy - 0.05, 17, ox, oy, scale, tiltX, tiltY);
  ctx.fillStyle = pal.plantLeafA;
  ctx.beginPath();
  ctx.arc(c1.x, c1.y, 7.5 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.plantLeafB;
  ctx.beginPath();
  ctx.arc(c2.x, c2.y, 5.5 * scale, 0, Math.PI * 2);
  ctx.arc(c3.x, c3.y, 4.8 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function initParticle(arr, idx, burstOrigin = null) {
  const o = idx * STRIDE;
  if (burstOrigin) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.4 + Math.random() * 2.6;
    arr[o] = burstOrigin.x;
    arr[o + 1] = burstOrigin.y;
    arr[o + 2] = 16 + Math.random() * 10;
    arr[o + 3] = Math.cos(angle) * speed;
    arr[o + 4] = Math.sin(angle) * speed;
    arr[o + 5] = 14 + Math.random() * 24;
    arr[o + 6] = 0;
    arr[o + 7] = 0.7 + Math.random() * 0.9;
    arr[o + 8] = 2;
    arr[o + 9] = Math.random() * 100;
    return;
  }

  let kind = 0;
  if (idx >= 600 && idx < 880) kind = 1;
  else if (idx >= 880 && idx < 1120) kind = 2;
  else if (idx >= 1120) kind = 3;

  arr[o + 8] = kind;
  arr[o + 9] = Math.random() * 6.283;
  arr[o + 6] = Math.random() * 3.5;

  if (kind === 0) {
    // Atmospheric volumetric light-cone motes
    arr[o] = Math.random() * GRID_W;
    arr[o + 1] = Math.random() * GRID_H;
    arr[o + 2] = 4 + Math.random() * 54;
    arr[o + 3] = (Math.random() - 0.5) * 0.14;
    arr[o + 4] = (Math.random() - 0.5) * 0.14;
    arr[o + 5] = 1.5 + Math.random() * 3.5;
    arr[o + 7] = 3.5 + Math.random() * 4.5;
  } else if (kind === 1) {
    // Server rack thermal/data exhaust sparks in SECURITY_SRE
    const rackX = [8.6, 9.35, 10.1][idx % 3];
    arr[o] = rackX + (Math.random() - 0.5) * 0.45;
    arr[o + 1] = 0.72 + (Math.random() - 0.5) * 0.45;
    arr[o + 2] = 28 + Math.random() * 8;
    arr[o + 3] = (Math.random() - 0.5) * 0.18;
    arr[o + 4] = (Math.random() - 0.5) * 0.18;
    arr[o + 5] = 9 + Math.random() * 14;
    arr[o + 7] = 1.6 + Math.random() * 2.2;
  } else if (kind === 2) {
    // DAG conduit sparks
    arr[o] = 1.9 + Math.random() * 7.2;
    arr[o + 1] = 2.1 + Math.random() * 5.2;
    arr[o + 2] = 18 + Math.random() * 24;
    arr[o + 3] = (Math.random() - 0.5) * 0.35;
    arr[o + 4] = (Math.random() - 0.5) * 0.35;
    arr[o + 5] = 4 + Math.random() * 10;
    arr[o + 7] = 1.4 + Math.random() * 1.9;
  } else {
    // Conference room orbital violet/gold vortex ring
    const ang = Math.random() * Math.PI * 2;
    const rad = 0.5 + Math.random() * 1.35;
    arr[o] = 8.9 + Math.cos(ang) * rad;
    arr[o + 1] = 8.2 + Math.sin(ang) * rad;
    arr[o + 2] = 14 + Math.random() * 22;
    arr[o + 3] = ang;
    arr[o + 4] = rad;
    arr[o + 5] = 3 + Math.random() * 6;
    arr[o + 7] = 2.5 + Math.random() * 2.8;
  }
}

export default function FloorCanvas3D({
  agents,
  wires,
  selectedAgentId,
  onSelectAgent,
  showDagLinks,
  onToggleDagLinks,
  onSummonCouncil,
  councilActive,
  theme,
  locale,
  t,
  burstSignal
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pillRefs = useRef({});
  const agentsRef = useRef(agents);
  const wiresRef = useRef(wires);
  const showDagRef = useRef(showDagLinks);
  const councilRef = useRef(councilActive);
  const selectedRef = useRef(selectedAgentId);
  const hoveredRef = useRef(null);
  const themeRef = useRef(theme);
  const particlesRef = useRef(null);
  const spritesRef = useRef(null);

  const [hoveredAgentId, setHoveredAgentId] = useState(null);
  const [fpsDisplay, setFpsDisplay] = useState(60);

  const camRef = useRef({
    scale: 1,
    targetScale: 1,
    panX: 0,
    panY: -15,
    targetPanX: 0,
    targetPanY: -15,
    tiltX: 0,
    tiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0
  });

  // Keep mutable simulation coordinates smooth without triggering React re-renders
  const simPosRef = useRef({});

  useEffect(() => {
    agentsRef.current = agents;
    agents.forEach(a => {
      if (!simPosRef.current[a.id]) {
        simPosRef.current[a.id] = { x: a.currentCoord.x, y: a.currentCoord.y, bob: Math.random() * 6 };
      }
    });
  }, [agents]);

  useEffect(() => { wiresRef.current = wires; }, [wires]);
  useEffect(() => { showDagRef.current = showDagLinks; }, [showDagLinks]);
  useEffect(() => { councilRef.current = councilActive; }, [councilActive]);
  useEffect(() => { selectedRef.current = selectedAgentId; }, [selectedAgentId]);
  useEffect(() => { hoveredRef.current = hoveredAgentId; }, [hoveredAgentId]);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  // Burst radial particles on mission dispatch / promote / unblock
  useEffect(() => {
    if (!burstSignal || !particlesRef.current) return;
    const arr = particlesRef.current;
    for (let i = 960; i < 1060; i++) {
      initParticle(arr, i, { x: 5.5, y: 5.0 });
    }
  }, [burstSignal]);

  useEffect(() => {
    const pal = PALETTES[theme] || PALETTES.dark;
    spritesRef.current = {
      cyan: createGlowSprite(pal.wireCyan),
      amber: createGlowSprite(pal.wireAmber),
      green: createGlowSprite(pal.wireGreen),
      purple: createGlowSprite(pal.wirePurple)
    };
  }, [theme]);

  useEffect(() => {
    const arr = new Float32Array(PARTICLE_COUNT * STRIDE);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      initParticle(arr, i);
    }
    particlesRef.current = arr;

    let rafId = 0;
    let prevTime = performance.now();
    let frameAcc = 0;
    let frameCount = 0;

    // Offscreen static architectural layer cache
    let staticCanvas = null;
    let staticKey = '';

    function buildStaticLayer(width, height, dpr, ox, oy, scale, tiltX, tiltY, pal) {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.floor(width * dpr));
      c.height = Math.max(1, Math.floor(height * dpr));
      const ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);

      // Deep 3D architectural foundation slab
      drawIsoBox(ctx, 0, 0, GRID_W, GRID_H, -15, 15, ox, oy, scale, {
        top: pal.slabTop,
        left: pal.slabLeft,
        right: pal.slabRight
      }, tiltX, tiltY);

      // Perimeter neon trim channel along lower front edges
      const fl0 = projectIso(0, GRID_H, -3, ox, oy, scale, tiltX, tiltY);
      const fl1 = projectIso(GRID_W, GRID_H, -3, ox, oy, scale, tiltX, tiltY);
      const fl2 = projectIso(GRID_W, 0, -3, ox, oy, scale, tiltX, tiltY);
      ctx.beginPath();
      ctx.moveTo(fl0.x, fl0.y);
      ctx.lineTo(fl1.x, fl1.y);
      ctx.lineTo(fl2.x, fl2.y);
      ctx.strokeStyle = pal.slabRim;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.6 * scale;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Zone floor tiles
      for (let gx = 0; gx < GRID_W; gx++) {
        for (let gy = 0; gy < GRID_H; gy++) {
          const alt = (gx + gy) % 2 === 0;
          let fill = alt ? pal.floorWoodA : pal.floorWoodB;
          if (gx < 4 && gy < 4) fill = alt ? pal.floorExecA : pal.floorExecB;
          else if (gx >= 4 && gx < 8 && gy < 3) fill = alt ? pal.floorTileA : pal.floorTileB;
          else if (gx >= 8 || (gx < 4 && gy >= 6)) fill = alt ? pal.floorCarpetA : pal.floorCarpetB;
          drawIsoQuad(ctx, gx, gy, 1, 1, 0, ox, oy, scale, fill, pal.gridLine, tiltX, tiltY);
        }
      }

      // Rugs for EXEC_OFFICE, RECEPTION, CONFERENCE_ROOM
      drawIsoQuad(ctx, 1.1, 1.4, 2.2, 1.8, 0.35, ox, oy, scale, pal.rugExec, pal.zoneBorder, tiltX, tiltY);
      drawIsoQuad(ctx, 1.0, 6.8, 2.2, 2.0, 0.35, ox, oy, scale, pal.rugRec, pal.zoneBorder, tiltX, tiltY);
      drawIsoQuad(ctx, 7.6, 7.3, 2.6, 2.1, 0.35, ox, oy, scale, pal.rugConf, pal.zoneBorder, tiltX, tiltY);

      // Perimeter architectural back walls (x=0 and y=0)
      drawIsoBox(ctx, 0, 0, GRID_W, 0.16, 0, 38, ox, oy, scale, {
        top: pal.wallTop, left: pal.wallLeft, right: pal.wallRight
      }, tiltX, tiltY);
      drawIsoBox(ctx, 0, 0, 0.16, GRID_H, 0, 38, ox, oy, scale, {
        top: pal.wallTop, left: pal.wallLeft, right: pal.wallRight
      }, tiltX, tiltY);

      // Wall telemetry screens in EXEC_OFFICE
      drawIsoBox(ctx, 0.9, 0.16, 1.4, 0.08, 16, 12, ox, oy, scale, {
        top: pal.wireCyan, left: '#0f172a', right: '#0ea5e9'
      }, tiltX, tiltY);
      drawIsoBox(ctx, 0.16, 1.0, 0.08, 1.4, 16, 12, ox, oy, scale, {
        top: pal.wirePurple, left: '#1e1b4b', right: '#7c3aed'
      }, tiltX, tiltY);

      // Glazed glass office partitions & cubicle dividers
      const partitions = [
        [3.85, 0.2, 0.14, 2.4, 28, true],
        [0.2, 3.85, 2.5, 0.14, 28, true],
        [7.85, 0.2, 0.14, 2.4, 28, true],
        [0.2, 5.85, 2.4, 0.14, 24, true],
        [7.35, 7.8, 0.14, 2.0, 24, true],
        [4.1, 5.35, 3.2, 0.12, 15, false],
        [5.65, 3.9, 0.12, 3.2, 15, false]
      ];
      for (const [px, py, pw, ph, pz, isGlass] of partitions) {
        drawIsoBox(ctx, px, py, pw, ph, 0, pz, ox, oy, scale, isGlass
          ? { top: pal.glassEdge, left: pal.glassFill, right: pal.glassFill, stroke: pal.glassEdge }
          : { top: pal.wallTop, left: pal.wallLeft, right: pal.wallRight, stroke: pal.zoneBorder },
          tiltX, tiltY
        );
      }

      // Breakroom fixtures
      drawIsoBox(ctx, 4.3, 0.35, 0.65, 0.65, 0, 26, ox, oy, scale, { top: pal.wallTop, left: pal.wallLeft, right: pal.wallRight }, tiltX, tiltY);
      drawIsoBox(ctx, 5.1, 0.35, 2.3, 0.6, 0, 13, ox, oy, scale, { top: pal.deskTop, left: pal.deskLeft, right: pal.deskRight }, tiltX, tiltY);
      drawIsoBox(ctx, 6.6, 0.45, 0.4, 0.35, 13, 8, ox, oy, scale, { top: pal.wireAmber, left: '#1f2937', right: '#374151' }, tiltX, tiltY);
      drawIsoBox(ctx, 5.6, 1.7, 1.1, 1.0, 0, 11, ox, oy, scale, { top: pal.deskTop, left: pal.deskLeft, right: pal.deskRight }, tiltX, tiltY);

      // Couches
      drawIsoBox(ctx, 0.35, 2.5, 0.65, 1.15, 0, 10, ox, oy, scale, { top: pal.couch, left: '#1e293b', right: '#334155' }, tiltX, tiltY);
      drawIsoBox(ctx, 0.4, 7.1, 0.65, 1.4, 0, 11, ox, oy, scale, { top: pal.couch, left: '#1e293b', right: '#334155' }, tiltX, tiltY);

      // Potted plants
      const plants = [[3.4, 0.5], [10.3, 3.2], [0.5, 5.3], [3.5, 8.9], [10.3, 9.1]];
      for (const [px, py] of plants) {
        drawPlant(ctx, px, py, ox, oy, scale, pal, tiltX, tiltY);
      }

      return c;
    }

    function render(now) {
      const dt = Math.min((now - prevTime) / 1000, 0.05);
      prevTime = now;

      frameAcc += dt;
      frameCount += 1;
      if (frameAcc >= 0.6) {
        setFpsDisplay(Math.min(144, Math.round(frameCount / frameAcc)));
        frameAcc = 0;
        frameCount = 0;
      }

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        rafId = requestAnimationFrame(render);
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(260, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      const cam = camRef.current;
      const smooth = 1 - Math.exp(-12 * dt);
      cam.scale += (cam.targetScale - cam.scale) * smooth;
      cam.panX += (cam.targetPanX - cam.panX) * smooth;
      cam.panY += (cam.targetPanY - cam.panY) * smooth;
      cam.tiltX += (cam.targetTiltX - cam.tiltX) * smooth;
      cam.tiltY += (cam.targetTiltY - cam.tiltY) * smooth;

      const baseFit = Math.min(width / 820, height / 490);
      const scale = Math.max(0.55, baseFit * cam.scale);
      const ox = width * 0.5 + cam.panX;
      const oy = height * 0.54 + cam.panY;

      const curTheme = themeRef.current;
      const pal = PALETTES[curTheme] || PALETTES.dark;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear background
      ctx.fillStyle = pal.canvasBg;
      ctx.fillRect(0, 0, width, height);

      // Layer 0: Static architectural cache (rebuilt only when camera settles or theme/size changes)
      const qKey = `${curTheme}|${Math.round(width)}|${Math.round(height)}|${scale.toFixed(3)}|${Math.round(ox)}|${Math.round(oy)}|${cam.tiltX.toFixed(2)}|${cam.tiltY.toFixed(2)}`;
      if (!staticCanvas || staticKey !== qKey) {
        staticCanvas = buildStaticLayer(width, height, dpr, ox, oy, scale, cam.tiltX, cam.tiltY, pal);
        staticKey = qKey;
      }
      ctx.drawImage(staticCanvas, 0, 0, width, height);

      // Layer 1A: 3D Server Racks in SECURITY_SRE with animated LED telemetry blades
      const rackXs = [8.3, 9.05, 9.8];
      const hasBlocked = wiresRef.current.some(w => w.status === 'BLOCKED' || w.status === 'HELD');
      rackXs.forEach((rx, rIdx) => {
        drawIsoBox(ctx, rx, 0.4, 0.6, 0.65, 0, 31, ox, oy, scale, {
          top: pal.rackSide, left: pal.rackBody, right: pal.rackSide, stroke: 'rgba(56,189,248,0.22)'
        }, cam.tiltX, cam.tiltY);

        for (let u = 0; u < 6; u++) {
          const zBlade = 5 + u * 4.2;
          const ledPos = projectIso(rx + 0.14, 1.06, zBlade, ox, oy, scale, cam.tiltX, cam.tiltY);
          const blink = Math.sin(now * 0.006 + rIdx * 1.9 + u * 0.9) > 0;
          ctx.fillStyle = hasBlocked && u === 0 ? pal.wireAmber : (blink ? pal.wireGreen : pal.wireCyan);
          ctx.fillRect(ledPos.x, ledPos.y, Math.max(2, 3.2 * scale), Math.max(1.5, 2 * scale));
        }
      });

      // Layer 1B: Conference holographic table + rotating 3D wireframe octahedron
      drawIsoBox(ctx, 8.0, 7.6, 1.8, 1.2, 0, 11.5, ox, oy, scale, {
        top: councilRef.current ? 'rgba(167,139,250,0.34)' : pal.deskTop,
        left: pal.deskLeft,
        right: pal.deskRight,
        stroke: councilRef.current ? pal.wirePurple : pal.zoneBorder
      }, cam.tiltX, cam.tiltY);

      const confCenter = projectIso(8.9, 8.2, 12.2, ox, oy, scale, cam.tiltX, cam.tiltY);
      ctx.beginPath();
      ctx.ellipse(confCenter.x, confCenter.y, 18 * scale, 9 * scale, 0, 0, Math.PI * 2);
      ctx.strokeStyle = councilRef.current ? pal.wirePurple : pal.wireCyan;
      ctx.globalAlpha = councilRef.current ? 0.85 : 0.35;
      ctx.lineWidth = 1.6 * scale;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Rotating 3D wireframe octahedron hologram above conference table
      const holoSpin = now * (councilRef.current ? 0.0022 : 0.0008);
      const holoR = (councilRef.current ? 0.56 : 0.32);
      const holoZ = 24 + Math.sin(now * 0.003) * 2.5;
      const topV = projectIso(8.9, 8.2, holoZ + 11, ox, oy, scale, cam.tiltX, cam.tiltY);
      const botV = projectIso(8.9, 8.2, holoZ - 9, ox, oy, scale, cam.tiltX, cam.tiltY);
      const ringV = [0, 1, 2, 3].map(k => {
        const a = holoSpin + k * (Math.PI / 2);
        return projectIso(8.9 + Math.cos(a) * holoR, 8.2 + Math.sin(a) * holoR, holoZ, ox, oy, scale, cam.tiltX, cam.tiltY);
      });
      ctx.strokeStyle = councilRef.current ? pal.wirePurple : pal.wireCyan;
      ctx.globalAlpha = councilRef.current ? 0.85 : 0.38;
      ctx.lineWidth = 1.15 * scale;
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        const cur = ringV[k];
        const nxt = ringV[(k + 1) % 4];
        ctx.moveTo(cur.x, cur.y);
        ctx.lineTo(nxt.x, nxt.y);
        ctx.moveTo(topV.x, topV.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.moveTo(botV.x, botV.y);
        ctx.lineTo(cur.x, cur.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Update agent positions with frame-rate-independent exponential smoothing
      const moveAlpha = 1 - Math.exp(-6.5 * dt);
      const liveAgents = agentsRef.current.map(agent => {
        const sim = simPosRef.current[agent.id] || { x: agent.deskCoord.x, y: agent.deskCoord.y, bob: 0 };
        sim.x += (agent.targetCoord.x - sim.x) * moveAlpha;
        sim.y += (agent.targetCoord.y - sim.y) * moveAlpha;
        const moving = Math.hypot(agent.targetCoord.x - sim.x, agent.targetCoord.y - sim.y) > 0.06;
        sim.bob += dt * (moving ? 11 : 2.8);
        simPosRef.current[agent.id] = sim;
        return { ...agent, simX: sim.x, simY: sim.y, simBob: sim.bob, moving };
      });

      // Depth-sort desks and agents by (gx + gy)
      const renderables = [];
      for (const a of liveAgents) {
        renderables.push({ kind: 'desk', depth: a.deskCoord.x + a.deskCoord.y - 0.12, agent: a });
        renderables.push({ kind: 'agent', depth: a.simX + a.simY + 0.05, agent: a });
      }
      renderables.sort((a, b) => a.depth - b.depth);

      for (const item of renderables) {
        const a = item.agent;
        if (item.kind === 'desk') {
          const dx = a.deskCoord.x - 0.45;
          const dy = a.deskCoord.y - 0.35;
          // 3D workstation desktop + steel base
          drawIsoBox(ctx, dx, dy, 0.9, 0.56, 0, 10.5, ox, oy, scale, {
            top: pal.deskTop, left: pal.deskLeft, right: pal.deskRight, stroke: pal.zoneBorder
          }, cam.tiltX, cam.tiltY);
          // Dual curved monitor with animated telemetry bar
          drawIsoBox(ctx, dx + 0.18, dy + 0.08, 0.52, 0.12, 10.5, 8.5, ox, oy, scale, {
            top: '#38bdf8', left: '#0f172a', right: '#1e293b'
          }, cam.tiltX, cam.tiltY);
          const monScreen = projectIso(dx + 0.35, dy + 0.22, 15, ox, oy, scale, cam.tiltX, cam.tiltY);
          const pulseW = (6 + Math.sin(now * 0.008 + a.deskCoord.x * 3) * 3) * scale;
          ctx.fillStyle = a.state === 'REVIEWING' ? pal.wireAmber : pal.wireCyan;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(monScreen.x - 5 * scale, monScreen.y, pulseW, 2.2 * scale);
          ctx.globalAlpha = 1;
        } else {
          // 3D articulated agent avatar
          const isSelected = selectedRef.current === a.id;
          const isHovered = hoveredRef.current === a.id;
          const ground = projectIso(a.simX, a.simY, 0.5, ox, oy, scale, cam.tiltX, cam.tiltY);

          // Selection / Council aura ring
          if (isSelected || isHovered || councilRef.current) {
            ctx.beginPath();
            ctx.ellipse(ground.x, ground.y, 14 * scale, 7 * scale, 0, 0, Math.PI * 2);
            ctx.strokeStyle = councilRef.current ? pal.wirePurple : (isSelected ? pal.wireCyan : pal.wireAmber);
            ctx.lineWidth = (isSelected ? 2.2 : 1.4) * scale;
            ctx.stroke();
          }

          // Contact shadow
          ctx.beginPath();
          ctx.ellipse(ground.x, ground.y, 8 * scale, 4 * scale, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.34)';
          ctx.fill();

          const zBob = a.moving ? Math.abs(Math.sin(a.simBob)) * 3.5 : Math.sin(a.simBob) * 0.8;
          const suit = AVATAR_COLORS[a.avatar?.suitKey] || '#1e3a8a';
          const skin = AVATAR_COLORS[a.avatar?.skinKey] || '#f2c9ac';
          const hair = AVATAR_COLORS[a.avatar?.hairKey] || '#1c1917';

          // Torso
          drawIsoBox(ctx, a.simX - 0.16, a.simY - 0.16, 0.32, 0.32, 4 + zBob, 12, ox, oy, scale, {
            top: suit, left: suit, right: '#0f172a'
          }, cam.tiltX, cam.tiltY);
          // Head
          drawIsoBox(ctx, a.simX - 0.12, a.simY - 0.12, 0.24, 0.24, 16.5 + zBob, 7.5, ox, oy, scale, {
            top: hair, left: skin, right: skin
          }, cam.tiltX, cam.tiltY);

          // Update zero-re-render DOM HUD pill position
          const pillEl = pillRefs.current[a.id];
          if (pillEl) {
            const headPos = projectIso(a.simX, a.simY, 31 + zBob, ox, oy, scale, cam.tiltX, cam.tiltY);
            pillEl.style.transform = `translate3d(${headPos.x}px, ${headPos.y}px, 0) translate(-50%, -100%)`;
          }
        }
      }

      // Layer 1C: Volumetric Overhead & Holographic Light Cones
      ctx.save();
      ctx.globalCompositeOperation = curTheme === 'dark' ? 'screen' : 'soft-light';
      const cones = [
        { gx: 1.9, gy: 2.1, r: 42, color: 'rgba(56, 189, 248, 0.12)' },
        { gx: 5.7, gy: 5.4, r: 58, color: 'rgba(255, 92, 42, 0.08)' },
        { gx: 8.9, gy: 8.2, r: 48, color: councilRef.current ? 'rgba(167, 139, 250, 0.24)' : 'rgba(56, 189, 248, 0.11)' }
      ];
      for (const cone of cones) {
        const base = projectIso(cone.gx, cone.gy, 0, ox, oy, scale, cam.tiltX, cam.tiltY);
        const top = projectIso(cone.gx, cone.gy, 68, ox, oy, scale, cam.tiltX, cam.tiltY);
        const grad = ctx.createLinearGradient(top.x, top.y, base.x, base.y);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, cone.color);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(top.x - cone.r * 0.25 * scale, top.y);
        ctx.lineTo(top.x + cone.r * 0.25 * scale, top.y);
        ctx.lineTo(base.x + cone.r * scale, base.y);
        ctx.lineTo(base.x - cone.r * scale, base.y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Layer 1D: 3D Parabolic Holographic DAG Energy Beams (OpenAI Dots)
      if (showDagRef.current) {
        const orch = liveAgents.find(a => a.id === 'ORCH-01');
        if (orch) {
          const activeWires = wiresRef.current.slice(0, 8);
          for (const wire of activeWires) {
            const target = liveAgents.find(a => a.id === wire.assignedAgentId);
            if (!target || target.id === 'ORCH-01') continue;

            const beamColor = wire.status === 'BLOCKED' || wire.status === 'HELD'
              ? pal.wireAmber
              : (wire.status === 'VERIFIED' || wire.status === 'SHIPPED' ? pal.wireGreen : pal.wireCyan);

            const pts = [];
            for (let s = 0; s <= 14; s++) {
              const u = s / 14;
              const gx = orch.simX + (target.simX - orch.simX) * u;
              const gy = orch.simY + (target.simY - orch.simY) * u;
              const gz = 19 + 30 * 4 * u * (1 - u);
              pts.push(projectIso(gx, gy, gz, ox, oy, scale, cam.tiltX, cam.tiltY));
            }

            // Outer translucent bloom
            ctx.beginPath();
            pts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
            ctx.strokeStyle = beamColor;
            ctx.globalAlpha = 0.16;
            ctx.lineWidth = 5.5 * scale;
            ctx.stroke();

            // Crisp animated core spline
            ctx.beginPath();
            pts.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
            ctx.strokeStyle = beamColor;
            ctx.globalAlpha = 0.88;
            ctx.lineWidth = 1.45 * scale;
            ctx.setLineDash([6 * scale, 5 * scale]);
            ctx.lineDashOffset = -(now * 0.032) % 24;
            ctx.stroke();
            ctx.setLineDash([]);

            // Traveling energy packet chevrons
            for (let pIdx = 0; pIdx < 3; pIdx++) {
              const tPos = ((now * 0.00055 + pIdx * 0.33) % 1);
              const gx = orch.simX + (target.simX - orch.simX) * tPos;
              const gy = orch.simY + (target.simY - orch.simY) * tPos;
              const gz = 19 + 30 * 4 * tPos * (1 - tPos);
              const pkt = projectIso(gx, gy, gz, ox, oy, scale, cam.tiltX, cam.tiltY);
              ctx.beginPath();
              ctx.arc(pkt.x, pkt.y, 2.8 * scale, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
        }
      }

      // Layer 2: 1,280 Kinetic Animated Particles via pre-baked glow sprite atlas
      const pArr = particlesRef.current;
      const sprites = spritesRef.current;
      if (pArr && sprites) {
        ctx.save();
        ctx.globalCompositeOperation = curTheme === 'dark' ? 'lighter' : 'source-over';
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const o = i * STRIDE;
          pArr[o + 6] += dt;
          if (pArr[o + 6] >= pArr[o + 7]) {
            initParticle(pArr, i);
          }

          const kind = pArr[o + 8];
          const lifeRatio = pArr[o + 6] / pArr[o + 7];
          const alpha = Math.sin(Math.PI * lifeRatio) * (curTheme === 'dark' ? 0.82 : 0.45);

          if (kind === 3) {
            // Orbital conference vortex
            const spinSpeed = councilRef.current ? 1.85 : 0.45;
            pArr[o + 3] += dt * spinSpeed;
            const ang = pArr[o + 3];
            const rad = pArr[o + 4];
            pArr[o] = 8.9 + Math.cos(ang) * rad;
            pArr[o + 1] = 8.2 + Math.sin(ang) * rad;
            pArr[o + 2] += pArr[o + 5] * dt;
          } else {
            pArr[o] += (pArr[o + 3] + Math.sin(now * 0.0012 + pArr[o + 9]) * 0.08) * dt;
            pArr[o + 1] += (pArr[o + 4] + Math.cos(now * 0.001 + pArr[o + 9]) * 0.08) * dt;
            pArr[o + 2] += pArr[o + 5] * dt;
          }

          const sp = projectIso(pArr[o], pArr[o + 1], pArr[o + 2], ox, oy, scale, cam.tiltX, cam.tiltY);
          const sprite = kind === 0 ? sprites.cyan : kind === 1 ? sprites.green : kind === 2 ? sprites.amber : sprites.purple;
          const sz = (kind === 0 ? 5.5 : kind === 3 && councilRef.current ? 8.5 : 6.8) * scale;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.drawImage(sprite, sp.x - sz * 0.5, sp.y - sz * 0.5, sz, sz);
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = e => {
    if (e.target.closest('button')) return;
    camRef.current.dragging = true;
    camRef.current.lastX = e.clientX;
    camRef.current.lastY = e.clientY;
  };

  const handlePointerMove = e => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      camRef.current.targetTiltX = nx * 1.4;
      camRef.current.targetTiltY = ny * 0.9;
    }
    if (!camRef.current.dragging) return;
    const dx = e.clientX - camRef.current.lastX;
    const dy = e.clientY - camRef.current.lastY;
    camRef.current.lastX = e.clientX;
    camRef.current.lastY = e.clientY;
    camRef.current.targetPanX += dx;
    camRef.current.targetPanY += dy;
  };

  const handlePointerUp = () => {
    camRef.current.dragging = false;
  };

  const handleWheel = e => {
    const delta = e.deltaY > 0 ? -0.09 : 0.09;
    camRef.current.targetScale = Math.max(0.65, Math.min(1.75, camRef.current.targetScale + delta));
  };

  const zoomIn = () => {
    camRef.current.targetScale = Math.min(1.75, camRef.current.targetScale + 0.14);
  };
  const zoomOut = () => {
    camRef.current.targetScale = Math.max(0.65, camRef.current.targetScale - 0.14);
  };
  const resetCam = () => {
    camRef.current.targetScale = 1;
    camRef.current.targetPanX = 0;
    camRef.current.targetPanY = -15;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      className="relative h-full w-full flex-1 overflow-hidden bg-floor-canvas select-none cursor-grab active:cursor-grabbing"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Top-Left Architectural Telemetry Badges */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
        <span className="rounded border border-line bg-terminal-card/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg backdrop-blur-sm">
          3D DEPTH FLOOR · 1,280 PARTICLES · {fpsDisplay} FPS
        </span>
        {councilActive && (
          <span className="rounded border border-wire-purple bg-terminal-card/95 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-wire-purple">
            GROK COUNCIL ACTIVE · CONFERENCE ROOM
          </span>
        )}
      </div>

      {/* Top-Right Canvas Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSummonCouncil}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
            councilActive
              ? 'border-wire-purple bg-wire-purple text-bg'
              : 'border-line-strong bg-terminal-card/95 text-fg hover:border-wire-purple hover:text-wire-purple'
          }`}
        >
          <Users className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">
            {councilActive ? t.controls.councilReturn : t.controls.councilSummon}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleDagLinks}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
            showDagLinks
              ? 'border-wire-cyan bg-wire-cyan/15 text-wire-cyan'
              : 'border-line-strong bg-terminal-card/95 text-muted hover:text-fg'
          }`}
        >
          <GitBranch className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">DOTS</span>
        </button>

        <div className="flex items-center rounded border border-line-strong bg-terminal-card/95">
          <button
            type="button"
            onClick={zoomOut}
            aria-label="Zoom out"
            className="inline-flex min-h-9 min-w-9 items-center justify-center text-muted hover:text-fg"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={resetCam}
            aria-label="Reset camera"
            className="inline-flex min-h-9 min-w-9 items-center justify-center border-x border-line text-muted hover:text-fg"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={zoomIn}
            aria-label="Zoom in"
            className="inline-flex min-h-9 min-w-9 items-center justify-center text-muted hover:text-fg"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Zero-Re-Render Agent Pills & Speech Bubbles */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {agents.map(agent => {
          const isSelected = selectedAgentId === agent.id;
          const isHovered = hoveredAgentId === agent.id;
          const showSpeech =
            isSelected ||
            isHovered ||
            agent.id === 'ORCH-01' ||
            agent.id === 'RES-06' ||
            agent.id === 'DOC-09' ||
            agent.id === 'SEC-05';

          return (
            <div
              key={agent.id}
              ref={el => { pillRefs.current[agent.id] = el; }}
              className="pointer-events-auto absolute top-0 left-0 will-change-transform"
              style={{ transform: 'translate3d(-500px, -500px, 0)' }}
            >
              {showSpeech && agent.speechBubble && (
                <div className="mb-1 max-w-[185px] truncate rounded border border-line-strong bg-terminal-card/95 px-2 py-0.5 font-mono text-[9.5px] text-fg shadow-md backdrop-blur-sm">
                  {agent.speechBubble}
                </div>
              )}
              <button
                type="button"
                onClick={() => onSelectAgent(agent.id)}
                onMouseEnter={() => setHoveredAgentId(agent.id)}
                onMouseLeave={() => setHoveredAgentId(null)}
                className={`flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] font-semibold shadow-sm transition-colors ${
                  isSelected
                    ? 'border-wire-cyan bg-wire-cyan text-bg'
                    : councilActive
                      ? 'border-wire-purple/80 bg-terminal-card/95 text-wire-purple'
                      : 'border-line-strong bg-terminal-card/90 text-fg hover:border-wire-cyan'
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    agent.state === 'DEBATING'
                      ? 'bg-wire-purple'
                      : agent.state === 'REVIEWING'
                        ? 'bg-wire-amber'
                        : 'bg-wire-green'
                  }`}
                />
                <span>{agent.id}</span>
                <span className="hidden opacity-75 md:inline">{agent.name.split(' ')[0]}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Inspect CTA */}
      <div className="absolute right-3 bottom-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectAgent(selectedAgentId || 'ORCH-01')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded border border-line-strong bg-terminal-card/95 px-3 py-1 font-mono text-[11px] font-semibold text-fg backdrop-blur-sm hover:border-wire-cyan hover:text-wire-cyan"
        >
          <Eye className="size-3.5" aria-hidden="true" />
          <span>{t.controls.inspect}: {selectedAgentId || 'ORCH-01'}</span>
        </button>
      </div>
    </div>
  );
}

