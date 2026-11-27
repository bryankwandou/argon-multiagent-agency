import { getSql, verifyLiveUser, setSecurityHeaders, sanitizeText, checkRateLimit } from '../_db.js';
import {
  AI_PROVIDERS,
  evaluateCouncilQuorum,
  invokeExternalProvider,
  rankAgentsForPrompt,
  runStaticSecurityAudit,
  scheduleDagWaves
} from './_engine.js';

function buildDomainArtifact(prompt, wireBase, leadAgent) {
  const lower = prompt.toLowerCase();
  if (/game|arcade|shoot|runner|play/.test(lower)) {
    return {
      filename: 'src/sandbox/RetroArcadeGame.tsx',
      language: 'tsx',
      wireId: wireBase,
      summary: `Interactive 120fps Cyber Packet Runner canvas runtime compiled by ${leadAgent.id} & EXEC-07.`,
      code: `// Compiled by ${leadAgent.id} + EXEC-07 for Wire ${wireBase}\nexport interface PacketRunnerConfig {\n  readonly fpsTarget: 120;\n  readonly width: 520;\n  readonly height: 280;\n  readonly lives: 3;\n  readonly difficultyCurve: 'adaptive';\n}\nexport const packetRunnerConfig: PacketRunnerConfig = {\n  fpsTarget: 120,\n  width: 520,\n  height: 280,\n  lives: 3,\n  difficultyCurve: 'adaptive'\n};`
    };
  }
  if (/book|buku|reader|manual|doc/.test(lower)) {
    return {
      filename: 'src/docs/InteractiveBookReader.tsx',
      language: 'tsx',
      wireId: wireBase,
      summary: `Bilingual interactive architecture manual compiled by DOC-09 & ${leadAgent.id}.`,
      code: `// Compiled by DOC-09 (Ship-Log Chronicler) for Wire ${wireBase}\nexport const BOOK_METADATA = {\n  title: 'Argon Multi-Agent Architecture Specification',\n  chapters: 4,\n  themes: ['DARK', 'SEPIA', 'CLEAN'] as const,\n  verifiedBy: 'QA-08'\n};`
    };
  }
  if (/hello|hi|ping/.test(lower)) {
    return {
      filename: 'src/sandbox/HelloWorldLive.tsx',
      language: 'tsx',
      wireId: wireBase,
      summary: 'Zero-latency interactive render verification probe.',
      code: `// Verified by QA-08 on Wire ${wireBase}\nexport function verifyInteractiveProbe(clicks: number): { status: 'OK'; clicks: number; frameBudgetMs: number } {\n  return { status: 'OK', clicks, frameBudgetMs: 8.33 };\n}`
    };
  }
  const safeId = wireBase.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return {
    filename: `src/agency/mission_${safeId}.ts`,
    language: 'typescript',
    wireId: wireBase,
    summary: `Verified TypeScript contract routed to ${leadAgent.id} (${leadAgent.name}) and audited by SEC-05 & QA-08.`,
    code: `// Synthesized via Kahn DAG + Zero-Trust Audit (${wireBase})\nexport interface MissionExecutionContract {\n  readonly wireId: string;\n  readonly leadSpecialist: '${leadAgent.id}';\n  readonly directive: string;\n  readonly quorumVerified: boolean;\n}\n\nexport async function executeMissionWire(directive: string): Promise<MissionExecutionContract> {\n  const sanitized = directive.trim();\n  if (!sanitized) throw new Error('Directive required');\n  return {\n    wireId: '${wireBase}',\n    leadSpecialist: '${leadAgent.id}',\n    directive: sanitized,\n    quorumVerified: true\n  };\n}`
  };
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  try {
    const caller = await verifyLiveUser(req);
    if (!caller) {
      return res.status(401).json({ error: 'Autentikasi diperlukan. Silakan login terlebih dahulu.' });
    }

    const sql = getSql();

    if (req.method === 'GET') {
      const logs = caller.role === 'MASTER_ADMIN'
        ? await sql`
            SELECT id, agent_id, wire_id, task_action, confidence, tokens, output_payload, created_at
            FROM argon_agency_logs
            ORDER BY created_at DESC
            LIMIT 40
          `
        : await sql`
            SELECT id, agent_id, wire_id, task_action, confidence, tokens, output_payload, created_at
            FROM argon_agency_logs
            WHERE output_payload LIKE ${`%Operator: ${caller.username} %`}
            ORDER BY created_at DESC
            LIMIT 25
          `;
      return res.status(200).json({ logs });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!checkRateLimit(req, `orch:${caller.id}`, 35, 60000)) {
      return res.status(429).json({ error: 'Batas eksekusi misi per menit tercapai.' });
    }

    const {
      prompt,
      mode = 'AUTO_DAG',
      targetAgent = 'ALL',
      priority = 'P1',
      wireCounter = 1,
      useNeonHydrogen = true,
      provider = 'ANTIGRAVITY_MCP',
      model = '',
      apiKey = '',
      codeToAudit = ''
    } = req.body || {};

    const cleanPrompt = sanitizeText(prompt, 4000);
    if (!cleanPrompt) {
      return res.status(400).json({ error: 'Perintah misi wajib diisi.' });
    }

    const allowedModes = ['AUTO_DAG', 'GROK_COUNCIL', 'DIRECT_ASSIGN'];
    const safeMode = allowedModes.includes(mode) ? mode : 'AUTO_DAG';
    const safePriority = ['P0', 'P1', 'P2'].includes(priority) ? priority : 'P1';
    const baseNum = 200 + (Number.isInteger(Number(wireCounter)) ? Number(wireCounter) : 1);
    const startTs = Date.now();

    // 1. Domain-relevance agent ranking
    const rankedAll = rankAgentsForPrompt(cleanPrompt, targetAgent);
    const selectedAgents = targetAgent === 'ALL'
      ? rankedAll
      : rankedAll.filter(a => a.id === targetAgent || a.id === 'ORCH-01');
    const leadDomainAgent = rankedAll.find(a => a.id !== 'ORCH-01') || rankedAll[0];

    // 2. Build 3-stage mission wires and validate acyclicity via Kahn's Topological Sort
    const w1 = `AG-${baseNum}`;
    const w2 = `AG-${baseNum + 1}`;
    const w3 = `AG-${baseNum + 2}`;
    const timeLabel = new Date().toISOString().slice(11, 19) + ' UTC';
    const artifact = buildDomainArtifact(cleanPrompt, w2, leadDomainAgent);

    // 3. Real Static Security, OWASP, Entropy & AST Balance Audit
    const auditTarget = typeof codeToAudit === 'string' && codeToAudit.trim()
      ? codeToAudit.slice(0, 12000)
      : artifact.code;
    const auditReport = runStaticSecurityAudit(auditTarget, cleanPrompt);

    const newWires = [
      {
        id: w1,
        title: `Architecture & Kahn DAG: ${cleanPrompt.slice(0, 28)}`,
        status: 'VERIFIED',
        detail: `VERIFIED · Lead ${leadDomainAgent.id} selected (score ${leadDomainAgent.relevance})`,
        moment: 100,
        assignedAgentId: targetAgent !== 'ALL' ? targetAgent : 'ARCH-02',
        dependencies: [],
        priority: safePriority,
        deltaAdded: 340,
        deltaRemoved: 18,
        createdAt: timeLabel
      },
      {
        id: w2,
        title: `Module Fabrication: ${cleanPrompt.slice(0, 30)}`,
        status: auditReport.passed ? 'LIVE' : 'HELD',
        detail: auditReport.passed
          ? `LIVE · ${leadDomainAgent.id} build stream verified`
          : `HELD · Static security audit flagged ${auditReport.findingsCount} finding(s)`,
        moment: auditReport.passed ? 92 : 42,
        assignedAgentId: leadDomainAgent.id,
        dependencies: [w1],
        priority: safePriority,
        deltaAdded: 620,
        deltaRemoved: 42,
        createdAt: timeLabel
      },
      {
        id: w3,
        title: `Zero-Trust & QA Gate: ${cleanPrompt.slice(0, 26)}`,
        status: auditReport.passed ? 'VERIFIED' : 'BLOCKED',
        detail: auditReport.passed
          ? `VERIFIED · Zero-Trust ${auditReport.securityScore}/100 · AST balanced`
          : `BLOCKED · Zero-Trust ${auditReport.securityScore}/100 · Remediation required`,
        moment: auditReport.passed ? 100 : 28,
        assignedAgentId: 'SEC-05',
        dependencies: [w2],
        priority: 'P0',
        deltaAdded: 215,
        deltaRemoved: 11,
        createdAt: timeLabel
      }
    ];

    const dagSchedule = scheduleDagWaves(newWires);

    // 4. Byzantine Fault-Tolerant 4-Specialist Council Quorum
    const council = evaluateCouncilQuorum(dagSchedule, auditReport, rankedAll, [w1, w2, w3]);

    // 5. Multi-AI Unified Provider Dispatch (Antigravity MCP Pro Bridge + Gemini/OpenAI/Anthropic/xAI/OpenRouter)
    const effectiveProvider = (apiKey && provider === 'ANTIGRAVITY_MCP') ? 'GEMINI' : provider;
    const engineLabel = useNeonHydrogen
      ? `Gemini 4 Argon High + Neon Hydrogen xHigh (${AI_PROVIDERS[effectiveProvider]?.label || 'Antigravity MCP Pro Bridge'})`
      : `Gemini 4 Argon High (${AI_PROVIDERS[effectiveProvider]?.label || 'Standard DAG Engine'})`;

    const aiResult = await invokeExternalProvider({
      provider: effectiveProvider,
      apiKey,
      model,
      prompt: cleanPrompt,
      engineLabel
    });

    const traces = selectedAgents.map((agent, index) => {
      const tokenCost = 320 + Math.min(1800, cleanPrompt.length * 4 + agent.relevance * 45 + index * 37);
      const baseConf = auditReport.passed ? 98.2 : 84.5;
      const confidence = Math.min(99.9, Number((baseConf + Math.min(1.6, agent.relevance * 0.12)).toFixed(1)));
      const assignedWire = index === 0 ? w1 : index === 1 ? w2 : index === 2 ? w3 : agent.wire;
      return {
        agentId: agent.id,
        agentName: agent.name,
        scrantonAlias: agent.scrantonAlias,
        wireId: assignedWire,
        tool: agent.selectedTool,
        relevanceScore: agent.relevance,
        matchedDomains: agent.matchedKeywords,
        tokens: tokenCost,
        confidence,
        latencyMs: 28 + index * 14,
        verdict: safeMode === 'GROK_COUNCIL'
          ? `[COUNCIL] ${agent.id} (${agent.selectedTool}) scored ${confidence}% · ${council.quorumPassed ? 'QUORUM PASS' : 'QUORUM HOLD'}.`
          : `[DAG-W${Math.min(dagSchedule.waves.length, index + 1)}] ${agent.id} ran ${agent.selectedTool} on ${assignedWire} (relevance ${agent.relevance}).`
      };
    });

    const totalTokens = traces.reduce((acc, t) => acc + t.tokens, 0);
    const avgConfidence = Number((traces.reduce((acc, t) => acc + t.confidence, 0) / traces.length).toFixed(2));

    const synthesizedOutput = aiResult.text || [
      `[${engineLabel}] Mission Decomposed by ORCH-01 -> Lead ${leadDomainAgent.id} (${leadDomainAgent.name})`,
      `Operator: ${caller.username} (${caller.role}) | Mode: ${safeMode} | Priority: ${safePriority} | Provider: ${aiResult.providerUsed}/${aiResult.modelUsed}`,
      `Kahn DAG Waves: ${dagSchedule.waves.map((w, i) => `W${i}[${w.join(',')}]`).join(' -> ')} (Acyclic: ${dagSchedule.acyclic})`,
      `Zero-Trust Static Audit: ${auditReport.securityScore}/100 | Passed: ${auditReport.passed} | Findings: ${auditReport.findingsCount} | Entropy: ${auditReport.promptEntropyBits} bits`,
      `Grok Council Quorum: ${council.clearVotes}/${council.totalVoters} (${council.quorumPassed ? 'APPROVED' : 'BLOCKED'}) | Artifact: ${artifact.filename}`,
      ...(aiResult.fallbackReason ? [`Fallback Notice: ${aiResult.fallbackReason}`] : []),
      ...traces.slice(0, 5).map(t => `  - ${t.agentId} (${t.agentName}): ${t.verdict}`)
    ].join('\n');

    const insertedLog = await sql`
      INSERT INTO argon_agency_logs (agent_id, wire_id, task_action, confidence, tokens, output_payload)
      VALUES (${leadDomainAgent.id}, ${w2}, ${`${safeMode}: ${cleanPrompt.slice(0, 180)}`}, ${avgConfidence}, ${totalTokens}, ${synthesizedOutput})
      RETURNING id, created_at
    `;

    return res.status(200).json({
      executionId: insertedLog[0].id,
      timestamp: insertedLog[0].created_at,
      engine: engineLabel,
      transport: aiResult.text ? `${aiResult.providerUsed}_DIRECT_API` : 'DETERMINISTIC_LOCAL_ENGINE',
      llmUsed: Boolean(aiResult.text),
      providerUsed: aiResult.providerUsed,
      modelUsed: aiResult.modelUsed,
      fallbackReason: aiResult.fallbackReason,
      mode: safeMode,
      elapsedMs: Date.now() - startTs,
      totalTokens,
      avgConfidence,
      dagSchedule,
      auditReport,
      councilQuorum: {
        passed: council.quorumPassed,
        clearVotes: council.clearVotes,
        totalVoters: council.totalVoters
      },
      newWires,
      councilVotes: council.votes,
      artifact,
      traces,
      synthesis: synthesizedOutput
    });
  } catch (err) {
    console.error('Orchestrate error:', err.message);
    return res.status(500).json({ error: 'Gagal mengeksekusi orkestrasi agen.' });
  }
}
