import React, { useState, useEffect } from 'react';
import { updateService } from '../services/UpdateService';
import './UpdateNotification.css';

const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isForceUpdate, setIsForceUpdate] = useState(false);

  useEffect(() => {
    // Check for stored update info
    const checkStoredUpdate = () => {
      const storedUpdate = localStorage.getItem('updateAvailable');
      if (storedUpdate) {
        const parsed = JSON.parse(storedUpdate);
        if (parsed.hasUpdate) {
          setUpdateInfo(parsed);
          setShowUpdate(true);
          
          // Check if this is a force update
          const versionJson = localStorage.getItem('versionJson');
          if (versionJson) {
            const versionData = JSON.parse(versionJson);
            if (versionData.required === true) {
              setIsForceUpdate(true);
            }
          }
        }
      }
    };

    // Listen for update events from the service
    const handleUpdateEvent = (event: CustomEvent) => {
      if (event.detail.hasUpdate) {
        setUpdateInfo(event.detail);
        setShowUpdate(true);
        localStorage.setItem('updateAvailable', JSON.stringify(event.detail));
      }
    };

    // Load version.json to check for force updates
    const loadVersionJson = async () => {
      try {
        const response = await fetch('/version.json?t=' + Date.now());
        const data = await response.json();
        localStorage.setItem('versionJson', JSON.stringify(data));
        
        if (data.required === true) {
          setIsForceUpdate(true);
          setShowUpdate(true);
          setUpdateInfo({
            hasUpdate: true,
            latestVersion: data.version,
            currentVersion: updateService.getCurrentVersion(),
            releaseNotes: data.notes || 'Required update available'
          });
        }
      } catch (error) {
        console.error('Failed to load version.json:', error);
      }
    };

    // Check on mount
    checkStoredUpdate();
    loadVersionJson();

    // Add event listener
    window.addEventListener('updateAvailable', handleUpdateEvent as EventListener);

    // Initial check (silent)
    checkForUpdates(true);

    // Cleanup
    return () => {
      window.removeEventListener('updateAvailable', handleUpdateEvent as EventListener);
    };
  }, []);

  const checkForUpdates = async (silent = false) => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const result = await updateService.checkForUpdates();
      if (result.hasUpdate && !silent) {
        setUpdateInfo(result);
        setShowUpdate(true);
        
        // Check if this is a required update
        try {
          const response = await fetch('/version.json?t=' + Date.now());
          const data = await response.json();
          if (data.required === true) {
            setIsForceUpdate(true);
          }
        } catch (error) {
          console.error('Failed to check update requirement:', error);
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

const handleUpdateNow = async () => {
  if (updateInfo.platform === 'android' && updateInfo.apkUrl) {
    // Android APK auto-install
    setShowUpdate(false);
    showToast('Starting update installation...', 'info');
    
    if (updateInfo.action) {
      const result = await updateInfo.action();
      if (!result?.success) {
        showToast(result?.message || 'Installation failed', 'error');
      }
    }
  } else if (updateInfo.platform === 'electron') {
    // Electron updates
    if (window.electronAPI) {
      window.electronAPI.checkForUpdates();
      setShowUpdate(false);
    }
  } else {
    // Web/PWA updates
    if (updateInfo.action) {
      await updateInfo.action();
    }
    setShowUpdate(false);
    localStorage.removeItem('updateAvailable');
  }
};

  const handleClose = () => {
    if (!isForceUpdate) {
      setShowUpdate(false);
      // Set a reminder for 1 hour later
      localStorage.setItem('updateReminder', Date.now().toString());
    }
  };

  const handleRemindLater = () => {
    if (!isForceUpdate) {
      setShowUpdate(false);
      // Set reminder for 1 hour
      localStorage.setItem('updateReminder', Date.now().toString());
    }
  };

  if (!showUpdate || !updateInfo) return null;

  return (
    <div className={`update-notification ${isForceUpdate ? 'force-update' : ''}`}>
      <div className="update-content">
        <div className="update-header">
          <h3>
            {isForceUpdate ? '⚠️ Required Update Available' : '🔄 Update Available'}
          </h3>
          {!isForceUpdate && (
            <button className="close-btn" onClick={handleClose}>
              ×
            </button>
          )}
        </div>

        <div className="update-body">
          <p>
            <strong>New Version:</strong> v{updateInfo.latestVersion}
            <br />
            <strong>Your Version:</strong> v{updateInfo.currentVersion}
          </p>

          {updateInfo.releaseNotes && (
            <div className="release-notes">
              <strong>What's New:</strong>
              <p>{updateInfo.releaseNotes}</p>
            </div>
          )}

          <div className="update-actions">
            <button
              className="update-btn primary"
              onClick={handleUpdateNow}
            >
              {isForceUpdate ? 'Update Required' : 'Update Now'}
            </button>

            {!isForceUpdate && (
              <button
                className="update-btn secondary"
                onClick={handleRemindLater}
              >
                Remind Me Later
              </button>
            )}
          </div>

          <div className="version-info">
            <small>
              Last checked: {new Date().toLocaleTimeString()}
              {isForceUpdate && ' • Required Update'}
            </small>
          </div>
        </div>

        {!isForceUpdate && (
          <div className="check-update-btn">
            <button
              onClick={() => checkForUpdates(false)}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Check for Updates'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateNotification;