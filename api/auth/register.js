import bcrypt from 'bcryptjs';
import { getSql, setSecurityHeaders, checkRateLimit, sanitizeText } from '../_db.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkRateLimit(req, 'register', 10, 60000)) {
    return res.status(429).json({ error: 'Batas registrasi tercapai. Coba lagi dalam 1 menit.' });
  }

  try {
    const { username, password, email } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Format input tidak valid.' });
    }

    const cleanUser = sanitizeText(username, 40);
    const cleanEmail = sanitizeText(email || '', 120);

    if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(cleanUser)) {
      return res.status(400).json({
        error: 'Username harus 3-40 karakter (huruf, angka, titik, underscore, atau strip).'
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ error: 'Password wajib minimal 8 karakter.' });
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }

    const sql = getSql();
    const existing = await sql`
      SELECT id FROM argon_users WHERE LOWER(username) = LOWER(${cleanUser}) LIMIT 1
    `;

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username sudah terdaftar di Neon Database.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const inserted = await sql`
      INSERT INTO argon_users (username, password_hash, email, role, status)
      VALUES (${cleanUser}, ${hash}, ${cleanEmail || null}, 'USER', 'PENDING_APPROVAL')
      RETURNING id, username, email, role, status, created_at
    `;

    return res.status(201).json({
      message: 'Permintaan akun berhasil dikirim ke Neon PostgreSQL. Status: PENDING_APPROVAL. Hanya Master Account (nayrbryanGaming) yang dapat menyetujui akses Anda.',
      user: inserted[0]
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Gagal menyimpan registrasi ke Neon PostgreSQL.' });
  }
}
