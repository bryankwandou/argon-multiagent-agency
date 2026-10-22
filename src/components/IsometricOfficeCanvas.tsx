import React, { useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  MessageSquare,
  Network,
  RotateCcw,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { AgencyAgent, AgentRoleId, IsoCoord, TaskWire } from '../types/agency';
import { ISOMETRIC_PALETTES, type IsometricFloorPalette } from '../styles/themePalette';
import { useAppSettings } from '../context/AppSettingsContext';

interface IsometricOfficeCanvasProps {
  agents: AgencyAgent[];
  wires: TaskWire[];
  selectedAgentId: AgentRoleId | null;
  onSelectAgent: (agentId: AgentRoleId) => void;
  showDagLinks: boolean;
  onToggleDagLinks: () => void;
  onSummonCouncil: () => void;
  councilActive: boolean;
}

interface ProjectedAgentOverlay {
  agent: AgencyAgent;
  screenX: number;
  screenY: number;
}

const GRID_W = 11;
const GRID_H = 10;
const BASE_TILE_W = 64;
const BASE_TILE_H = 32;

function isoToScreen(
  gx: number,
  gy: number,
  gz: number,
  originX: number,
  originY: number,
  scale: number
): { x: number; y: number } {
  const halfW = (BASE_TILE_W / 2) * scale;
  const halfH = (BASE_TILE_H / 2) * scale;
  const sx = originX + (gx - gy) * halfW;
  const sy = originY + (gx + gy) * halfH - gz * scale;
  return { x: sx, y: sy };
}

function drawIsoPrism(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  gw: number,
  gd: number,
  gh: number,
  originX: number,
  originY: number,
  scale: number,
  topColor: string,
  leftColor: string,
  rightColor: string,
  strokeColor?: string
) {
  const p00 = isoToScreen(gx, gy, gh, originX, originY, scale);
  const p10 = isoToScreen(gx + gw, gy, gh, originX, originY, scale);
  const p11 = isoToScreen(gx + gw, gy + gd, gh, originX, originY, scale);
  const p01 = isoToScreen(gx, gy + gd, gh, originX, originY, scale);

  const b10 = isoToScreen(gx + gw, gy, 0, originX, originY, scale);
  const b11 = isoToScreen(gx + gw, gy + gd, 0, originX, originY, scale);
  const b01 = isoToScreen(gx, gy + gd, 0, originX, originY, scale);

  ctx.beginPath();
  ctx.moveTo(p01.x, p01.y);
  ctx.lineTo(p11.x, p11.y);
  ctx.lineTo(b11.x, b11.y);
  ctx.lineTo(b01.x, b01.y);
  ctx.closePath();
  ctx.fillStyle = leftColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.8, 0.9 * scale);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(p10.x, p10.y);
  ctx.lineTo(p11.x, p11.y);
  ctx.lineTo(b11.x, b11.y);
  ctx.lineTo(b10.x, b10.y);
  ctx.closePath();
  ctx.fillStyle = rightColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.8, 0.9 * scale);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p10.x, p10.y);
  ctx.lineTo(p11.x, p11.y);
  ctx.lineTo(p01.x, p01.y);
  ctx.closePath();
  ctx.fillStyle = topColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.8, 0.9 * scale);
    ctx.stroke();
  }
}

function drawIsoTile(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  gw: number,
  gd: number,
  originX: number,
  originY: number,
  scale: number,
  fillColor: string,
  strokeColor?: string
) {
  const p00 = isoToScreen(gx, gy, 0, originX, originY, scale);
  const p10 = isoToScreen(gx + gw, gy, 0, originX, originY, scale);
  const p11 = isoToScreen(gx + gw, gy + gd, 0, originX, originY, scale);
  const p01 = isoToScreen(gx, gy + gd, 0, originX, originY, scale);

  ctx.beginPath();
  ctx.moveTo(p00.x, p00.y);
  ctx.lineTo(p10.x, p10.y);
  ctx.lineTo(p11.x, p11.y);
  ctx.lineTo(p01.x, p01.y);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = Math.max(0.5, 0.6 * scale);
    ctx.stroke();
  }
}

export function IsometricOfficeCanvas({
  agents,
  wires,
  selectedAgentId,
  onSelectAgent,
  showDagLinks,
  onToggleDagLinks,
  onSummonCouncil,
  councilActive,
}: IsometricOfficeCanvasProps) {
  const { theme, locale, t } = useAppSettings();
  const palette: IsometricFloorPalette = ISOMETRIC_PALETTES[theme];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: -15 });
  const [hoveredAgentId, setHoveredAgentId] = useState<AgentRoleId | null>(null);
  const [overlays, setOverlays] = useState<ProjectedAgentOverlay[]>([]);

  const dragStateRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
    moved: boolean;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
    moved: false,
  });

  const animatedCoordsRef = useRef<Record<string, IsoCoord>>({});
  const agentsRef = useRef<AgencyAgent[]>(agents);
  const wiresRef = useRef<TaskWire[]>(wires);
  agentsRef.current = agents;
  wiresRef.current = wires;

  useEffect(() => {
    for (const agent of agents) {
      if (!animatedCoordsRef.current[agent.id]) {
        animatedCoordsRef.current[agent.id] = { ...agent.currentCoord };
      }
    }
  }, [agents]);

  useEffect(() => {
    let animationFrameId = 0;
    let lastOverlaySync = 0;

    const renderLoop = (timestamp: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animationFrameId = window.requestAnimationFrame(renderLoop);
        return;
      }

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(320, Math.floor(rect.width));
      const targetH = Math.max(320, Math.floor(rect.height));

      if (canvas.width !== targetW * dpr || canvas.height !== targetH * dpr) {
        canvas.width = targetW * dpr;
        canvas.height = targetH * dpr;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = window.requestAnimationFrame(renderLoop);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = palette.backdrop;
      ctx.fillRect(0, 0, targetW, targetH);

      const autoFit = Math.min(targetW / 820, targetH / 560);
      const scale = Math.max(0.58, Math.min(1.65, autoFit * zoom));
      const originX = targetW * 0.48 + pan.x;
      const originY = targetH * 0.14 + pan.y;

      ctx.strokeStyle = palette.gridLine;
      ctx.lineWidth = 1;
      const gridStep = Math.round(36 * scale);
      for (let gx = 0; gx < targetW; gx += gridStep) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, targetH);
        ctx.stroke();
      }
      for (let gy = 0; gy < targetH; gy += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(targetW, gy);
        ctx.stroke();
      }

      const f00 = isoToScreen(-0.2, -0.2, -6, originX, originY, scale);
      const f10 = isoToScreen(GRID_W + 0.2, -0.2, -6, originX, originY, scale);
      const f11 = isoToScreen(GRID_W + 0.2, GRID_H + 0.2, -6, originX, originY, scale);
      const f01 = isoToScreen(-0.2, GRID_H + 0.2, -6, originX, originY, scale);
      ctx.beginPath();
      ctx.moveTo(f00.x, f00.y);
      ctx.lineTo(f10.x, f10.y);
      ctx.lineTo(f11.x, f11.y);
      ctx.lineTo(f01.x, f01.y);
      ctx.closePath();
      ctx.fillStyle = palette.shadowColor;
      ctx.fill();

      drawIsoPrism(
        ctx,
        0,
        0,
        GRID_W,
        GRID_H,
        5,
        originX,
        originY,
        scale,
        palette.floorWoodA,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );

      for (let ix = 0; ix < GRID_W; ix += 1) {
        for (let iy = 0; iy < GRID_H; iy += 1) {
          const isEven = (ix + iy) % 2 === 0;
          let tileColor = isEven ? palette.floorWoodA : palette.floorWoodB;

          if (ix < 4 && iy < 4) {
            tileColor = isEven ? palette.floorExecA : palette.floorExecB;
          } else if (ix >= 4 && ix < 8 && iy < 3) {
            tileColor = isEven ? palette.floorTileA : palette.floorTileB;
          } else if (ix < 4 && iy >= 6) {
            tileColor = isEven ? palette.floorCarpetA : palette.floorCarpetB;
          } else if (ix >= 8) {
            tileColor = isEven ? palette.floorCarpetA : palette.floorCarpetB;
          }

          drawIsoTile(
            ctx,
            ix,
            iy,
            1,
            1,
            originX,
            originY,
            scale,
            tileColor,
            'rgba(0,0,0,0.12)'
          );
        }
      }

      drawIsoTile(ctx, 1.0, 6.8, 2.2, 2.0, originX, originY, scale, palette.rugBase, palette.rugBorder);
      drawIsoTile(ctx, 7.6, 7.3, 2.6, 2.1, originX, originY, scale, palette.rugBase, palette.rugBorder);
      drawIsoTile(ctx, 1.1, 1.4, 2.2, 1.8, originX, originY, scale, palette.rugBase, palette.rugBorder);

      const wallH = 38;
      const wallT = 0.22;

      drawIsoPrism(
        ctx,
        0,
        0,
        GRID_W,
        wallT,
        wallH,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        0,
        0,
        wallT,
        GRID_H,
        wallH,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        0.9,
        0.05,
        2.1,
        0.08,
        24,
        originX,
        originY,
        scale,
        palette.monitorScreenActive,
        palette.monitorScreenIdle,
        palette.monitorScreenActive
      );
      drawIsoPrism(
        ctx,
        0.05,
        1.0,
        0.08,
        2.0,
        24,
        originX,
        originY,
        scale,
        palette.monitorScreenActive,
        palette.monitorScreenActive,
        palette.monitorScreenIdle
      );

      drawIsoPrism(
        ctx,
        3.85,
        0.2,
        0.18,
        2.4,
        wallH * 0.85,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );
      drawIsoPrism(
        ctx,
        0.2,
        3.85,
        2.5,
        0.18,
        wallH * 0.85,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        7.85,
        0.2,
        0.18,
        2.4,
        wallH * 0.85,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        0.2,
        5.85,
        2.4,
        0.18,
        wallH * 0.78,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        7.35,
        7.8,
        0.18,
        2.0,
        wallH * 0.75,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.wallLeft,
        palette.wallRight,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        4.3,
        0.35,
        0.65,
        0.65,
        26,
        originX,
        originY,
        scale,
        palette.cabinetTop,
        palette.cabinetSide,
        palette.wallRight,
        palette.wallStroke
      );
      drawIsoPrism(
        ctx,
        5.1,
        0.35,
        2.3,
        0.6,
        13,
        originX,
        originY,
        scale,
        palette.cabinetTop,
        palette.deskSideLeft,
        palette.deskSideRight,
        palette.wallStroke
      );
      drawIsoPrism(
        ctx,
        6.6,
        0.45,
        0.4,
        0.35,
        20,
        originX,
        originY,
        scale,
        palette.monitorFrame,
        palette.suitCharcoal,
        palette.monitorFrame
      );
      drawIsoPrism(
        ctx,
        5.6,
        1.7,
        1.1,
        1.0,
        11,
        originX,
        originY,
        scale,
        palette.wallTop,
        palette.deskSideLeft,
        palette.deskSideRight,
        palette.wallStroke
      );

      for (let sr = 0; sr < 3; sr += 1) {
        const rx = 8.3 + sr * 0.75;
        drawIsoPrism(
          ctx,
          rx,
          0.4,
          0.6,
          0.65,
          29,
          originX,
          originY,
          scale,
          palette.serverRack,
          palette.monitorFrame,
          palette.serverRack,
          palette.wallStroke
        );
        const ledPos = isoToScreen(rx + 0.3, 1.06, 20 - (sr % 2) * 4, originX, originY, scale);
        ctx.beginPath();
        ctx.arc(ledPos.x, ledPos.y, 2.2 * scale, 0, Math.PI * 2);
        ctx.fillStyle =
          Math.floor(timestamp / 350 + sr) % 2 === 0
            ? palette.serverLedGreen
            : palette.serverLedCyan;
        ctx.fill();
      }

      drawIsoPrism(
        ctx,
        0.35,
        2.5,
        0.65,
        1.15,
        11,
        originX,
        originY,
        scale,
        palette.couchCushion,
        palette.couchBase,
        palette.couchBase,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        0.4,
        7.1,
        0.65,
        1.4,
        11,
        originX,
        originY,
        scale,
        palette.couchCushion,
        palette.couchBase,
        palette.couchBase,
        palette.wallStroke
      );

      drawIsoPrism(
        ctx,
        8.0,
        7.6,
        1.8,
        1.2,
        12,
        originX,
        originY,
        scale,
        palette.deskTop,
        palette.deskSideLeft,
        palette.deskSideRight,
        palette.wallStroke
      );

      const plantCoords: IsoCoord[] = [
        { x: 3.4, y: 0.5 },
        { x: 0.5, y: 5.3 },
        { x: 3.5, y: 8.9 },
        { x: 10.3, y: 3.2 },
        { x: 10.3, y: 9.1 },
      ];
      for (const pc of plantCoords) {
        drawIsoPrism(
          ctx,
          pc.x,
          pc.y,
          0.36,
          0.36,
          8,
          originX,
          originY,
          scale,
          palette.plantPot,
          palette.deskSideLeft,
          palette.deskSideRight
        );
        const leafCenter = isoToScreen(pc.x + 0.18, pc.y + 0.18, 14, originX, originY, scale);
        ctx.beginPath();
        ctx.arc(leafCenter.x, leafCenter.y, 6.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = palette.plantLeafA;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(leafCenter.x - 2 * scale, leafCenter.y - 2 * scale, 4.2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = palette.plantLeafB;
        ctx.fill();
      }

      drawIsoPrism(
        ctx,
        4.1,
        5.35,
        3.2,
        0.12,
        16,
        originX,
        originY,
        scale,
        palette.partitionTop,
        palette.partitionSide,
        palette.partitionSide,
        palette.wallStroke
      );
      drawIsoPrism(
        ctx,
        5.65,
        3.9,
        0.12,
        3.2,
        16,
        originX,
        originY,
        scale,
        palette.partitionTop,
        palette.partitionSide,
        palette.partitionSide,
        palette.wallStroke
      );

      const currentAgents = agentsRef.current;
      for (const agent of currentAgents) {
        const anim = animatedCoordsRef.current[agent.id] ?? { ...agent.currentCoord };
        const dx = agent.targetCoord.x - anim.x;
        const dy = agent.targetCoord.y - anim.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0.02) {
          anim.x += dx * 0.08;
          anim.y += dy * 0.08;
        } else {
          anim.x = agent.targetCoord.x;
          anim.y = agent.targetCoord.y;
        }
        animatedCoordsRef.current[agent.id] = anim;
      }

      type RenderableItem =
        | { kind: 'DESK'; depth: number; agent: AgencyAgent }
        | { kind: 'AGENT'; depth: number; agent: AgencyAgent; coord: IsoCoord };

      const items: RenderableItem[] = [];
      for (const agent of currentAgents) {
        items.push({
          kind: 'DESK',
          depth: agent.deskCoord.x + agent.deskCoord.y,
          agent,
        });
        const animCoord = animatedCoordsRef.current[agent.id] ?? agent.currentCoord;
        items.push({
          kind: 'AGENT',
          depth: animCoord.x + animCoord.y + 0.15,
          agent,
          coord: animCoord,
        });
      }

      items.sort((a, b) => a.depth - b.depth);

      const nextOverlays: ProjectedAgentOverlay[] = [];

      for (const item of items) {
        if (item.kind === 'DESK') {
          const d = item.agent.deskCoord;
          const isSelected = item.agent.id === selectedAgentId;

          drawIsoPrism(
            ctx,
            d.x - 0.45,
            d.y - 0.35,
            0.95,
            0.65,
            11,
            originX,
            originY,
            scale,
            palette.deskTop,
            palette.deskSideLeft,
            palette.deskSideRight,
            isSelected ? palette.wireBeamCyan : palette.wallStroke
          );

          const isWorking =
            item.agent.state === 'TYPING' ||
            item.agent.state === 'THINKING' ||
            item.agent.state === 'REVIEWING';
          drawIsoPrism(
            ctx,
            d.x - 0.18,
            d.y - 0.22,
            0.38,
            0.12,
            18,
            originX,
            originY,
            scale,
            palette.monitorFrame,
            isWorking ? palette.monitorScreenActive : palette.monitorScreenIdle,
            palette.monitorFrame
          );

          const lampPos = isoToScreen(d.x + 0.28, d.y - 0.1, 15, originX, originY, scale);
          ctx.beginPath();
          ctx.arc(lampPos.x, lampPos.y, 11 * scale, 0, Math.PI * 2);
          ctx.fillStyle = palette.lampGlow;
          ctx.fill();
        } else {
          const { agent, coord } = item;
          const isMoving =
            Math.hypot(agent.targetCoord.x - coord.x, agent.targetCoord.y - coord.y) > 0.06;
          const bobOffset = isMoving
            ? Math.abs(Math.sin(timestamp * 0.012)) * 3.5
            : agent.state === 'TYPING'
            ? Math.sin(timestamp * 0.018 + agent.id.charCodeAt(5)) * 1.1
            : 0;

          const baseScreen = isoToScreen(
            coord.x,
            coord.y,
            11 + bobOffset,
            originX,
            originY,
            scale
          );

          const isSelected = agent.id === selectedAgentId;
          const isHovered = agent.id === hoveredAgentId;

          const ringPos = isoToScreen(coord.x, coord.y, 1, originX, originY, scale);
          ctx.beginPath();
          ctx.ellipse(
            ringPos.x,
            ringPos.y,
            13 * scale,
            7 * scale,
            0,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = isSelected
            ? palette.wireBeamAmber
            : isHovered
            ? palette.wireBeamCyan
            : agent.state === 'DEBATING'
            ? palette.wireBeamPurple
            : palette.wireBeamGreen;
          ctx.lineWidth = (isSelected || isHovered ? 2.4 : 1.3) * scale;
          ctx.stroke();

          const suitColor = palette[agent.avatar.suitKey];
          const skinColor = palette[agent.avatar.skinKey];
          const hairColor = palette[agent.avatar.hairKey];

          drawIsoPrism(
            ctx,
            coord.x - 0.16,
            coord.y - 0.16,
            0.32,
            0.32,
            14 + bobOffset,
            originX,
            originY,
            scale,
            suitColor,
            suitColor,
            palette.monitorFrame,
            palette.wallStroke
          );

          const headScreen = isoToScreen(
            coord.x,
            coord.y,
            21 + bobOffset,
            originX,
            originY,
            scale
          );
          ctx.beginPath();
          ctx.arc(headScreen.x, headScreen.y, 5.8 * scale, 0, Math.PI * 2);
          ctx.fillStyle = skinColor;
          ctx.fill();
          ctx.strokeStyle = palette.wallStroke;
          ctx.lineWidth = 1 * scale;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(headScreen.x, headScreen.y - 1.6 * scale, 5.6 * scale, Math.PI, 0);
          ctx.fillStyle = hairColor;
          ctx.fill();

          nextOverlays.push({
            agent,
            screenX: baseScreen.x,
            screenY: headScreen.y - 10 * scale,
          });
        }
      }

      if (showDagLinks) {
        const activeWires = wiresRef.current;
        const coordByAgent = new Map<AgentRoleId, { x: number; y: number }>();
        for (const ov of nextOverlays) {
          coordByAgent.set(ov.agent.id, { x: ov.screenX, y: ov.screenY });
        }

        const orchPos = coordByAgent.get('ORCH-01');
        if (orchPos) {
          for (const wire of activeWires) {
            const targetPos = coordByAgent.get(wire.assignedAgentId);
            if (!targetPos || wire.assignedAgentId === 'ORCH-01') continue;

            const midX = (orchPos.x + targetPos.x) / 2;
            const midY = Math.min(orchPos.y, targetPos.y) - 38 * scale;

            ctx.beginPath();
            ctx.moveTo(orchPos.x, orchPos.y + 8 * scale);
            ctx.quadraticCurveTo(midX, midY, targetPos.x, targetPos.y + 8 * scale);
            ctx.strokeStyle =
              wire.status === 'BLOCKED'
                ? palette.wireBeamAmber
                : wire.status === 'VERIFIED' || wire.status === 'SHIPPED'
                ? palette.wireBeamGreen
                : palette.wireBeamCyan;
            ctx.lineWidth = 1.4 * scale;
            ctx.setLineDash([5 * scale, 4 * scale]);
            ctx.lineDashOffset = -((timestamp * 0.03) % 24);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      ctx.restore();

      if (timestamp - lastOverlaySync > 60) {
        lastOverlaySync = timestamp;
        setOverlays(nextOverlays);
      }

      animationFrameId = window.requestAnimationFrame(renderLoop);
    };

    animationFrameId = window.requestAnimationFrame(renderLoop);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [palette, zoom, pan, selectedAgentId, hoveredAgentId, showDagLinks]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragStateRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: pan.x,
      origPanY: pan.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.dragging) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;
    if (Math.hypot(dx, dy) > 4) {
      dragStateRef.current.moved = true;
    }
    setPan({
      x: dragStateRef.current.origPanX + dx,
      y: dragStateRef.current.origPanY + dy,
    });
  };

  const handlePointerUp = () => {
    dragStateRef.current.dragging = false;
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative h-full w-full flex-1 overflow-hidden bg-floor-canvas select-none"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      <div className="pointer-events-none absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5">
        <span className="rounded border border-line bg-terminal-card/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg backdrop-blur-sm">
          {locale === 'id'
            ? 'LANTAI AGENSI ISOMETRIK 2.5D · 10 SPESIALIS AKTIF'
            : '2.5D ISOMETRIC AGENCY FLOOR · 10 ACTIVE SPECIALISTS'}
        </span>
        {councilActive && (
          <span className="rounded border border-wire-purple bg-terminal-card/95 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-wire-purple">
            {locale === 'id'
              ? 'SIDANG DEWAN GROK AKTIF DI RUANG KONFERENSI'
              : 'GROK COUNCIL DEBATE ACTIVE IN CONFERENCE ROOM'}
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSummonCouncil}
          className="inline-flex min-h-9 items-center gap-1.5 rounded border border-line-strong bg-terminal-card/95 px-2.5 py-1 font-mono text-[11px] font-medium text-fg transition-colors hover:border-wire-purple hover:text-wire-purple"
        >
          <Users className="size-3.5 text-wire-purple" aria-hidden="true" />
          <span className="hidden sm:inline">
            {councilActive ? t.controls.councilReturn : t.controls.councilSummon}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleDagLinks}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
            showDagLinks
              ? 'border-wire-cyan bg-terminal-card text-wire-cyan'
              : 'border-line bg-terminal-card/85 text-muted hover:text-fg'
          }`}
        >
          <Network className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">DOTS</span>
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.12).toFixed(2))))}
          aria-label="Zoom In"
          className="grid size-9 place-items-center rounded border border-line bg-terminal-card/90 text-fg hover:border-line-strong"
        >
          <ZoomIn className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.72, Number((z - 0.12).toFixed(2))))}
          aria-label="Zoom Out"
          className="grid size-9 place-items-center rounded border border-line bg-terminal-card/90 text-fg hover:border-line-strong"
        >
          <ZoomOut className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1.0);
            setPan({ x: 0, y: -15 });
          }}
          aria-label="Reset Camera"
          className="grid size-9 place-items-center rounded border border-line bg-terminal-card/90 text-fg hover:border-line-strong"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {overlays.map(({ agent, screenX, screenY }) => {
          const isSelected = agent.id === selectedAgentId;
          const isHovered = agent.id === hoveredAgentId;
          const showSpeech =
            Boolean(agent.speechBubble) &&
            (isSelected ||
              isHovered ||
              agent.id === 'ORCH-01' ||
              agent.id === 'RES-06' ||
              agent.id === 'DOC-09' ||
              agent.id === 'SEC-05');

          return (
            <div
              key={agent.id}
              style={{
                transform: `translate3d(${Math.round(screenX)}px, ${Math.round(screenY)}px, 0)`,
              }}
              className="absolute top-0 left-0 -translate-x-1/2 -translate-y-full"
            >
              {showSpeech && agent.speechBubble && (
                <div className="mb-1.5 max-w-[185px] rounded border border-line-strong bg-fg px-2 py-1 text-[10px] leading-tight font-medium text-bg shadow-sm">
                  <p className="truncate font-mono text-[9px] font-bold uppercase opacity-75">
                    {agent.id} · {agent.activeWireId ?? 'IDLE'}
                  </p>
                  <p className="mt-0.5 line-clamp-2">{agent.speechBubble}</p>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!dragStateRef.current.moved) {
                    onSelectAgent(agent.id);
                  }
                }}
                onMouseEnter={() => setHoveredAgentId(agent.id)}
                onMouseLeave={() =>
                  setHoveredAgentId((prev) => (prev === agent.id ? null : prev))
                }
                className={`pointer-events-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium transition-transform ${
                  isSelected
                    ? 'scale-105 border border-wire-amber bg-terminal-card text-wire-amber'
                    : isHovered
                    ? 'scale-105 border border-wire-cyan bg-terminal-card text-fg'
                    : 'border border-line bg-terminal-card/90 text-fg/90 hover:border-line-strong'
                }`}
              >
                <MessageSquare className="size-2.5 shrink-0 text-wire-cyan" aria-hidden="true" />
                <span className="whitespace-nowrap">
                  {isHovered || isSelected ? `${agent.scrantonAlias} (${agent.id})` : agent.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line-strong bg-terminal-card/95 px-3 py-1.5 shadow-lg backdrop-blur-md">
        <span className="font-mono text-[11px] text-muted">
          {locale === 'id'
            ? 'Geser lantai · Klik agen untuk inspeksi'
            : 'Drag floor · Click agent to inspect'}
        </span>
        <button
          type="button"
          onClick={() => onSelectAgent(selectedAgentId ?? 'ORCH-01')}
          className="inline-flex items-center gap-1 rounded-full bg-wire-cyan px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-bg"
        >
          <Maximize2 className="size-3" aria-hidden="true" />
          <span>{t.controls.inspect}</span>
        </button>
      </div>
    </div>
  );
}
