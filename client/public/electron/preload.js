const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getFiles: (dirPath) => ipcRenderer.invoke('get-files', dirPath)
});
