const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { initDatabase } = require('./database');
const { registerIpcHandlers } = require('./ipc-handlers');

let mainWindow = null;
let tray = null;
let isQuitting = false;

async function createWindow() {
  const iconPath = path.join(__dirname, '..', 'Assets', 'logo.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'HoussamTasks',
    icon: iconPath,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#800020',
      symbolColor: '#FFF9F2',
      height: 36,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: '#FFF9F2',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Window controls
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) {
      if (process.platform === 'win32') {
        mainWindow.hide();
      } else {
        mainWindow.close();
      }
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (isDev) {
    mainWindow.loadURL(devServerUrl).catch(() => {
      // If dev server is not ready yet, retry in 1s or load dist
      setTimeout(() => {
        mainWindow.loadURL(devServerUrl).catch(() => {
          mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
        });
      }, 1000);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'Assets', 'logo.png');
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);
  tray.setToolTip('HoussamTasks');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open HoussamTasks',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(async () => {
  try {
    const dbPath = path.join(app.getPath('userData'), 'houssam-tasks.db');
    await initDatabase(dbPath);
  } catch (err) {
    console.error('Failed to initialize database on startup:', err);
    await initDatabase(); // fallback to current dir
  }

  registerIpcHandlers(ipcMain);
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
