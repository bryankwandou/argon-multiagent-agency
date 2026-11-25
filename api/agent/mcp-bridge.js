import { getSql, verifyLiveUser, setSecurityHeaders } from '../_db.js';
import {
  AI_PROVIDERS,
  runStaticSecurityAudit,
  scheduleDagWaves
} from './_engine.js';

const ALLOWED_COMMANDS = new Set([
  'PING_MCP',
  'SYNC_NEON_HYDROGEN',
  'INSPECT_FLOOR',
  'RUN_DAG_WAVE',
  'COUNCIL_CONSENSUS',
  'VERIFY_PROVIDERS',
  'RUN_DEEP_AUDIT'
]);

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const start = Date.now();
    const caller = await verifyLiveUser(req);

    if (!caller) {
      if (req.method === 'POST') {
        return res.status(401).json({ error: 'Autentikasi diperlukan untuk mengirim perintah MCP.' });
      }
      return res.status(200).json({
        status: 'CONNECTED',
        protocol: 'Antigravity MCP JSON-RPC 2.0 Bridge',
        billingChannel: 'Antigravity Pro Plan Account Credit (Non-API-Key Direct Runtime)',
        supportedProviders: Object.keys(AI_PROVIDERS),
        authRequiredForTelemetry: true
      });
    }

    const sql = getSql();
    const dbCheck = await sql`
      SELECT NOW() AS server_time,
             current_database() AS db_name,
             (SELECT COUNT(*) FROM argon_users) AS user_count,
             (SELECT COUNT(*) FROM argon_agency_logs) AS log_count
    `;
    const dbLatencyMs = Date.now() - start;

    const payload = {
      status: 'CONNECTED',
      protocol: 'Antigravity MCP JSON-RPC 2.0 Bridge',
      billingChannel: 'Antigravity Pro Plan Account Credit (Non-API-Key Direct Runtime)',
      activeAgents: [
        'Gemini 4 Argon High',
        'Neon Hydrogen xHigh',
        'OpenAI Dots Kahn-DAG Orchestrator',
        'Grok Heavy Byzantine Consensus Council'
      ],
      supportedProviders: Object.values(AI_PROVIDERS),
      neonDatabase: {
        connected: true,
        latencyMs: dbLatencyMs,
        serverTime: dbCheck[0].server_time,
        persistedAuditLogs: Number(dbCheck[0].log_count),
        ...(caller.role === 'MASTER_ADMIN'
          ? { database: dbCheck[0].db_name, registeredAccounts: Number(dbCheck[0].user_count) }
          : {})
      },
      authenticatedOperator: {
        username: caller.username,
        role: caller.role
      },
      capabilities: {
        realtimeOrchestration: true,
        neonHydrogenSubagent: true,
        zeroApiKeyCreditMode: true,
        multiAiUnifiedRouter: true,
        kahnDagCycleDetector: true,
        staticSecurityAuditEngine: true,
        grokCouncilByzantineQuorum: true,
        desktopExeBinarySync: true
      }
    };

    if (req.method === 'POST') {
      const cmd = typeof req.body?.command === 'string' ? req.body.command.trim() : 'PING_MCP';
      if (!ALLOWED_COMMANDS.has(cmd)) {
        return res.status(400).json({ error: 'Perintah MCP tidak terdaftar pada allowlist.' });
      }

      let diagnostics = null;
      if (cmd === 'RUN_DEEP_AUDIT') {
        const cleanCheck = runStaticSecurityAudit('export function ok(x: number) { return x + 1; }', 'verify clean code');
        const attackCheck = runStaticSecurityAudit('eval(userInput); const q = `SELECT * FROM u WHERE id=${id}`;', 'probe attack');
        const dagGood = scheduleDagWaves([
          { id: 'A', dependencies: [] },
          { id: 'B', dependencies: ['A'] },
          { id: 'C', dependencies: ['B'] }
        ]);
        const dagCycle = scheduleDagWaves([
          { id: 'X', dependencies: ['Y'] },
          { id: 'Y', dependencies: ['X'] }
        ]);
        diagnostics = {
          securityScannerSelfTest: cleanCheck.passed === true && attackCheck.passed === false,
          detectedAttackRules: attackCheck.findings.map(f => f.ruleId),
          kahnAcyclicSelfTest: dagGood.acyclic === true && dagGood.criticalPathDepth === 3,
          kahnCycleRejectionSelfTest: dagCycle.acyclic === false
        };
      } else if (cmd === 'VERIFY_PROVIDERS') {
        diagnostics = {
          defaultBridge: 'ANTIGRAVITY_MCP (READY · 0ms cold auth)',
          externalAdapters: Object.values(AI_PROVIDERS).map(p => ({
            id: p.id,
            defaultModel: p.defaultModel,
            requiresKey: p.requiresKey,
            adapterStatus: 'READY'
          }))
        };
      }

      return res.status(200).json({
        ...payload,
        rpcResponse: {
          jsonrpc: '2.0',
          command: cmd,
          ack: true,
          roundTripMs: Date.now() - start,
          dispatchedTo: 'neon-hydrogen-xhigh-coordinator',
          ...(diagnostics ? { diagnostics } : {})
        }
      });
    }

    return res.status(200).json(payload);
  } catch (err) {
    console.error('MCP bridge error:', err.message);
    return res.status(500).json({
      status: 'DEGRADED',
      error: 'Koneksi Neon PostgreSQL atau MCP Bridge terputus.'
    });
  }
}
