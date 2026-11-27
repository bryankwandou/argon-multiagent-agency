import crypto from 'node:crypto';
import { getSql, verifyLiveUser, setSecurityHeaders, sanitizeText, checkRateLimit } from './_db.js';
import {
  evaluateCouncilQuorum,
  rankAgentsForPrompt,
  runStaticSecurityAudit,
  scheduleDagWaves
} from './agent/_engine.js';

const PROTOCOL_VERSION = '2025-03-26';
const SERVER_INFO = {
  name: 'argon-multiagent-agency',
  version: '2.1.0'
};

const TOOLS = [
  {
    name: 'argon_static_security_audit',
    description: 'Run deterministic OWASP static security scan (eval, SQLi, XSS, hardcoded secrets, prototype pollution), Shannon entropy calculation, and AST delimiter balance verification on source code.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code or snippet to audit (max 12000 chars)' },
        context: { type: 'string', description: 'Optional mission context or prompt text' }
      },
      required: ['code']
    }
  },
  {
    name: 'argon_validate_dag',
    description: 'Validate a task dependency graph using Kahn topological sort to detect cycles and compute parallel execution waves.',
    inputSchema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          description: 'List of DAG nodes with id and dependencies array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              dependencies: { type: 'array', items: { type: 'string' } }
            },
            required: ['id']
          }
        }
      },
      required: ['nodes']
    }
  },
  {
    name: 'argon_orchestrate_mission',
    description: 'Schedule a mission across the 10 Argon floor specialists (Kahn DAG + domain relevance ranking + OWASP audit + Byzantine 3/4 council quorum) and persist the audit record into Neon PostgreSQL. Requires authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Mission directive to decompose and audit' },
        mode: { type: 'string', enum: ['AUTO_DAG', 'GROK_COUNCIL', 'DIRECT_ASSIGN'], default: 'AUTO_DAG' },
        priority: { type: 'string', enum: ['P0', 'P1', 'P2'], default: 'P1' },
        codeToAudit: { type: 'string', description: 'Optional source code to audit during mission execution' }
      },
      required: ['prompt']
    }
  },
  {
    name: 'argon_neon_audit_logs',
    description: 'Query recent verified agency execution audit logs persisted in Neon PostgreSQL. Requires authentication.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
      }
    }
  },
  {
    name: 'argon_admin_list_users',
    description: 'List registered Neon PostgreSQL accounts and PENDING_APPROVAL requests. Restricted to Master Admin.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'argon_admin_decide_user',
    description: 'Approve or reject a PENDING_APPROVAL user account in Neon PostgreSQL. Restricted to Master Admin.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'integer', description: 'Numeric user ID in argon_users' },
        action: { type: 'string', enum: ['APPROVE', 'REJECT'] }
      },
      required: ['userId', 'action']
    }
  }
];

function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function resolveMcpCaller(req) {
  const configuredKey = process.env.ARGON_MCP_KEY || '';
  const headerKey =
    req.headers?.['x-argon-mcp-key'] ||
    (typeof req.headers?.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice(7).trim()
      : '');

  if (configuredKey && configuredKey.length >= 24 && constantTimeEquals(headerKey, configuredKey)) {
    return { id: 0, username: 'nayrbryanGaming', role: 'MASTER_ADMIN', status: 'APPROVED', via: 'MCP_KEY' };
  }

  const liveUser = await verifyLiveUser(req);
  if (liveUser) return { ...liveUser, via: 'JWT' };
  return null;
}

function rpcOk(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function rpcError(id, code, message, data) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message, ...(data !== undefined ? { data } : {}) } };
}

function toolResult(payload, isError = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    isError
  };
}

async function executeTool(name, args, caller) {
  if (name === 'argon_static_security_audit') {
    const code = typeof args?.code === 'string' ? args.code.slice(0, 12000) : '';
    const context = sanitizeText(args?.context || '', 2000);
    if (!code) return toolResult({ error: 'Parameter "code" (non-empty string) is required.' }, true);
    const report = runStaticSecurityAudit(code, context);
    return toolResult({ tool: name, engine: 'deterministic-static-checker', report });
  }

  if (name === 'argon_validate_dag') {
    const rawNodes = Array.isArray(args?.nodes) ? args.nodes.slice(0, 64) : null;
    if (!rawNodes || rawNodes.length === 0) {
      return toolResult({ error: 'Parameter "nodes" (non-empty array) is required.' }, true);
    }
    const cleanNodes = rawNodes.map((n, idx) => ({
      id: sanitizeText(String(n?.id || `NODE-${idx}`), 40),
      dependencies: Array.isArray(n?.dependencies) ? n.dependencies.map(d => sanitizeText(String(d), 40)) : []
    }));
    const schedule = scheduleDagWaves(cleanNodes);
    return toolResult({ tool: name, engine: 'kahn-topological-sort', schedule });
  }

  // Authenticated Neon-backed tools
  if (!caller) {
    return toolResult({ error: 'Authentication required. Supply Authorization: Bearer <jwt> or X-Argon-MCP-Key header.' }, true);
  }

  const sql = getSql();

  if (name === 'argon_neon_audit_logs') {
    const limit = Math.max(1, Math.min(50, Number(args?.limit) || 10));
    const logs = caller.role === 'MASTER_ADMIN'
      ? await sql`
          SELECT id, agent_id, wire_id, task_action, confidence, tokens, created_at
          FROM argon_agency_logs
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT id, agent_id, wire_id, task_action, confidence, tokens, created_at
          FROM argon_agency_logs
          WHERE output_payload LIKE ${`%Operator: ${caller.username} %`}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;
    return toolResult({ tool: name, count: logs.length, operator: caller.username, logs });
  }

  if (name === 'argon_orchestrate_mission') {
    const prompt = sanitizeText(args?.prompt || '', 4000);
    if (!prompt) return toolResult({ error: 'Parameter "prompt" is required.' }, true);
    const mode = ['AUTO_DAG', 'GROK_COUNCIL', 'DIRECT_ASSIGN'].includes(args?.mode) ? args.mode : 'AUTO_DAG';
    const priority = ['P0', 'P1', 'P2'].includes(args?.priority) ? args.priority : 'P1';

    const ranked = rankAgentsForPrompt(prompt, 'ALL');
    const lead = ranked.find(a => a.id !== 'ORCH-01') || ranked[0];
    const base = 300 + (Date.now() % 600);
    const w1 = `MCP-${base}`;
    const w2 = `MCP-${base + 1}`;
    const w3 = `MCP-${base + 2}`;

    const codeToAudit = typeof args?.codeToAudit === 'string' && args.codeToAudit.trim()
      ? args.codeToAudit.slice(0, 12000)
      : `export function missionContract(directive: string): { wire: string; ok: boolean } { return { wire: '${w2}', ok: directive.length > 0 }; }`;
    const auditReport = runStaticSecurityAudit(codeToAudit, prompt);

    const wires = [
      { id: w1, assignedAgentId: 'ARCH-02', dependencies: [] },
      { id: w2, assignedAgentId: lead.id, dependencies: [w1] },
      { id: w3, assignedAgentId: 'SEC-05', dependencies: [w2] }
    ];
    const dagSchedule = scheduleDagWaves(wires);
    const council = evaluateCouncilQuorum(dagSchedule, auditReport, ranked, [w1, w2, w3]);

    const summary = [
      `[MCP-TOOL · Deterministic Engine] Lead: ${lead.id} (${lead.name}) | Mode: ${mode} | Priority: ${priority}`,
      `Operator: ${caller.username} (${caller.role}) | Kahn DAG: ${dagSchedule.criticalPathDepth} waves (acyclic=${dagSchedule.acyclic})`,
      `Zero-Trust Score: ${auditReport.securityScore}/100 (findings=${auditReport.findingsCount}) | Quorum: ${council.clearVotes}/${council.totalVoters}`
    ].join('\n');

    const inserted = await sql`
      INSERT INTO argon_agency_logs (agent_id, wire_id, task_action, confidence, tokens, output_payload)
      VALUES (${lead.id}, ${w2}, ${`MCP_${mode}: ${prompt.slice(0, 170)}`}, ${auditReport.securityScore}, ${prompt.length * 4 + 420}, ${summary})
      RETURNING id, created_at
    `;

    return toolResult({
      tool: name,
      engine: 'built-in-deterministic-engine',
      llmUsed: false,
      executionId: inserted[0].id,
      createdAt: inserted[0].created_at,
      leadSpecialist: { id: lead.id, name: lead.name, relevance: lead.relevance, tool: lead.selectedTool },
      dagSchedule,
      auditReport,
      council
    });
  }

  // Master Admin-only tools
  if (caller.role !== 'MASTER_ADMIN') {
    return toolResult({ error: 'Forbidden. Master Admin authority (nayrbryanGaming) required.' }, true);
  }

  if (name === 'argon_admin_list_users') {
    const users = await sql`
      SELECT id, username, email, role, status, created_at, approved_by, approved_at
      FROM argon_users
      ORDER BY CASE status WHEN 'PENDING_APPROVAL' THEN 1 WHEN 'APPROVED' THEN 2 ELSE 3 END, created_at DESC
    `;
    return toolResult({
      tool: name,
      total: users.length,
      pendingCount: users.filter(u => u.status === 'PENDING_APPROVAL').length,
      users
    });
  }

  if (name === 'argon_admin_decide_user') {
    const userId = Number(args?.userId);
    const action = args?.action;
    if (!Number.isInteger(userId) || userId <= 0 || (action !== 'APPROVE' && action !== 'REJECT')) {
      return toolResult({ error: 'Valid integer userId and action (APPROVE | REJECT) are required.' }, true);
    }
    const target = await sql`SELECT username, role FROM argon_users WHERE id = ${userId} LIMIT 1`;
    if (target.length === 0) return toolResult({ error: 'User not found.' }, true);
    if (target[0].role === 'MASTER_ADMIN') return toolResult({ error: 'Master Admin status cannot be changed.' }, true);

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updated = await sql`
      UPDATE argon_users
      SET status = ${newStatus}, approved_by = ${caller.username}, approved_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING id, username, role, status, approved_by, approved_at
    `;
    return toolResult({ tool: name, updated: updated[0] });
  }

  return toolResult({ error: `Unknown tool: ${name}` }, true);
}

export default async function handler(req, res) {
  setSecurityHeaders(res);
  res.setHeader('MCP-Protocol-Version', PROTOCOL_VERSION);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      protocol: 'MCP Streamable HTTP',
      protocolVersion: PROTOCOL_VERSION,
      serverInfo: SERVER_INFO,
      endpoint: '/mcp',
      tools: TOOLS.map(t => t.name)
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json(rpcError(null, -32600, 'Method not allowed. Use POST for MCP JSON-RPC 2.0.'));
  }

  if (!checkRateLimit(req, 'mcp', 60, 60000)) {
    return res.status(429).json(rpcError(null, -32029, 'Rate limit exceeded.'));
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return res.status(400).json(rpcError(body?.id ?? null, -32600, 'Invalid JSON-RPC 2.0 request.'));
  }

  const { id, method, params } = body;

  // Notifications have no id and expect 202 Accepted
  if (method === 'notifications/initialized' || (id === undefined && method.startsWith('notifications/'))) {
    return res.status(202).end();
  }

  try {
    if (method === 'initialize') {
      return res.status(200).json(
        rpcOk(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false }
          },
          serverInfo: SERVER_INFO,
          instructions:
            'Argon Multi-Agent Agency MCP server exposing deterministic Kahn DAG validation, OWASP static security auditing, Neon PostgreSQL audit persistence, and Master Admin account governance.'
        })
      );
    }

    if (method === 'ping') {
      return res.status(200).json(rpcOk(id, {}));
    }

    if (method === 'tools/list') {
      return res.status(200).json(rpcOk(id, { tools: TOOLS }));
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      if (typeof toolName !== 'string' || !TOOLS.some(t => t.name === toolName)) {
        return res.status(200).json(rpcError(id, -32602, `Unknown tool: ${String(toolName)}`));
      }
      const caller = await resolveMcpCaller(req);
      const result = await executeTool(toolName, toolArgs, caller);
      return res.status(200).json(rpcOk(id, result));
    }

    return res.status(200).json(rpcError(id, -32601, `Method not found: ${method}`));
  } catch (err) {
    console.error('MCP handler error:', err.message);
    return res.status(500).json(rpcError(id, -32603, 'Internal MCP server error.'));
  }
}

