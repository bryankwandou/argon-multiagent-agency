const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const TARGET_URL = process.env.ARGON_DESKTOP_URL || 'https://argon-multiagent-agency.vercel.app';

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0b0d12',
    title: 'Argon Multi-Agent Agency — Gemini 4 Argon High Command Floor',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.setMenuBarVisibility(false);
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const localDist = path.join(__dirname, '..', 'dist', 'index.html');
  if (process.env.ARGON_LOAD_LOCAL === '1') {
    win.loadFile(localDist);
  } else {
    win.loadURL(TARGET_URL);
  }
}

app.whenReady().then(() => {
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

