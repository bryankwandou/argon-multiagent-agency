# Argon Multi-Agent Agency — Gemini 4 Argon High Command Floor

Autonomous Multi-Agent Agency workstation uniting a 3D architectural floor canvas (1,280 kinetic particles, volumetric light cones, depth-sorted workstations, server racks, and holographic DAG energy beams), OpenAI Dots DAG scheduling, Grok Multi-Agent Council debate, Sandbox Preview runtimes, Neon PostgreSQL authentication with Master Admin approval, Antigravity MCP Pro Plan Credit Bridge, and Windows desktop distribution.

## Core Architecture

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Canvas 2D 3-layer hybrid 3D renderer (OffscreenCanvas static geometry, dynamic extruded props, Float32Array 1,280-particle sprite atlas), Lucide icons, authentic audio cues.
- **Backend API (`/api`)**: Vercel Serverless Functions backed by Neon PostgreSQL (`@neondatabase/serverless`), HS256 JWT authentication with live database status checks, bcryptjs password hashing, sliding-window rate limiting, and Antigravity MCP JSON-RPC 2.0 Bridge.
- **Access Control**: Master Account (`nayrbryanGaming`) exclusively approves or rejects new user registration requests (`PENDING_APPROVAL` -> `APPROVED` / `REJECTED`).
- **Desktop Installer**: Windows x64 NSIS setup binary (`Argon_MultiAgent_Agency_0.62.0_Setup.exe`, SHA-256 `6C6B69CBB1E6234CD2A4A0F7FD53E2EF9E278255B8E951A0159841B1004C97CE`) downloadable directly via `/api/download/setup` and GitHub Releases, plus Electron wrapper source in `desktop/`.

## Local Development

```bash
npm install
npm run dev
```

## Verification Suite

```bash
npm run build
npm test
```

