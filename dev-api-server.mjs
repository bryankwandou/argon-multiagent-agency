import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load local .env safely without external package
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  }
}

const ROUTES = {
  '/api/auth/login': () => import('./api/auth/login.js'),
  '/api/auth/register': () => import('./api/auth/register.js'),
  '/api/auth/users': () => import('./api/auth/users.js'),
  '/api/auth/approve': () => import('./api/auth/approve.js'),
  '/api/agent/orchestrate': () => import('./api/agent/orchestrate.js'),
  '/api/agent/mcp-bridge': () => import('./api/agent/mcp-bridge.js'),
  '/api/download/setup': () => import('./api/download/setup.js')
};

const PORT = Number(process.env.API_PORT || 3001);

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const loader = ROUTES[urlObj.pathname];
  if (!loader) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API route not found' }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');
  let parsedBody = {};
  if (rawBody) {
    try { parsedBody = JSON.parse(rawBody); } catch { parsedBody = {}; }
  }

  const reqCompat = {
    method: req.method,
    headers: req.headers,
    query: Object.fromEntries(urlObj.searchParams.entries()),
    body: parsedBody,
    socket: req.socket
  };

  let statusCode = 200;
  const headers = {};
  const resCompat = {
    setHeader(k, v) { headers[k] = v; },
    status(code) { statusCode = code; return this; },
    json(payload) {
      headers['Content-Type'] = 'application/json';
      res.writeHead(statusCode, headers);
      res.end(JSON.stringify(payload));
    },
    end(payload = '') {
      res.writeHead(statusCode, headers);
      res.end(payload);
    }
  };

  try {
    const mod = await loader();
    await mod.default(reqCompat, resCompat);
  } catch (err) {
    console.error('Dev API error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Argon local API server running on http://127.0.0.1:${PORT}`);
});

