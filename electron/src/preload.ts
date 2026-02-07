require('./rt/electron-rt');
//////////////////////////////
// User Defined Preload scripts below
console.log('User Preload!');

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Update actions
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  restartToUpdate: () => ipcRenderer.send('restart-to-update'),
  
  // Update event listeners
  onUpdateAvailable: (callback: any) => ipcRenderer.on('update-available', callback),
  onUpdateNotAvailable: (callback: any) => ipcRenderer.on('update-not-available', callback),
  onDownloadProgress: (callback: any) => ipcRenderer.on('download-progress', callback),
  onUpdateDownloaded: (callback: any) => ipcRenderer.on('update-downloaded', callback),
  onUpdateError: (callback: any) => ipcRenderer.on('update-error', callback),
  onUpdateStatus: (callback: any) => ipcRenderer.on('update-status', callback),
  
  // Remove listeners
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('update-not-available');
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
    ipcRenderer.removeAllListeners('update-error');
    ipcRenderer.removeAllListeners('update-status');
  },
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => process.platform,
  
  // Check if running in Electron
  isElectron: () => true
});