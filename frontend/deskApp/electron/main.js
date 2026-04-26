const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const DEV_URL = 'http://localhost:3000';
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow = null;
let nextProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(DEV_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function waitForServer(url, retries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    let attempts = 0;

    const check = () => {
      const req = http.get(url, (res) => {
        resolve();
      });
      req.on('error', () => {
        attempts++;
        if (attempts >= retries) {
          reject(new Error(`Server at ${url} did not start after ${retries} attempts`));
        } else {
          setTimeout(check, interval);
        }
      });
      req.end();
    };

    check();
  });
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const nextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next');
    nextProcess = spawn(nextBin, ['start'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env },
    });

    nextProcess.on('error', reject);

    // Give it a moment to boot then wait for HTTP
    setTimeout(() => {
      waitForServer(DEV_URL).then(resolve).catch(reject);
    }, 2000);
  });
}

app.whenReady().then(async () => {
  if (!isDev) {
    await startNextServer();
  }

  await waitForServer(DEV_URL);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
});
