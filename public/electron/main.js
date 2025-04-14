import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { dialog } from 'electron';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:5173');
}

function calculateFolderSize(folderPath) {
  let totalSize = 0;
  
  const items = fs.readdirSync(folderPath);
  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      totalSize += calculateFolderSize(itemPath);
    } else {
      totalSize += stats.size;
    }
  }
  return totalSize;
}

ipcMain.handle('get-files', async (event, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath); 
    const fileDetails = files.map(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath); 
      const extension = path.extname(filePath); 

      let sizeCount = 0;
      if (stats.isDirectory()) {
        sizeCount = calculateFolderSize(filePath);
      } else {
        sizeCount = stats.size;
      }

      return {
        name: file,
        path: filePath,
        size: sizeCount,
        isDirectory: stats.isDirectory(),
        extension: extension,
        createdAt: stats.birthtime,
      };
    });
    return fileDetails;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
