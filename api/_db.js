import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const rateBuckets = new Map();

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL configuration missing on server');
  }
  return neon(url);
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET configuration missing or weak on server');
  }
  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { algorithm: 'HS256', expiresIn: '24h' });
}

export function verifyTokenOnly(req) {
  const auth = req.headers?.authorization || req.headers?.Authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

export async function verifyLiveUser(req, { requireAdmin = false } = {}) {
  const decoded = verifyTokenOnly(req);
  if (!decoded || !decoded.id) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT id, username, email, role, status
    FROM argon_users
    WHERE id = ${decoded.id}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const user = rows[0];
  if (user.status !== 'APPROVED') return null;
  if (requireAdmin && user.role !== 'MASTER_ADMIN') return null;
  return user;
}

export function checkRateLimit(req, bucketName, maxRequests = 25, windowMs = 60000) {
  const fwd = req.headers?.['x-forwarded-for'] || '';
  const ip = (Array.isArray(fwd) ? fwd[0] : String(fwd)).split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  const key = `${bucketName}:${ip}`;
  const now = Date.now();
  const entry = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  rateBuckets.set(key, entry);
  return entry.count <= maxRequests;
}

export function sanitizeText(input, maxLen = 4000) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<\/?script[^>]*>/gi, '')
    .trim()
    .slice(0, maxLen);
}

export function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
}
