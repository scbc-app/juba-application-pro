import type { CapacitorElectronConfig } from '@capacitor-community/electron';
import { setupElectronDeepLinking } from '@capacitor-community/electron';
import type { MenuItemConstructorOptions } from 'electron';
import { app, MenuItem, dialog, ipcMain } from 'electron';
import electronIsDev from 'electron-is-dev';
import unhandled from 'electron-unhandled';
import { autoUpdater } from 'electron-updater';

import { ElectronCapacitorApp, setupContentSecurityPolicy, setupReloadWatcher } from './setup';

// Graceful handling of unhandled errors.
unhandled();

// Define our menu templates (these are optional)
const trayMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [new MenuItem({ label: 'Quit App', role: 'quit' })];
const appMenuBarMenuTemplate: (MenuItemConstructorOptions | MenuItem)[] = [
  { role: process.platform === 'darwin' ? 'appMenu' : 'fileMenu' },
  { role: 'viewMenu' },
];

// Hardcoded Config options (getCapacitorElectronConfig() was failing)
const capacitorFileConfig: CapacitorElectronConfig = {
  appId: 'com.scbc.safetycheck',
  appName: 'SafetyCheckPro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://scbc-app.github.io/juba-application-pro'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  electron: {
    deepLinkingEnabled: true,
    customUrlScheme: 'safetycheckpro',
    trayIconAndMenuEnabled: false,
    splashScreenEnabled: true,
    splashScreenImageName: 'splash.png',
    backgroundColor: '#ffffff'
  }
};

// Initialize our app. You can pass menu templates into the app here.
const myCapacitorApp = new ElectronCapacitorApp(capacitorFileConfig, trayMenuTemplate, appMenuBarMenuTemplate);

// If deeplinking is enabled then we will set it up here.
if (capacitorFileConfig.electron?.deepLinkingEnabled) {
  setupElectronDeepLinking(myCapacitorApp, {
    customProtocol: capacitorFileConfig.electron.deepLinkingCustomProtocol ?? 'mycapacitorapp',
  });
}

// If we are in Dev mode, use the file watcher components.
if (electronIsDev) {
  setupReloadWatcher(myCapacitorApp);
}

// Enhanced Auto-Updater Configuration
function setupAutoUpdater() {
  // Only run auto-updater in production
  if (electronIsDev) {
    console.log('Auto-updater disabled in development mode');
    return;
  }

  // Configure auto-updater behavior
  autoUpdater.autoDownload = false; // Let user decide when to download
  autoUpdater.autoInstallOnAppQuit = true; // Auto-install on quit
  autoUpdater.fullChangelog = true; // Get full release notes

  console.log('Auto-updater configured for:', autoUpdater.getFeedURL());

  // Auto-updater event listeners
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
    myCapacitorApp.getMainWindow()?.webContents.send('update-status', 'checking');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    
    // Send to renderer process
    myCapacitorApp.getMainWindow()?.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
      files: info.files
    });

    // Prepare release notes for dialog
    let releaseNotesText = 'Bug fixes and performance improvements';
    if (info.releaseNotes) {
      if (Array.isArray(info.releaseNotes)) {
        releaseNotesText = info.releaseNotes
          .map(note => typeof note === 'string' ? note : note.note)
          .join('\n');
      } else {
        releaseNotesText = info.releaseNotes;
      }
    }

    // Show native dialog
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Would you like to download it now?`,
      detail: releaseNotesText,
      buttons: ['Download Update', 'Remind Me Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        console.log('Starting download...');
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('No updates available. Current version:', info.version);
    myCapacitorApp.getMainWindow()?.webContents.send('update-not-available', {
      version: info.version
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download progress: ${Math.floor(progressObj.percent)}%`);
    
    myCapacitorApp.getMainWindow()?.webContents.send('download-progress', {
      percent: Math.floor(progressObj.percent),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    
    // Send to renderer
    myCapacitorApp.getMainWindow()?.webContents.send('update-downloaded', {
      version: info.version,
      date: info.releaseDate
    });

    // Ask user to restart
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded. Restart the application to apply the update.`,
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        console.log('Restarting to apply update...');
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
    myCapacitorApp.getMainWindow()?.webContents.send('update-error', {
      message: error.message,
      stack: error.stack
    });
  });

  // Initial check
  autoUpdater.checkForUpdates();
  
  // Schedule periodic checks (every 4 hours)
  const checkInterval = 4 * 60 * 60 * 1000; // 4 hours
  setInterval(() => {
    console.log('Performing scheduled update check...');
    autoUpdater.checkForUpdates();
  }, checkInterval);
}

// Run Application
(async () => {
  // Wait for electron app to be ready.
  await app.whenReady();
  // Security - Set Content-Security-Policy based on whether or not we are in dev mode.
  setupContentSecurityPolicy(myCapacitorApp.getCustomURLScheme());
  // Initialize our app, build windows, and load content.
  await myCapacitorApp.init();
  
  // Setup auto-updater after app is initialized
  setupAutoUpdater();
})();

// Handle when all of our windows are close (platforms have their own expectations).
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the dock icon is clicked.
app.on('activate', async function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (myCapacitorApp.getMainWindow().isDestroyed()) {
    await myCapacitorApp.init();
  }
});

// IPC handlers for update actions from renderer
app.whenReady().then(() => {
  // Update actions from renderer
  ipcMain.on('check-for-updates', () => {
    if (!electronIsDev) {
      autoUpdater.checkForUpdates();
    }
  });

  ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.on('restart-to-update', () => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });
});

// Export for preload script
export { myCapacitorApp };