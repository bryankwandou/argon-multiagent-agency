import {
  INITIAL_AGENTS,
  INITIAL_WIRES,
  executeGeminiArgonMission,
  sanitizePromptInput,
  validateGeminiApiKey,
} from './geminiArgonEngine';

export async function runEngineVerificationSuite(): Promise<void> {
  // 1. Verify 10 specialized agents on floor
  if (INITIAL_AGENTS.length !== 10) {
    throw new Error(`Expected 10 floor agents, got ${INITIAL_AGENTS.length}`);
  }

  // 2. Verify initial 6 wires matching telemetry spec
  if (INITIAL_WIRES.length !== 6) {
    throw new Error(`Expected 6 initial wires, got ${INITIAL_WIRES.length}`);
  }

  // 3. Security check: XSS & control char sanitization
  const maliciousInput = '<script>alert("xss")</script>\u0000Build Zero-Trust API';
  const sanitized = sanitizePromptInput(maliciousInput);
  if (sanitized.includes('<script>') || sanitized.includes('\u0000')) {
    throw new Error('Sanitization failed to strip script or control characters');
  }

  // 4. API key validation check
  if (validateGeminiApiKey('invalid-key')) {
    throw new Error('Expected invalid API key to be rejected');
  }
  if (!validateGeminiApiKey('AIzaSyD1234567890abcdefghijklmnopqrstuvwx')) {
    throw new Error('Expected valid format Gemini key to pass format check');
  }

  // 5. Multi-agent mission decomposition & Council consensus verification
  const mission = await executeGeminiArgonMission({
    prompt: 'Architect a Zero-Trust payment gateway with OWASP verification',
    mode: 'GROK_COUNCIL',
    priority: 'P0',
    targetAgentId: 'ALL',
    locale: 'id',
    wireCounter: 1,
  });

  if (mission.newWires.length !== 3) {
    throw new Error(`Expected 3 decomposed DAG wires, got ${mission.newWires.length}`);
  }
  if (mission.councilVotes.length < 4) {
    throw new Error('Expected Grok Council votes to be populated');
  }
  if (!mission.artifact?.code || mission.artifact.code.length < 50) {
    throw new Error('Expected production code artifact to be generated');
  }

  // 6. Informational link query verification (clean response, zero mock wires/artifacts)
  const infoMission = await executeGeminiArgonMission({
    prompt: 'minta link vercel',
    mode: 'AUTO_DAG',
    priority: 'P1',
    targetAgentId: 'ALL',
    locale: 'id',
    wireCounter: 2,
  });

  if (infoMission.newWires.length !== 0) {
    throw new Error('Expected 0 wires for informational link query');
  }
  if (infoMission.artifact !== undefined) {
    throw new Error('Expected no code artifact for link query');
  }
  if (!infoMission.orchestratorSummary.includes('https://argon-multiagent-agency.vercel.app')) {
    throw new Error('Expected official Vercel URL in summary');
  }
}
