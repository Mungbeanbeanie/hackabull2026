const { contextBridge } = require('electron');

// Expose platform info to the renderer (safe, read-only)
contextBridge.exposeInMainWorld('electronApp', {
  platform: process.platform,
});
