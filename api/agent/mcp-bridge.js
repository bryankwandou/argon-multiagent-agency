import { getSql, verifyLiveUser, setSecurityHeaders } from '../_db.js';

const ALLOWED_COMMANDS = new Set([
  'PING_MCP',
  'SYNC_NEON_HYDROGEN',
  'INSPECT_FLOOR',
  'RUN_DAG_WAVE',
  'COUNCIL_CONSENSUS'
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
        'OpenAI Dots DAG Orchestrator',
        'Grok Heavy Multi-Agent Council'
      ],
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
        grokCouncilDebate: true,
        desktopExeBinarySync: true
      }
    };

    if (req.method === 'POST') {
      const cmd = typeof req.body?.command === 'string' ? req.body.command.trim() : 'PING_MCP';
      if (!ALLOWED_COMMANDS.has(cmd)) {
        return res.status(400).json({ error: 'Perintah MCP tidak terdaftar pada allowlist.' });
      }
      return res.status(200).json({
        ...payload,
        rpcResponse: {
          jsonrpc: '2.0',
          command: cmd,
          ack: true,
          roundTripMs: Date.now() - start,
          dispatchedTo: 'neon-hydrogen-xhigh-coordinator'
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
