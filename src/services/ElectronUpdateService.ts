// src/services/ElectronUpdateService.ts
class ElectronUpdateService {
  private isElectron = false;
  private hasElectronAPI = false;

  constructor() {
    this.checkElectronEnvironment();
  }

  private checkElectronEnvironment() {
    // Check if running in Electron
    this.isElectron = navigator.userAgent.toLowerCase().includes('electron');
    
    // Check if electronAPI is available
    this.hasElectronAPI = !!(window as any).electronAPI;
    
    console.log('Electron environment:', {
      isElectron: this.isElectron,
      hasElectronAPI: this.hasElectronAPI,
      userAgent: navigator.userAgent
    });
  }

  isRunningInElectron(): boolean {
    return this.isElectron && this.hasElectronAPI;
  }

  async checkForUpdates() {
    if (!this.isRunningInElectron()) {
      return {
        hasUpdate: false,
        platform: 'web',
        message: 'Not running in Electron'
      };
    }

    try {
      const electronAPI = (window as any).electronAPI;
      
      // Set up event listeners
      return new Promise((resolve) => {
        electronAPI.onUpdateAvailable((event: any, info: any) => {
          console.log('Electron update available:', info);
          resolve({
            hasUpdate: true,
            platform: 'desktop',
            type: 'electron',
            version: info.version,
            releaseNotes: info.releaseNotes,
            action: () => electronAPI.downloadUpdate()
          });
        });

        electronAPI.onUpdateNotAvailable((event: any, info: any) => {
          console.log('Electron update not available:', info);
          resolve({
            hasUpdate: false,
            platform: 'desktop',
            version: info.version,
            message: 'Up to date'
          });
        });

        electronAPI.onUpdateError((event: any, error: any) => {
          console.error('Electron update error:', error);
          resolve({
            hasUpdate: false,
            platform: 'desktop',
            error: error.message,
            message: 'Update check failed'
          });
        });

        // Request update check
        electronAPI.checkForUpdates();
      });
    } catch (error) {
      console.error('Electron update check failed:', error);
      return {
        hasUpdate: false,
        platform: 'desktop',
        error: (error as Error).message,
        message: 'Update check failed'
      };
    }
  }

  async getAppVersion(): Promise<string> {
    if (!this.isRunningInElectron()) {
      return localStorage.getItem('app-version') || '1.0.0';
    }

    try {
      const electronAPI = (window as any).electronAPI;
      return await electronAPI.getAppVersion();
    } catch (error) {
      console.error('Failed to get Electron app version:', error);
      return localStorage.getItem('app-version') || '1.0.0';
    }
  }

  getPlatformInfo() {
    return {
      platform: this.isRunningInElectron() ? 'desktop' : 'web',
      isElectron: this.isElectron,
      hasElectronAPI: this.hasElectronAPI
    };
  }

  // Clean up event listeners
  cleanup() {
    if (this.isRunningInElectron()) {
      const electronAPI = (window as any).electronAPI;
      electronAPI.removeUpdateListeners();
    }
  }
}

export const electronUpdateService = new ElectronUpdateService();