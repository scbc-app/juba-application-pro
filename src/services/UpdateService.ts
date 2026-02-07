// UpdateService.ts - Enhanced for PWA updates
class UpdateService {
  private readonly VERSION_URL = '/version.json';
  private currentVersion = '3.2.0'; // Your current app version
  private checkInterval: number | null = null;
  private isUpdateChecking = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Load saved version from localStorage
    const savedVersion = localStorage.getItem('app-version');
    if (savedVersion) {
      this.currentVersion = savedVersion;
    } else {
      localStorage.setItem('app-version', this.currentVersion);
    }

    // Set up service worker listeners
    this.setupServiceWorkerListeners();
    
    // Start periodic checking (every 30 minutes)
    this.startPeriodicChecking();
  }

  private setupServiceWorkerListeners() {
    if ('serviceWorker' in navigator) {
      // Listen for controller change (when service worker updates)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker controller changed, reloading...');
        this.updateLocalVersion();
        window.location.reload();
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'UPDATE_READY') {
          this.notifyUpdateAvailable(event.data.version);
        }
      });
    }
  }

  private updateLocalVersion() {
    // Update localStorage with new version
    fetch(this.VERSION_URL + '?t=' + Date.now())
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('app-version', data.version);
        this.currentVersion = data.version;
      })
      .catch(console.error);
  }

  async checkForUpdates(): Promise<{
    hasUpdate: boolean;
    latestVersion: string;
    currentVersion: string;
    releaseNotes: string;
    downloadUrl?: string;
  }> {
    if (this.isUpdateChecking) {
      return {
        hasUpdate: false,
        latestVersion: this.currentVersion,
        currentVersion: this.currentVersion,
        releaseNotes: ''
      };
    }

    this.isUpdateChecking = true;

    try {
      // Add timestamp to prevent caching
      const response = await fetch(this.VERSION_URL + '?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to fetch version');
      
      const data = await response.json();
      
      // Check if new version is available
      const hasUpdate = this.isNewerVersion(data.version, this.currentVersion);

      if (hasUpdate) {
        const updateInfo = {
          hasUpdate: true,
          latestVersion: data.version,
          currentVersion: this.currentVersion,
          releaseNotes: data.notes || data.releaseNotes || 'New update available',
          downloadUrl: data.downloadUrl
        };

        // Store in localStorage
        localStorage.setItem('updateAvailable', JSON.stringify(updateInfo));

        // Dispatch event for UI components
        this.notifyUpdateAvailable(data.version);

        return updateInfo;
      } else {
        // Clear any stored update info if we're up to date
        localStorage.removeItem('updateAvailable');
      }

      return {
        hasUpdate: false,
        latestVersion: data.version,
        currentVersion: this.currentVersion,
        releaseNotes: ''
      };

    } catch (error) {
      console.error('Update check failed:', error);
      return {
        hasUpdate: false,
        latestVersion: this.currentVersion,
        currentVersion: this.currentVersion,
        releaseNotes: ''
      };
    } finally {
      this.isUpdateChecking = false;
    }
  }

  private notifyUpdateAvailable(version: string) {
    const event = new CustomEvent('updateAvailable', {
      detail: {
        hasUpdate: true,
        latestVersion: version,
        currentVersion: this.currentVersion,
        releaseNotes: 'A new version is available',
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
  }

  private isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const latestPart = latestParts[i] || 0;
      const currentPart = currentParts[i] || 0;

      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }

    return false;
  }

  openUpdatePage() {
    if ('serviceWorker' in navigator) {
      // Trigger service worker update
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          // Send skip waiting message to service worker
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          // If no waiting worker, check for updates and reload
          this.checkForUpdates().then(() => {
            window.location.reload();
          });
        }
      });
    } else {
      // Fallback for non-PWA
      window.location.reload();
    }
  }

  startPeriodicChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, 30 * 60 * 1000); // Check every 30 minutes
  }

  stopPeriodicChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // For manual checking from UI
  async manualCheck() {
    return await this.checkForUpdates();
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  forceUpdate() {
    localStorage.removeItem('app-version');
    window.location.reload();
  }
}

export const updateService = new UpdateService();