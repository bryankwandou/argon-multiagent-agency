import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Load .env
const envPath = path.join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
}

const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:3001';
const tempUsername = `qa_verify_${Date.now()}`;
const tempPass = 'VerifyPass!2026';

async function callJson(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
}

async function runTests() {
  console.log(`Running full live integration suite against ${BASE}...`);

  // 1. Public MCP bridge check (must NOT leak DB internals)
  const pubMcp = await callJson('/api/agent/mcp-bridge');
  assert.equal(pubMcp.status, 200, 'Public MCP health check must return 200');
  assert.equal(pubMcp.data.status, 'CONNECTED');
  assert.equal(pubMcp.data.neonDatabase, undefined, 'Unauthenticated MCP must not expose DB details');
  console.log('[PASS] 1. Public MCP Bridge status & zero telemetry leakage');

  // 2. Reject invalid credentials
  const badLogin = await callJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'nayrbryanGaming', password: 'WrongPassword123' })
  });
  assert.equal(badLogin.status, 401, 'Invalid password must be rejected with 401');
  console.log('[PASS] 2. Invalid credentials rejected (401)');

  // 3. Master account login
  const masterLogin = await callJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'nayrbryanGaming', password: '@Nataliamaria12345' })
  });
  assert.equal(masterLogin.status, 200, 'Master account login must succeed');
  assert.equal(masterLogin.data.user.role, 'MASTER_ADMIN');
  assert.ok(masterLogin.data.token, 'Master JWT must be issued');
  const masterToken = masterLogin.data.token;
  console.log('[PASS] 3. Master Account (nayrbryanGaming) Neon DB login verified');

  // 4. Register fresh regular account -> must be PENDING_APPROVAL
  const reg = await callJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username: tempUsername, password: tempPass, email: `${tempUsername}@argon.local` })
  });
  assert.equal(reg.status, 201, 'Fresh registration must return 201');
  assert.equal(reg.data.user.status, 'PENDING_APPROVAL');
  const tempUserId = reg.data.user.id;
  console.log(`[PASS] 4. Fresh account (${tempUsername}) persisted to Neon as PENDING_APPROVAL`);

  // 5. Pending account must be blocked from login before Master approval
  const pendingLogin = await callJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: tempUsername, password: tempPass })
  });
  assert.equal(pendingLogin.status, 403, 'Pending user must be blocked with 403');
  console.log('[PASS] 5. Pending user blocked from login prior to Master ACC (403)');

  // 6. Master account lists users & approves the new account
  const userList = await callJson('/api/auth/users', {
    headers: { Authorization: `Bearer ${masterToken}` }
  });
  assert.equal(userList.status, 200);
  assert.ok(userList.data.users.some(u => u.id === tempUserId));

  const approve = await callJson('/api/auth/approve', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({ userId: tempUserId, action: 'APPROVE' })
  });
  assert.equal(approve.status, 200);
  assert.equal(approve.data.user.status, 'APPROVED');
  console.log('[PASS] 6. Master Account approved new account in Neon PostgreSQL');

  // 7. Approved user logs in, and MUST be blocked from admin endpoints (403)
  const userLogin = await callJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: tempUsername, password: tempPass })
  });
  assert.equal(userLogin.status, 200, 'Approved user must now log in');
  const userToken = userLogin.data.token;

  const unauthAdmin = await callJson('/api/auth/users', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(unauthAdmin.status, 403, 'Standard user must be rejected from Master Admin routes');
  console.log('[PASS] 7. Approved user login works & Master Admin RBAC strictly enforced (403)');

  // 8. Authenticated Antigravity MCP Bridge JSON-RPC 2.0 command
  const mcpRpc = await callJson('/api/agent/mcp-bridge', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({ command: 'SYNC_NEON_HYDROGEN' })
  });
  assert.equal(mcpRpc.status, 200);
  assert.equal(mcpRpc.data.rpcResponse.ack, true);
  assert.equal(mcpRpc.data.neonDatabase.connected, true);
  console.log(`[PASS] 8. Antigravity MCP Bridge live JSON-RPC ACK (Neon latency ${mcpRpc.data.neonDatabase.latencyMs}ms)`);

  // 9. Live Real-Time Multi-Agent Orchestration (Neon Hydrogen xHigh + Grok Council + DAG Wires)
  const orch = await callJson('/api/agent/orchestrate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({
      prompt: 'Audit zero-trust payment API and build Cyber Packet Runner arcade sandbox',
      mode: 'GROK_COUNCIL',
      targetAgent: 'ALL',
      priority: 'P0',
      useNeonHydrogen: true
    })
  });
  assert.equal(orch.status, 200, 'Live orchestration must succeed');
  assert.equal(orch.data.newWires.length, 3, 'Must generate 3 chained AG-2xx DAG wires');
  assert.equal(orch.data.councilVotes.length, 4, 'Must produce 4 Grok Council consensus votes');
  assert.ok(orch.data.artifact.filename.includes('RetroArcadeGame'), 'Must compile domain-aware artifact');
  assert.ok(orch.data.executionId > 0, 'Must persist execution log into Neon PostgreSQL');
  console.log(`[PASS] 9. Live Orchestration verified (Execution #${orch.data.executionId}, ${orch.data.totalTokens} tokens, ${orch.data.elapsedMs}ms)`);

  // 10. Verify Desktop .EXE metadata endpoint & checksum
  const dlMeta = await callJson('/api/download/setup?meta=1');
  assert.equal(dlMeta.status, 200);
  assert.equal(dlMeta.data.sha256, '6C6B69CBB1E6234CD2A4A0F7FD53E2EF9E278255B8E951A0159841B1004C97CE');
  assert.equal(dlMeta.data.sizeBytes, 116955184);
  console.log('[PASS] 10. Desktop .EXE installer metadata & SHA-256 verified');

  // Cleanup temporary test user from Neon DB
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    await sql`DELETE FROM argon_users WHERE id = ${tempUserId}`;
    console.log(`[CLEANUP] Removed temporary test account ${tempUsername} from Neon DB`);
  }

  console.log('\nALL 10 END-TO-END LIVE NEON + MCP + SECURITY TESTS PASSED!');
}

async function startLocalServerIfNeeded() {
  if (process.env.TEST_BASE_URL) return null;
  const child = spawn(process.execPath, [path.join(rootDir, 'dev-api-server.mjs')], {
    cwd: rootDir,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Dev API server startup timeout')), 8000);
    child.stdout.on('data', chunk => {
      if (chunk.toString().includes('running on')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`Dev API server exited early with code ${code}`));
    });
  });
  return child;
}

let localServer = null;
try {
  localServer = await startLocalServerIfNeeded();
  await runTests();
} catch (err) {
  console.error('TEST FAILURE:', err);
  process.exitCode = 1;
} finally {
  if (localServer) localServer.kill();
}

