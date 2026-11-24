import { getSql, verifyLiveUser, setSecurityHeaders } from '../_db.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const caller = await verifyLiveUser(req, { requireAdmin: true });
    if (!caller) {
      return res.status(403).json({ error: 'Akses ditolak. Khusus Master Account (nayrbryanGaming).' });
    }

    const sql = getSql();
    const users = await sql`
      SELECT id, username, email, role, status, created_at, approved_by, approved_at
      FROM argon_users
      ORDER BY
        CASE status
          WHEN 'PENDING_APPROVAL' THEN 1
          WHEN 'APPROVED' THEN 2
          ELSE 3
        END,
        created_at DESC
    `;

    return res.status(200).json({
      total: users.length,
      pendingCount: users.filter(u => u.status === 'PENDING_APPROVAL').length,
      users
    });
  } catch (err) {
    console.error('Fetch users error:', err.message);
    return res.status(500).json({ error: 'Gagal membaca daftar pengguna dari Neon.' });
  }
}
