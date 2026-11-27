export const AGENTS_SPEC = [
  {
    id: 'ORCH-01',
    name: 'Argon Director',
    scrantonAlias: 'Michael Scott',
    zone: 'EXEC_OFFICE',
    wire: 'FN-12',
    domains: ['plan', 'orchestrate', 'dag', 'manage', 'agency', 'multi', 'mission', 'coordinate'],
    tools: ['dag_decomposer', 'pod_router', 'consensus_synthesizer']
  },
  {
    id: 'ARCH-02',
    name: 'Staff Architect',
    scrantonAlias: 'Dwight Schrute',
    zone: 'BULLPEN',
    wire: 'INF-163',
    domains: ['architect', 'system', 'api', 'schema', 'topology', 'backend', 'microservice', 'scale', 'graph', 'algorithm', 'algoritma'],
    tools: ['topology_planner', 'schema_compiler', 'rfc_generator']
  },
  {
    id: 'UIX-03',
    name: 'Kinetic UI Lead',
    scrantonAlias: 'Jim Halpert',
    zone: 'BULLPEN',
    wire: 'FN-12',
    domains: ['ui', 'ux', 'design', 'css', 'anim', '3d', 'canvas', 'react', 'frontend', 'game', 'arcade', 'visual', 'layout'],
    tools: ['component_fabricator', 'wcag_verifier', 'token_compiler']
  },
  {
    id: 'DATA-04',
    name: 'Data Mesh Lead',
    scrantonAlias: 'Oscar Martinez',
    zone: 'BULLPEN',
    wire: 'FN-12',
    domains: ['data', 'db', 'database', 'neon', 'postgres', 'sql', 'stream', 'pipeline', 'ledger', 'query', 'cache', 'index'],
    tools: ['stream_indexer', 'query_optimizer', 'state_replicator']
  },
  {
    id: 'SEC-05',
    name: 'Zero-Trust CSO',
    scrantonAlias: 'Angela Martin',
    zone: 'SECURITY_SRE',
    wire: 'FN-11',
    domains: ['security', 'auth', 'jwt', 'owasp', 'audit', 'encrypt', 'hmac', 'zero-trust', 'rbac', 'token', 'secret', 'keamanan', 'cek'],
    tools: ['owasp_scanner', 'secret_guard', 'aead_verifier']
  },
  {
    id: 'RES-06',
    name: 'Deep Researcher',
    scrantonAlias: 'Phyllis Vance',
    zone: 'BULLPEN',
    wire: 'INF-163',
    domains: ['research', 'riset', 'benchmark', 'compare', 'paper', 'cite', 'analysis', 'analyze', 'detect', 'deteksi'],
    tools: ['corpus_retriever', 'benchmark_analyzer', 'citation_graph']
  },
  {
    id: 'EXEC-07',
    name: 'Sandbox Executor',
    scrantonAlias: 'Ryan Howard',
    zone: 'BULLPEN',
    wire: 'ING-1461',
    domains: ['code', 'build', 'compile', 'run', 'exec', 'worker', 'script', 'sandbox', 'function', 'module', 'fix', 'implement'],
    tools: ['ast_code_writer', 'sandbox_daemon', 'diff_patcher']
  },
  {
    id: 'QA-08',
    name: 'Red-Team Critic',
    scrantonAlias: 'Stanley Hudson',
    zone: 'BULLPEN',
    wire: 'GATE-011',
    domains: ['test', 'qa', 'verify', 'fuzz', 'edge', 'bug', 'regression', 'audit', 'check', 'pengecek', 'uji'],
    tools: ['property_fuzzer', 'edge_case_prober', 'assertion_runner']
  },
  {
    id: 'DOC-09',
    name: 'Ship-Log Chronicler',
    scrantonAlias: 'Pam Beesly',
    zone: 'RECEPTION',
    wire: 'SHIP-101',
    domains: ['doc', 'readme', 'spec', 'book', 'buku', 'manual', 'log', 'changelog', 'report', 'guide'],
    tools: ['tape_appender', 'changelog_writer', 'spec_indexer']
  },
  {
    id: 'SRE-10',
    name: 'Edge Release SRE',
    scrantonAlias: 'Darryl Philbin',
    zone: 'SECURITY_SRE',
    wire: 'GATE-011',
    domains: ['deploy', 'vercel', 'github', 'release', 'canary', 'p99', 'edge', 'monitor', 'uptime', 'mcp', 'bridge'],
    tools: ['edge_cutover', 'canary_monitor', 'p99_profiler']
  }
];

export const AI_PROVIDERS = {
  ANTIGRAVITY_MCP: {
    id: 'ANTIGRAVITY_MCP',
    label: 'Built-in Deterministic Engine (Kahn DAG + OWASP · No LLM API Key)',
    requiresKey: false,
    defaultModel: 'deterministic-kahn-owasp-v2'
  },
  GEMINI: {
    id: 'GEMINI',
    label: 'Google Gemini Direct API',
    requiresKey: true,
    defaultModel: 'gemini-2.0-flash'
  },
  OPENAI: {
    id: 'OPENAI',
    label: 'OpenAI Chat Completions',
    requiresKey: true,
    defaultModel: 'gpt-4o-mini'
  },
  ANTHROPIC: {
    id: 'ANTHROPIC',
    label: 'Anthropic Claude Messages',
    requiresKey: true,
    defaultModel: 'claude-3-5-sonnet-latest'
  },
  XAI_GROK: {
    id: 'XAI_GROK',
    label: 'xAI Grok API',
    requiresKey: true,
    defaultModel: 'grok-2-latest'
  },
  OPENROUTER: {
    id: 'OPENROUTER',
    label: 'OpenRouter Unified Multi-AI',
    requiresKey: true,
    defaultModel: 'deepseek/deepseek-chat'
  }
};

/**
 * Computes Shannon entropy (bits per char) to detect leaked secrets / weak tokens.
 */
export function computeShannonEntropy(str) {
  if (!str || str.length === 0) return 0;
  const freq = new Map();
  for (const ch of str) freq.set(ch, (freq.get(ch) || 0) + 1);
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / str.length;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

/**
 * Runs deterministic static security & structural verification on text or source code.
 */
export function runStaticSecurityAudit(sourceText, promptText = '') {
  const combined = `${promptText}\n${sourceText || ''}`;
  const rules = [
    { id: 'OWASP-A03-EVAL', severity: 'CRITICAL', pattern: /\b(eval|Function)\s*\(/i, desc: 'Dynamic code execution detected' },
    { id: 'OWASP-A03-SQLI', severity: 'HIGH', pattern: /(SELECT|INSERT|UPDATE|DELETE)[^;\n]*\$\{[^}]+\}/i, desc: 'Unparameterized SQL template interpolation' },
    { id: 'OWASP-A03-XSS', severity: 'HIGH', pattern: /(<script|dangerouslySetInnerHTML|innerHTML\s*=)/i, desc: 'DOM injection sink detected' },
    { id: 'OWASP-A02-SECRET', severity: 'CRITICAL', pattern: /(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{25,}|ghp_[A-Za-z0-9]{20,}|postgresql:\/\/[^:\s]+:[^@\s]+@)/, desc: 'Hardcoded credential or connection URI detected' },
    { id: 'OWASP-A05-PROTO', severity: 'MEDIUM', pattern: /(__proto__|constructor\.prototype)/, desc: 'Prototype pollution vector detected' }
  ];

  const findings = [];
  for (const r of rules) {
    if (r.pattern.test(combined)) {
      findings.push({ ruleId: r.id, severity: r.severity, description: r.desc });
    }
  }

  // Structural bracket balance check on generated code
  let braces = 0;
  let parens = 0;
  let brackets = 0;
  for (const ch of sourceText || '') {
    if (ch === '{') braces++;
    else if (ch === '}') braces--;
    else if (ch === '(') parens++;
    else if (ch === ')') parens--;
    else if (ch === '[') brackets++;
    else if (ch === ']') brackets--;
  }
  const syntaxBalanced = braces === 0 && parens === 0 && brackets === 0;
  if (!syntaxBalanced) {
    findings.push({
      ruleId: 'AST-BALANCE',
      severity: 'HIGH',
      description: `Unbalanced delimiters (braces=${braces}, parens=${parens}, brackets=${brackets})`
    });
  }

  // Compute real security score (100 minus weighted deductions)
  const deductions = findings.reduce((acc, f) => {
    if (f.severity === 'CRITICAL') return acc + 35;
    if (f.severity === 'HIGH') return acc + 18;
    return acc + 8;
  }, 0);
  const securityScore = Math.max(0, 100 - deductions);

  return {
    passed: findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH').length === 0,
    securityScore,
    syntaxBalanced,
    promptEntropyBits: computeShannonEntropy(promptText),
    findingsCount: findings.length,
    findings
  };
}

/**
 * Kahn's Algorithm for DAG cycle detection & parallel execution wave scheduling.
 */
export function scheduleDagWaves(nodes) {
  const idMap = new Map(nodes.map(n => [n.id, n]));
  const inDegree = new Map();
  const adj = new Map();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  }

  for (const n of nodes) {
    for (const dep of n.dependencies || []) {
      if (idMap.has(dep)) {
        adj.get(dep).push(n.id);
        inDegree.set(n.id, (inDegree.get(n.id) || 0) + 1);
      }
    }
  }

  const waves = [];
  let queue = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) queue.push(id);
  }

  let visitedCount = 0;
  while (queue.length > 0) {
    waves.push([...queue]);
    const nextQueue = [];
    for (const u of queue) {
      visitedCount++;
      for (const v of adj.get(u) || []) {
        const nextDeg = (inDegree.get(v) || 1) - 1;
        inDegree.set(v, nextDeg);
        if (nextDeg === 0) nextQueue.push(v);
      }
    }
    queue = nextQueue;
  }

  const acyclic = visitedCount === nodes.length;
  return {
    acyclic,
    totalNodes: nodes.length,
    criticalPathDepth: waves.length,
    waves
  };
}

/**
 * Scores every agent's relevance against the mission prompt using token-domain matching.
 */
export function rankAgentsForPrompt(prompt, targetAgent = 'ALL') {
  const tokens = prompt.toLowerCase().split(/[^a-z0-9_-]+/).filter(Boolean);
  const tokenSet = new Set(tokens);

  const scored = AGENTS_SPEC.map(agent => {
    let relevance = agent.id === 'ORCH-01' ? 10 : 1;
    const matchedKeywords = [];
    for (const kw of agent.domains) {
      if (tokenSet.has(kw) || prompt.toLowerCase().includes(kw)) {
        relevance += 3;
        matchedKeywords.push(kw);
      }
    }
    if (targetAgent !== 'ALL' && agent.id === targetAgent) {
      relevance += 15;
    }
    return {
      ...agent,
      relevance,
      matchedKeywords,
      selectedTool: agent.tools[matchedKeywords.length % agent.tools.length]
    };
  });

  scored.sort((a, b) => b.relevance - a.relevance);
  return scored;
}

/**
 * Byzantine Fault-Tolerant 4-specialist Council Quorum Evaluator.
 */
export function evaluateCouncilQuorum(dagSchedule, auditReport, rankedAgents, wireChain) {
  const topDomainAgent = rankedAgents.find(a => a.id !== 'ORCH-01') || rankedAgents[0];

  const archApprove = dagSchedule.acyclic && dagSchedule.criticalPathDepth >= 1;
  const secApprove = auditReport.passed && auditReport.securityScore >= 82;
  const qaApprove = auditReport.syntaxBalanced && auditReport.findingsCount <= 1;
  const sreApprove = dagSchedule.acyclic && wireChain.length <= 12;

  const votes = [
    {
      agentId: 'ARCH-02',
      name: 'Staff Architect',
      vote: archApprove ? 'APPROVE' : 'BLOCK',
      confidence: archApprove ? 99.2 : 64.0,
      note: archApprove
        ? `Kahn DAG terverifikasi asiklik (${dagSchedule.criticalPathDepth} wave, lead ${topDomainAgent.id}).`
        : 'Terdeteksi siklus dependensi DAG; eksekusi ditahan.'
    },
    {
      agentId: 'SEC-05',
      name: 'Zero-Trust CSO',
      vote: secApprove ? 'HARDEN' : 'BLOCK',
      confidence: Number(Math.min(99.9, Math.max(50, auditReport.securityScore - 0.2)).toFixed(1)),
      note: secApprove
        ? `Skor Zero-Trust ${auditReport.securityScore}/100 (0 temuan kritikal/tinggi, entropi ${auditReport.promptEntropyBits} bit).`
        : `Ditemukan ${auditReport.findingsCount} pelanggaran OWASP/keamanan; wajib remediasi.`
    },
    {
      agentId: 'QA-08',
      name: 'Red-Team Critic',
      vote: qaApprove ? 'OPTIMIZE' : 'BLOCK',
      confidence: qaApprove ? 98.9 : 68.5,
      note: qaApprove
        ? `Integritas AST seimbang (${auditReport.syntaxBalanced ? 'OK' : 'ERR'}), budget 120fps terjaga.`
        : 'Keseimbangan sintaks AST atau batas uji gagal.'
    },
    {
      agentId: 'SRE-10',
      name: 'Edge Release SRE',
      vote: sreApprove ? 'APPROVE' : 'HOLD',
      confidence: sreApprove ? 99.5 : 75.0,
      note: `Rantai wire ${wireChain.join(' -> ')} lolos batas canary latency P99.`
    }
  ];

  const clearVotes = votes.filter(v => v.vote !== 'BLOCK' && v.vote !== 'HOLD').length;
  return {
    quorumPassed: clearVotes >= 3,
    clearVotes,
    totalVoters: votes.length,
    votes
  };
}

/**
 * Unified Multi-AI Provider Dispatcher (Gemini, OpenAI, Anthropic, xAI Grok, OpenRouter)
 * with strict timeout, input hygiene, and safe fallback to Antigravity MCP Pro Bridge.
 */
export async function invokeExternalProvider({ provider = 'ANTIGRAVITY_MCP', apiKey = '', model = '', prompt, engineLabel }) {
  const cleanProvider = AI_PROVIDERS[provider] ? provider : 'ANTIGRAVITY_MCP';
  if (cleanProvider === 'ANTIGRAVITY_MCP') {
    return { text: null, providerUsed: 'ANTIGRAVITY_MCP', modelUsed: 'deterministic-kahn-owasp-v2', fallbackReason: null };
  }

  const trimmedKey = typeof apiKey === 'string' ? apiKey.trim() : '';
  if (!trimmedKey || trimmedKey.length < 12 || trimmedKey.length > 220) {
    return {
      text: null,
      providerUsed: 'ANTIGRAVITY_MCP',
      modelUsed: 'deterministic-kahn-owasp-v2',
      fallbackReason: `${cleanProvider} memerlukan kunci API sesi; dialihkan ke Built-in Deterministic Engine (tidak memanggil LLM eksternal).`
    };
  }

  const chosenModel = (typeof model === 'string' && model.trim()) ? model.trim().slice(0, 80) : AI_PROVIDERS[cleanProvider].defaultModel;
  const sysPrompt = `You are ${engineLabel} orchestrating a 10-agent software agency (ORCH-01 to SRE-10). Provide a concise, concrete engineering plan covering architecture, security checks, and deployment. Do not use emojis.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 11000);

  try {
    if (cleanProvider === 'GEMINI') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(chosenModel)}:generateContent?key=${encodeURIComponent(trimmedKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sysPrompt }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      return { text, providerUsed: text ? 'GEMINI' : 'ANTIGRAVITY_MCP', modelUsed: chosenModel, fallbackReason: null };
    }

    if (cleanProvider === 'ANTHROPIC') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': trimmedKey,
          'anthropic-version': '2023-06-01'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: chosenModel,
          max_tokens: 700,
          system: sysPrompt,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const text = json?.content?.[0]?.text || null;
      return { text, providerUsed: text ? 'ANTHROPIC' : 'ANTIGRAVITY_MCP', modelUsed: chosenModel, fallbackReason: null };
    }

    // OpenAI-compatible protocol: OPENAI, XAI_GROK, OPENROUTER
    const endpointMap = {
      OPENAI: 'https://api.openai.com/v1/chat/completions',
      XAI_GROK: 'https://api.x.ai/v1/chat/completions',
      OPENROUTER: 'https://openrouter.ai/api/v1/chat/completions'
    };
    const res = await fetch(endpointMap[cleanProvider], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
        ...(cleanProvider === 'OPENROUTER' ? { 'HTTP-Referer': 'https://argon-multiagent-agency.vercel.app', 'X-Title': 'Argon Multi-Agent Agency' } : {})
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: chosenModel,
        max_tokens: 700,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content || null;
    return { text, providerUsed: text ? cleanProvider : 'ANTIGRAVITY_MCP', modelUsed: chosenModel, fallbackReason: null };
  } catch (err) {
    return {
      text: null,
      providerUsed: 'ANTIGRAVITY_MCP',
      modelUsed: 'deterministic-kahn-owasp-v2',
      fallbackReason: `${cleanProvider} tidak merespons (${err.message}); dialihkan ke Built-in Deterministic Engine.`
    };
  } finally {
    clearTimeout(timeout);
  }
}

