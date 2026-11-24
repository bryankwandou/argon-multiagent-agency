import { setSecurityHeaders } from '../_db.js';

const RELEASE_URL = 'https://github.com/bryankwandou/argon-multiagent-agency/releases/download/v2.0.0/Argon_MultiAgent_Agency_0.62.0_Setup.exe';
const INSTALLER_META = {
  filename: 'Argon_MultiAgent_Agency_0.62.0_Setup.exe',
  version: '0.62.0',
  productName: 'Argon Multi-Agent Agency Desktop Client',
  architecture: 'win32-x64 (NSIS-3 Unicode Installer)',
  sizeBytes: 116955184,
  sizeFormatted: '111.54 MB',
  sha256: '6C6B69CBB1E6234CD2A4A0F7FD53E2EF9E278255B8E951A0159841B1004C97CE',
  downloadUrl: RELEASE_URL
};

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.query?.meta === '1' || req.headers?.accept?.includes('application/json')) {
    return res.status(200).json(INSTALLER_META);
  }

  res.setHeader('Location', RELEASE_URL);
  return res.status(302).end();
}
