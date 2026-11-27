#!/usr/bin/env node
import readline from 'node:readline';

const MCP_URL = process.env.ARGON_MCP_URL || 'https://argon-multiagent-agency.vercel.app/mcp';
const MCP_KEY = process.env.ARGON_MCP_KEY || '';

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity
});

async function forwardMessage(line) {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  if (MCP_KEY) {
    headers['X-Argon-MCP-Key'] = MCP_KEY;
  }

  try {
    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(msg)
    });

    if (res.status === 202 || res.status === 204 || msg.id === undefined) {
      return;
    }

    const text = await res.text();
    if (text) {
      process.stdout.write(`${text.replace(/\r?\n/g, '')}\n`);
    }
  } catch (err) {
    if (msg.id !== undefined) {
      const errResp = {
        jsonrpc: '2.0',
        id: msg.id,
        error: {
          code: -32000,
          message: `Argon remote MCP unreachable: ${err.message}`
        }
      };
      process.stdout.write(`${JSON.stringify(errResp)}\n`);
    }
  }
}

rl.on('line', line => {
  forwardMessage(line);
});

