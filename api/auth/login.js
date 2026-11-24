import bcrypt from 'bcryptjs';
import { getSql, signToken, setSecurityHeaders, checkRateLimit, sanitizeText } from '../_db.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkRateLimit(req, 'login', 20, 60000)) {
    return res.status(429).json({ error: 'Terlalu banyak percobaan login. Tunggu 1 menit.' });
  }

  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const cleanUser = sanitizeText(username, 40);
    if (!cleanUser || !password || password.length > 128) {
      return res.status(400).json({ error: 'Username dan password tidak valid.' });
    }

    const sql = getSql();
    const rows = await sql`
      SELECT id, username, password_hash, email, role, status, created_at, approved_by
      FROM argon_users
      WHERE LOWER(username) = LOWER(${cleanUser})
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password tidak valid.' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Username atau password tidak valid.' });
    }

    if (user.status !== 'APPROVED') {
      const msg = user.status === 'REJECTED'
        ? 'Permintaan akun ini telah ditolak oleh Master Account.'
        : 'Akun Anda berstatus PENDING_APPROVAL. Menunggu persetujuan Master Account (nayrbryanGaming).';
      return res.status(403).json({ error: msg, status: user.status });
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        approved_by: user.approved_by,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Terjadi gangguan koneksi ke Neon PostgreSQL.' });
  }
}
