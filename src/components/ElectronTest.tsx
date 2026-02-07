import React, { useEffect, useState } from 'react';

const ElectronTest: React.FC = () => {
  const [platformInfo, setPlatformInfo] = useState<any>(null);
  const [electronAPI, setElectronAPI] = useState<any>(null);

  useEffect(() => {
    // Check if running in Electron
    const isElectron = navigator.userAgent.toLowerCase().includes('electron');
    const hasElectronAPI = !!(window as any).electronAPI;
    
    setPlatformInfo({
      isElectron,
      hasElectronAPI,
      userAgent: navigator.userAgent,
      platform: (window as any).electronAPI?.getPlatform?.() || 'web'
    });
    
    if (hasElectronAPI) {
      setElectronAPI((window as any).electronAPI);
      
      // Test Electron API
      (window as any).electronAPI.getAppVersion().then((version: string) => {
        console.log('Electron app version:', version);
      });
    }
  }, []);

  const testUpdateCheck = () => {
    if (electronAPI) {
      console.log('Checking for updates...');
      electronAPI.checkForUpdates();
    }
  };

  if (!platformInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#f0f0f0',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 10000,
      border: '1px solid #ccc'
    }}>
      <h4>Platform Info:</h4>
      <ul style={{ margin: 0, paddingLeft: '15px' }}>
        <li>Electron: {platformInfo.isElectron ? '✅' : '❌'}</li>
        <li>Electron API: {platformInfo.hasElectronAPI ? '✅' : '❌'}</li>
        <li>Platform: {platformInfo.platform}</li>
      </ul>
      {platformInfo.hasElectronAPI && (
        <button 
          onClick={testUpdateCheck}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test Update Check
        </button>
      )}
    </div>
  );
};

export default ElectronTest;