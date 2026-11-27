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

  // 9. Live Real-Time Multi-Agent Orchestration (Neon Hydrogen xHigh + Kahn DAG + Grok Quorum)
  const orch = await callJson('/api/agent/orchestrate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({
      prompt: 'Audit zero-trust payment API and build Cyber Packet Runner arcade sandbox',
      mode: 'GROK_COUNCIL',
      targetAgent: 'ALL',
      priority: 'P0',
      provider: 'ANTIGRAVITY_MCP',
      useNeonHydrogen: true
    })
  });
  assert.equal(orch.status, 200, 'Live orchestration must succeed');
  assert.equal(orch.data.newWires.length, 3, 'Must generate 3 chained AG-2xx DAG wires');
  assert.equal(orch.data.dagSchedule.acyclic, true, 'Kahn DAG scheduler must verify acyclicity');
  assert.equal(orch.data.dagSchedule.criticalPathDepth, 3, '3-stage wire chain must produce 3 execution waves');
  assert.equal(orch.data.auditReport.passed, true, 'Clean artifact must pass static security audit');
  assert.equal(orch.data.councilQuorum.passed, true, 'Byzantine quorum must pass for clean build');
  assert.equal(orch.data.councilVotes.length, 4, 'Must produce 4 Grok Council consensus votes');
  assert.ok(orch.data.artifact.filename.includes('RetroArcadeGame'), 'Must compile domain-aware artifact');
  assert.ok(orch.data.executionId > 0, 'Must persist execution log into Neon PostgreSQL');
  console.log(`[PASS] 9. Live Orchestration + Kahn DAG + Council Quorum verified (Exec #${orch.data.executionId}, ${orch.data.auditReport.securityScore}/100)`);

  // 10. Real Static Security Checker Attack Detection (must catch eval + SQLi + block SEC-05)
  const attackProbe = await callJson('/api/agent/orchestrate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({
      prompt: 'Audit unsafe legacy snippet',
      mode: 'GROK_COUNCIL',
      codeToAudit: 'function bad(x){ eval(x); const q = `SELECT * FROM users WHERE id=${x}`; }'
    })
  });
  assert.equal(attackProbe.status, 200);
  assert.equal(attackProbe.data.auditReport.passed, false, 'Static security checker MUST fail on eval + SQLi');
  assert.ok(attackProbe.data.auditReport.securityScore < 60, 'Security score MUST drop below 60 on critical findings');
  assert.equal(attackProbe.data.councilVotes.find(v => v.agentId === 'SEC-05')?.vote, 'BLOCK', 'SEC-05 MUST vote BLOCK on OWASP violation');
  console.log(`[PASS] 10. Real OWASP Static Checker blocked eval/SQLi payload (Score ${attackProbe.data.auditReport.securityScore}/100)`);

  // 11. Deep Self-Audit & Multi-AI Provider Verification via MCP Bridge
  const deepAudit = await callJson('/api/agent/mcp-bridge', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({ command: 'RUN_DEEP_AUDIT' })
  });
  assert.equal(deepAudit.status, 200);
  assert.equal(deepAudit.data.rpcResponse.diagnostics.securityScannerSelfTest, true);
  assert.equal(deepAudit.data.rpcResponse.diagnostics.kahnAcyclicSelfTest, true);
  assert.equal(deepAudit.data.rpcResponse.diagnostics.kahnCycleRejectionSelfTest, true);

  const provCheck = await callJson('/api/agent/mcp-bridge', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({ command: 'VERIFY_PROVIDERS' })
  });
  assert.equal(provCheck.status, 200);
  assert.ok(provCheck.data.rpcResponse.diagnostics.externalAdapters.length >= 6, 'Must expose 6 unified AI adapters');
  console.log('[PASS] 11. MCP RUN_DEEP_AUDIT (Kahn Cycle + OWASP Self-Test) & 6-Provider VERIFY_PROVIDERS verified');

  // 12. Graceful Multi-AI Fallback test (external provider with missing key falls back smoothly to Antigravity MCP)
  const fallbackRun = await callJson('/api/agent/orchestrate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({
      prompt: 'Verify seamless OpenAI -> Antigravity MCP fallback',
      provider: 'OPENAI',
      apiKey: ''
    })
  });
  assert.equal(fallbackRun.status, 200);
  assert.equal(fallbackRun.data.providerUsed, 'ANTIGRAVITY_MCP');
  assert.ok(fallbackRun.data.fallbackReason, 'Fallback reason must be reported transparently');
  console.log('[PASS] 12. Seamless Multi-AI fallback (OPENAI -> ANTIGRAVITY_MCP Pro Bridge) verified');

  // 13. Verify Desktop .EXE metadata endpoint & checksum
  const dlMeta = await callJson('/api/download/setup?meta=1');
  assert.equal(dlMeta.status, 200);
  assert.equal(dlMeta.data.sha256, '6C6B69CBB1E6234CD2A4A0F7FD53E2EF9E278255B8E951A0159841B1004C97CE');
  assert.equal(dlMeta.data.sizeBytes, 116955184);
  console.log('[PASS] 13. Desktop .EXE installer metadata & SHA-256 verified');

  // 14. Real MCP 2025-03-26 Streamable HTTP initialize + notifications/initialized
  const mcpInit = await callJson('/mcp', {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'verify-suite', version: '1.0' } }
    })
  });
  assert.equal(mcpInit.status, 200);
  assert.equal(mcpInit.data.result?.protocolVersion, '2025-03-26');
  assert.equal(mcpInit.data.result?.serverInfo?.name, 'argon-multiagent-agency');

  const mcpNotif = await callJson('/mcp', {
    method: 'POST',
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })
  });
  assert.equal(mcpNotif.status, 202, 'notifications/initialized must return HTTP 202');
  console.log('[PASS] 14. MCP 2025-03-26 initialize handshake & 202 notification verified on /mcp');

  // 15. Real MCP tools/list discovery
  const mcpTools = await callJson('/mcp', {
    method: 'POST',
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
  });
  assert.equal(mcpTools.status, 200);
  assert.equal(mcpTools.data.result?.tools?.length, 6, 'MCP server must advertise all 6 typed tools');
  console.log('[PASS] 15. MCP tools/list advertised all 6 typed tools');

  // 16. Real MCP tools/call (stateless OWASP + Kahn DAG cycle detection)
  const mcpAudit = await callJson('/mcp', {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name: 'argon_static_security_audit', arguments: { code: 'eval(x); const q = `SELECT * FROM t WHERE id=${x}`;' } }
    })
  });
  const parsedAudit = JSON.parse(mcpAudit.data.result.content[0].text);
  assert.equal(parsedAudit.report.passed, false, 'MCP OWASP audit tool must flag eval + SQLi');

  const mcpDag = await callJson('/mcp', {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: { name: 'argon_validate_dag', arguments: { nodes: [{ id: 'A', dependencies: ['B'] }, { id: 'B', dependencies: ['A'] }] } }
    })
  });
  const parsedDag = JSON.parse(mcpDag.data.result.content[0].text);
  assert.equal(parsedDag.schedule.acyclic, false, 'MCP Kahn DAG tool must detect cyclic graph');
  console.log('[PASS] 16. MCP tools/call (argon_static_security_audit + argon_validate_dag) verified');

  // 17. Real MCP tools/call auth enforcement + Neon persistence (argon_orchestrate_mission + argon_admin_list_users)
  const mcpUnauthAdmin = await callJson('/mcp', {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: { name: 'argon_admin_list_users', arguments: {} }
    })
  });
  assert.equal(mcpUnauthAdmin.data.result?.isError, true, 'Unauthenticated MCP admin call must be rejected');

  const mcpOrch = await callJson('/mcp', {
    method: 'POST',
    headers: { Authorization: `Bearer ${masterToken}` },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: { name: 'argon_orchestrate_mission', arguments: { prompt: 'MCP spec integration check', mode: 'AUTO_DAG' } }
    })
  });
  assert.equal(mcpOrch.data.result?.isError, false);
  const parsedMcpOrch = JSON.parse(mcpOrch.data.result.content[0].text);
  assert.ok(parsedMcpOrch.executionId > 0, 'MCP orchestrate tool must persist execution log in Neon');
  assert.equal(parsedMcpOrch.llmUsed, false, 'Deterministic engine must honestly report llmUsed=false');
  console.log(`[PASS] 17. Authenticated MCP tools/call persisted Exec #${parsedMcpOrch.executionId} to Neon & blocked unauth admin`);

  // Cleanup temporary test user from Neon DB
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    await sql`DELETE FROM argon_users WHERE id = ${tempUserId}`;
    console.log(`[CLEANUP] Removed temporary test account ${tempUsername} from Neon DB`);
  }

  console.log('\nALL 17 END-TO-END LIVE NEON + REAL MCP 2025-03-26 + KAHN DAG + OWASP + MULTI-AI TESTS PASSED!');
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

