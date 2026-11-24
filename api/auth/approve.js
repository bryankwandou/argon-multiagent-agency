import { getSql, verifyLiveUser, setSecurityHeaders } from '../_db.js';

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const caller = await verifyLiveUser(req, { requireAdmin: true });
    if (!caller) {
      return res.status(403).json({ error: 'Akses ditolak. Hanya Master Account nayrbryanGaming yang dapat menyetujui akun.' });
    }

    const { userId, action } = req.body || {};
    const parsedId = Number(userId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ error: 'ID pengguna tidak valid.' });
    }

    if (action !== 'APPROVE' && action !== 'REJECT') {
      return res.status(400).json({ error: 'Aksi harus APPROVE atau REJECT.' });
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const sql = getSql();

    const targetRows = await sql`SELECT username, role FROM argon_users WHERE id = ${parsedId} LIMIT 1`;
    if (targetRows.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
    if (targetRows[0].role === 'MASTER_ADMIN') {
      return res.status(400).json({ error: 'Status Master Account tidak dapat diubah.' });
    }

    const updated = await sql`
      UPDATE argon_users
      SET status = ${newStatus}, approved_by = ${caller.username}, approved_at = CURRENT_TIMESTAMP
      WHERE id = ${parsedId}
      RETURNING id, username, email, role, status, approved_by, approved_at
    `;

    return res.status(200).json({
      message: `Akun ${updated[0].username} diperbarui menjadi ${newStatus}.`,
      user: updated[0]
    });
  } catch (err) {
    console.error('Approve error:', err.message);
    return res.status(500).json({ error: 'Gagal memperbarui status akun di Neon.' });
  }
}
