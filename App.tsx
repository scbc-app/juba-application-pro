import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_DATA, InspectionData, User } from './types';
import { 
    SHEET_HEADERS, PETROLEUM_HEADERS, PETROLEUM_V2_HEADERS, ACID_HEADERS,
    INSPECTION_ITEMS, PETROLEUM_INSPECTION_ITEMS, PETROLEUM_V2_ITEMS, ACID_INSPECTION_ITEMS
} from './constants';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useSettings } from './hooks/useSettings';
import { useNotifications } from './hooks/useNotifications';
import { useHistory } from './hooks/useHistory';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useSubscription } from './hooks/useSubscription';

// Services
import { analyzeInspection } from './services/geminiService';

// UI Components
import Toast from './components/ui/Toast';
import ReportViewerModal from './components/ui/ReportViewerModal';
import SubmissionOverlay from './components/ui/SubmissionOverlay';
import ProfileModal from './components/ui/ProfileModal';
import NotificationCenter from './components/ui/NotificationCenter'; 
import UpgradeModal from './components/ui/UpgradeModal';
import InspectionStartModal from './components/ui/InspectionStartModal';
import SubscriptionAlert from './components/ui/SubscriptionAlert';
import MaintenanceOverlay from './components/ui/MaintenanceOverlay';
import RequestInspectionModal from './components/ui/RequestInspectionModal'; 
import OnboardingWizard from './components/ui/OnboardingWizard'; 
import SystemTour from './components/ui/SystemTour'; 
import InstallPwaPrompt from './components/ui/InstallPwaPrompt';
import SolutionsDrawer from './components/ui/SolutionsDrawer';
import UpdateNotification from './src/components/UpdateNotification';

// Views
import LoginView from './views/LoginView';
import SettingsView from './views/SettingsView';
import GeneralDashboard from './views/GeneralDashboard';
import PetroleumDashboard from './views/PetroleumDashboard';
import PetroleumV2Dashboard from './views/PetroleumV2Dashboard';
import AcidDashboard from './views/AcidDashboard';
import UserManagementView from './views/UserManagementView';
import OverviewDashboard from './views/OverviewDashboard';
import InspectionFormView from './views/InspectionFormView';
import SupportView from './views/SupportView';
import MaintenanceView from './views/MaintenanceView';
import RequestTrackingView from './views/RequestTrackingView';
import AnalyticsDashboard from './views/AnalyticsDashboard';
import FleetWallView from './views/FleetWallView';
import LibraryView from './views/LibraryView';
import FleetRegistryView from './views/FleetRegistryView';

// Report Components
import PrintableGeneralReport from './components/reports/PrintableGeneralReport';
import PrintablePetroleumReport from './components/reports/PrintablePetroleumReport';
import PrintablePetroleumV2Report from './components/reports/PrintablePetroleumV2Report';
import PrintableAcidReport from './components/reports/PrintableAcidReport';

const App = () => {
  const { currentUser, setCurrentUser, handleLogin, handleLogout, sessionExpired, setSessionExpired } = useAuth();
  const { settings, setSettings, appScriptUrl, setAppScriptUrl, isSavingSettings, handleSaveSettings, fetchSystemSettings } = useSettings();
  const { subscription, history: subHistory, refreshSubscription } = useSubscription(appScriptUrl, currentUser);

  const [activeModule, setActiveModule] = useState('overview'); 
  const [viewMode, setViewMode] = useState<'dashboard' | 'form'>('dashboard');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info' | 'warning'} | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isCheckingMaint, setIsCheckingMaint] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<InspectionData | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Prefill state for Support View
  const [supportPrefill, setSupportPrefill] = useState<{subject: string, description: string} | null>(null);

  // Draft Management State
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [pendingModule, setPendingModule] = useState<string | null>(null);
  const [hasExistingDraft, setHasExistingDraft] = useState(false);
  
  const { historyList, isLoadingHistory, validationLists, stats, fetchHistory } = useHistory(appScriptUrl, activeModule, currentUser);
  
  useEffect(() => {
    if (currentUser && !currentUser.needsSetup) {
        setActiveModule('overview');
        setViewMode('dashboard');
    }
  }, [currentUser?.username, currentUser?.needsSetup]);

  const lockInfo = useMemo(() => {
      const isSuperAdmin = currentUser?.role === 'SuperAdmin';
      const isSubExpired = subscription ? (subscription.status === 'Expired' || subscription.daysRemaining <= 0) : false;
      const isMaintActive = settings.maintenanceMode === true;
      
      if (isSuperAdmin) return { isLocked: false, reason: null as any };
      
      if (isMaintActive) return { isLocked: true, reason: 'maintenance' as const };
      if (isSubExpired) return { isLocked: true, reason: 'license' as const };
      
      return { isLocked: false, reason: null as any };
  }, [subscription, settings.maintenanceMode, currentUser?.role]);
  
  const isSystemLocked = lockInfo.isLocked;

  useEffect(() => {
    (window as any).isSubscriptionLocked = isSystemLocked;
  }, [isSystemLocked]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
      if (sessionExpired === 'idle') showToast("Session expired due to inactivity.", 'warning');
      else if (sessionExpired === 'max_duration') showToast("Session limit reached. Log in again.", 'info');
      if (sessionExpired) setSessionExpired(null);
  }, [sessionExpired]);

  const { submissionStatus, setSubmissionStatus, isSyncing, addToQueue } = useOfflineSync(appScriptUrl, showToast, () => fetchHistory(true));
  
  const handleNavigate = async (module: string) => {
    if (module.startsWith('support:info:')) {
        const solutionName = module.replace('support:info:', '');
        setSupportPrefill({
            subject: `Inquiry: ${solutionName}`,
            description: `Automated Request: User is interested in learning more about integrating the "${solutionName}" module into the current fleet workflow.`
        });
        setActiveModule('support');
        setViewMode('dashboard');
        setIsSolutionsOpen(false);
        return;
    }

    if (module.startsWith('request:start_inspection')) {
        if (isSystemLocked) {
            showToast("System is in View-Only mode.", "error");
            return;
        }
        const parts = module.split('|');
        const type = parts[1]?.toLowerCase();
        const truck = parts[2];
        const trailer = parts[3];
        const requester = parts[4];
        const reason = parts[5];
        let moduleKey = 'general';
        if (type === 'petroleum') moduleKey = 'petroleum';
        else if (type === 'petroleum_v2') moduleKey = 'petroleum_v2';
        else if (type === 'acid') moduleKey = 'acid';

        setActiveModule(moduleKey);
        startFreshInspection(moduleKey, {
            truckNo: truck,
            trailerNo: trailer,
            remarks: `Requested by ${requester}: ${reason}`,
            requestId: parts[0].split('-')[1]
        });
        return;
    }

    if (module !== 'support') {
        setSupportPrefill(null);
    }

    setActiveModule(module);
    setViewMode('dashboard');
  };

  const handleOpenInspectionFlow = (module: string) => {
    if (isSystemLocked) {
        showToast("System is currently in view-only mode.", "error");
        return;
    }
    const draftKey = `sc_draft_${module}`;
    const draft = localStorage.getItem(draftKey);
    
    if (draft) {
        setPendingModule(module);
        setHasExistingDraft(true);
        setIsStartModalOpen(true);
    } else {
        startFreshInspection(module);
    }
  };

  const { notifications, handleMarkNotificationRead, handleDismissNotification, handleClearAllNotifications, handleGlobalAcknowledge } = useNotifications(appScriptUrl, currentUser, showToast);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<InspectionData | null>(null);
  const [formInitialData, setFormInitialData] = useState<InspectionData>(INITIAL_DATA);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin';
  const isSuperAdmin = currentUser?.role === 'SuperAdmin';

  const startFreshInspection = (module: string, prefill?: Partial<InspectionData>) => {
      if (isSystemLocked) {
          showToast("Access Restricted: View-Only mode active.", "error");
          return;
      }
      setLastSubmittedData(null);
      setAiAnalysisResult(null);
      setFormInitialData({ ...INITIAL_DATA, timestamp: new Date().toISOString(), inspectedBy: currentUser?.name || '', ...prefill });
      setViewMode('form');
  };

  const handleResumeDraft = () => {
    if (!pendingModule) return;
    const draftKey = `sc_draft_${pendingModule}`;
    const draftData = localStorage.getItem(draftKey);
    if (draftData) {
        setFormInitialData(JSON.parse(draftData));
        setActiveModule(pendingModule);
        setViewMode('form');
    }
    setIsStartModalOpen(false);
  };

  const handleDiscardAndStartNew = () => {
    if (!pendingModule) return;
    localStorage.removeItem(`sc_draft_${pendingModule}`);
    setActiveModule(pendingModule);
    startFreshInspection(pendingModule);
    setIsStartModalOpen(false);
  };

  const handleSaveDraft = (data: InspectionData) => {
    localStorage.setItem(`sc_draft_${activeModule}`, JSON.stringify(data));
    setViewMode('dashboard');
  };

  const handleExitForm = () => setViewMode('dashboard');

  const handleGoogleSheetSubmit = async (formData: InspectionData) => {
    if (isSystemLocked) {
        showToast("System is in View-Only mode. Submission blocked.", "error");
        return;
    }
    if (!appScriptUrl) {
        showToast("Application URL not configured", "error");
        return;
    }

    setSubmissionStatus('submitting');
    setLastSubmittedData(formData);
    setAiAnalysisResult(null);

    let sheetName = 'General';
    let headers = SHEET_HEADERS;
    let moduleTitle = "General Vehicle Inspection";
    let activeItems = INSPECTION_ITEMS;

    if (activeModule === 'petroleum') { 
        sheetName = 'Petroleum'; headers = PETROLEUM_HEADERS; 
        moduleTitle = "Petroleum Tanker Inspection"; activeItems = PETROLEUM_INSPECTION_ITEMS;
    } else if (activeModule === 'petroleum_v2') { 
        sheetName = 'Petroleum_V2'; headers = PETROLEUM_V2_HEADERS; 
        moduleTitle = "Petroleum Tanker Inspection V2"; activeItems = PETROLEUM_V2_ITEMS;
    } else if (activeModule === 'acid') { 
        sheetName = 'Acid'; headers = ACID_HEADERS; 
        moduleTitle = "Acid Tanker Inspection"; activeItems = ACID_INSPECTION_ITEMS;
    }

    const row = headers.map(h => formData[h] !== undefined ? formData[h] : "");
    const reportData = {
        title: moduleTitle,
        timestamp: formData.timestamp,
        truckNo: formData.truckNo,
        trailerNo: formData.trailerNo,
        jobCard: formData.jobCard,
        location: formData.location,
        odometer: formData.odometer,
        inspectedBy: formData.inspectedBy,
        driverName: formData.driverName,
        remarks: formData.remarks,
        rate: formData.rate,
        signatures: { inspector: formData.inspectorSignature, driver: formData.driverSignature },
        photos: { front: formData.photoFront, ls: formData.photoLS, rs: formData.photoRS, back: formData.photoBack, damage: formData.photoDamage },
        items: activeItems.map(item => ({ label: item.label, category: item.category, status: formData[item.id] || 'N/A' })),
        companyName: settings.companyName,
        companyLogo: settings.companyLogo
    };

    const payload = { action: 'create', sheet: sheetName, headers: headers, row: row, requestId: formData.requestId || null, reportData: reportData };

    if (!navigator.onLine) {
        addToQueue(payload);
        localStorage.removeItem(`sc_draft_${activeModule}`);
        setSubmissionStatus('offline_saved');
        setTimeout(() => { setSubmissionStatus('idle'); setViewMode('dashboard'); }, 3500);
        return;
    }

    try {
        await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify(payload), mode: 'no-cors' });
        setSubmissionStatus('success');
        localStorage.removeItem(`sc_draft_${activeModule}`);
        try {
            const analysis = await analyzeInspection(formData);
            setAiAnalysisResult(analysis);
        } catch (aiErr) {
            setAiAnalysisResult("AI analysis currently unavailable.");
        }
        fetchHistory(true); 
    } catch (error) {
        console.error("Submission error", error);
        addToQueue(payload);
        localStorage.removeItem(`sc_draft_${activeModule}`);
        setSubmissionStatus('offline_saved');
        setTimeout(() => { setSubmissionStatus('idle'); setViewMode('dashboard'); }, 3500);
    }
  };

  const handleRequestSubmit = async (data: any) => {
      if (isSystemLocked) { showToast("Requests are disabled in View-Only mode.", "error"); return; }
      if (!appScriptUrl) return;
      try {
          await fetch(appScriptUrl, {
              method: 'POST',
              body: JSON.stringify({ action: 'request_inspection', requester: currentUser?.name, role: currentUser?.role, ...data }),
              mode: 'no-cors'
          });
          showToast("Inspection request submitted successfully", "success");
      } catch (e) { showToast("Failed to submit request", "error"); }
  };

  const handleViewReport = (item: InspectionData | null) => {
    setSelectedReportData(item);
    setIsReportModalOpen(true);
  };

  const handleOnboardingComplete = (updatedUser: User) => {
      const userWithSetup = { ...updatedUser, needsSetup: false };
      setCurrentUser(userWithSetup);
      localStorage.setItem('safetyCheck_user', JSON.stringify(userWithSetup));
      setActiveModule('overview');
      setViewMode('dashboard');
      showToast("Profile verified successfully.", "success");
      setShowTour(true);
  };

  const handleCheckMaintStatus = async () => {
    setIsCheckingMaint(true);
    try { await fetchSystemSettings(appScriptUrl, true); showToast("Status updated.", "info"); } finally { setIsCheckingMaint(false); }
  };

  const isAtRoot = activeModule === 'overview';

  if (!currentUser) {
      return (
          <>
            <InstallPwaPrompt />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <LoginView onLogin={handleLogin} appScriptUrl={appScriptUrl} setAppScriptUrl={setAppScriptUrl} settings={settings} />
          </>
      );
  }

  if (currentUser && currentUser.needsSetup) {
      return <OnboardingWizard user={currentUser} appScriptUrl={appScriptUrl} onComplete={handleOnboardingComplete} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      <SubmissionOverlay 
        status={submissionStatus} 
        onClose={() => { setSubmissionStatus('idle'); setViewMode('dashboard'); }}
        onViewReport={() => lastSubmittedData && handleViewReport(lastSubmittedData)}
        aiAnalysis={aiAnalysisResult}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showTour && <SystemTour onComplete={() => setShowTour(false)} />}
      
      {/* AUTO-UPDATE NOTIFICATION */}
      <UpdateNotification />

      {isProfileModalOpen && (
          <ProfileModal user={currentUser} settings={settings} appScriptUrl={appScriptUrl} onClose={() => setIsProfileModalOpen(false)} showToast={showToast} onUpdateSuccess={(u) => setCurrentUser(u)} onLogout={() => { setIsProfileModalOpen(false); handleLogout(); }} />
      )}

      {isSolutionsOpen && (
          <SolutionsDrawer isOpen={isSolutionsOpen} onClose={() => setIsSolutionsOpen(false)} onAction={handleNavigate} />
      )}

      <RequestInspectionModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} onSubmit={handleRequestSubmit} validationLists={validationLists} currentUserRole={currentUser.role} />

      <InspectionStartModal 
        isOpen={isStartModalOpen} 
        onClose={() => setIsStartModalOpen(false)} 
        onStartNew={handleDiscardAndStartNew} 
        onResume={handleResumeDraft} 
        hasDraft={hasExistingDraft} 
        moduleName={pendingModule || ''} 
      />

      <div className="relative z-10 min-h-screen flex flex-col">
          <div className="no-print">
            {settings.maintenanceMode && (
                <div className="bg-amber-600 px-4 py-2.5 flex items-center justify-center gap-4 text-white shadow relative z-[101]">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <p className="text-xs font-black">{settings.maintenanceMessage || 'SYSTEM MAINTENANCE IN PROGRESS'}</p>
                    </div>
                    <button onClick={handleCheckMaintStatus} disabled={isCheckingMaint} className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-[10px] font-black transition-all uppercase tracking-widest">
                        {isCheckingMaint ? 'SYNCING...' : 'CHECK STATUS'}
                    </button>
                </div>
            )}
            <SubscriptionAlert subscription={subscription} user={currentUser} onManage={() => setActiveModule('maintenance')} />
          </div>

          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2 flex items-center justify-between h-14 no-print">
              <div className="flex items-center gap-2">
                  {!isAtRoot && (
                      <button onClick={() => { setActiveModule('overview'); setViewMode('dashboard'); }} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all flex items-center group">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                          <span className="text-[10px] font-black ml-1 hidden sm:inline uppercase tracking-widest">Dashboard</span>
                      </button>
                  )}
              </div>
              <button onClick={() => { setActiveModule('overview'); setViewMode('dashboard'); }} className="flex flex-col items-center hover:opacity-80 transition-opacity absolute left-1/2 -translate-x-1/2">
  <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tighter leading-none uppercase">{settings.companyName || 'SAFETYCHECK PRO'}</h1>
  <span className="text-[7px] font-black text-indigo-600 tracking-[0.4em] mt-1 hidden sm:block">
    CORE SYSTEM v{localStorage.getItem('app-version') || '3.2.0'}
  </span>
</button>
              <div className="flex items-center gap-2">
                  <NotificationCenter id="notification-bell" notifications={notifications} onMarkAsRead={(id) => handleMarkNotificationRead(id, handleNavigate)} onDismiss={handleDismissNotification} onClearAll={handleClearAllNotifications} onAcknowledge={handleGlobalAcknowledge} canAcknowledge={isAdmin} />
                  <button id="profile-trigger" onClick={() => setIsProfileModalOpen(true)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </button>
              </div>
          </header>

          {isSystemLocked && (
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center justify-center gap-2 no-print">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  <span className="text-[9px] font-black text-amber-800 uppercase tracking-[0.2em]">
                      {lockInfo.reason === 'maintenance' ? 'LOCKED: CORE MAINTENANCE' : 'RESTRICTED: VIEW-ONLY MODE'}
                  </span>
              </div>
          )}

          <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto no-print">
              {viewMode === 'form' ? (
                  <InspectionFormView initialData={formInitialData} activeModule={activeModule} validationLists={validationLists} settings={settings} onSaveDraft={handleSaveDraft} onExit={handleExitForm} onSubmit={handleGoogleSheetSubmit} submissionStatus={submissionStatus} onViewReport={handleViewReport} />
              ) : (
                  <div className="animate-fadeIn">
                      {activeModule === 'overview' && <OverviewDashboard appScriptUrl={appScriptUrl} onNavigate={handleNavigate} userRole={currentUser.role} historyList={historyList} isLoading={isLoadingHistory} onViewReport={handleViewReport} isMaintenanceActive={settings.maintenanceMode} pendingAlertsCount={notifications.filter(n => !n.read && n.type === 'critical').length} isLocked={isSystemLocked} />}
                      {activeModule === 'analytics' && <AnalyticsDashboard historyList={historyList} isLoading={isLoadingHistory} />}
                      {activeModule === 'fleet_wall' && <FleetWallView historyList={historyList} isLoading={isLoadingHistory} onClose={() => handleNavigate('overview')} />}
                      {activeModule === 'library' && <LibraryView />}
                      {(activeModule === 'settings' && isAdmin) && <SettingsView settings={settings} setSettings={setSettings} appScriptUrl={appScriptUrl} setAppScriptUrl={setAppScriptUrl} handleSaveSettings={handleSaveSettings} isSavingSettings={isSavingSettings} showToast={showToast} user={currentUser} />}
                      {(activeModule === 'maintenance' && isSuperAdmin) && <MaintenanceView user={currentUser} appScriptUrl={appScriptUrl} settings={settings} onSettingsUpdate={(s) => setSettings(p => ({...p, ...s}))} showToast={showToast} onRefreshSubscription={refreshSubscription} subscription={subscription} history={subHistory} />}
                      {activeModule === 'general' && <GeneralDashboard userRole={currentUser.role} stats={stats} startNewInspection={() => handleOpenInspectionFlow('general')} fetchHistory={fetchHistory} isLoadingHistory={isLoadingHistory} historyList={historyList} onViewReport={handleViewReport} onPrint={() => {}} isLocked={isSystemLocked} lockReason={lockInfo.reason} maintenanceMessage={settings.maintenanceMessage} />}
                      {activeModule === 'petroleum' && <PetroleumDashboard userRole={currentUser.role} stats={stats} startNewInspection={() => handleOpenInspectionFlow('petroleum')} fetchHistory={fetchHistory} isLoadingHistory={isLoadingHistory} historyList={historyList} onViewReport={handleViewReport} onPrint={() => {}} isLocked={isSystemLocked} lockReason={lockInfo.reason} maintenanceMessage={settings.maintenanceMessage} />}
                      {activeModule === 'petroleum_v2' && <PetroleumV2Dashboard userRole={currentUser.role} stats={stats} startNewInspection={() => handleOpenInspectionFlow('petroleum_v2')} fetchHistory={fetchHistory} isLoadingHistory={isLoadingHistory} historyList={historyList} onViewReport={handleViewReport} onPrint={() => {}} isLocked={isSystemLocked} lockReason={lockInfo.reason} maintenanceMessage={settings.maintenanceMessage} />}
                      {activeModule === 'acid' && <AcidDashboard userRole={currentUser.role} stats={stats} startNewInspection={() => handleOpenInspectionFlow('acid')} fetchHistory={fetchHistory} isLoadingHistory={isLoadingHistory} historyList={historyList} onViewReport={handleViewReport} onPrint={() => {}} isLocked={isSystemLocked} lockReason={lockInfo.reason} maintenanceMessage={settings.maintenanceMessage} />}
                      {(activeModule === 'users' && isAdmin) && <UserManagementView currentUser={currentUser} appScriptUrl={appScriptUrl} showToast={showToast} validationLists={validationLists} settings={settings} />}
                      {activeModule === 'support' && <SupportView appScriptUrl={appScriptUrl} currentUser={currentUser} showToast={showToast} settings={settings} validationLists={validationLists} prefillData={supportPrefill} onPrefillConsumed={() => setSupportPrefill(null)} />}
                      {activeModule === 'track_requests' && <RequestTrackingView appScriptUrl={appScriptUrl} currentUser={currentUser} showToast={showToast} onRequestNew={() => setIsRequestModalOpen(true)} />}
                      {activeModule === 'registry' && <FleetRegistryView appScriptUrl={appScriptUrl} validationLists={validationLists} onRefresh={() => fetchHistory(true)} showToast={showToast} isLocked={isSystemLocked} />}
                  </div>
              )}
          </main>

          {/* RESTORED SUIT ICON AT BOTTOM LEFT */}
          {!isSystemLocked && viewMode === 'dashboard' && (
              <div className="fixed bottom-8 left-8 z-[100] no-print">
                  <button 
                    onClick={() => setIsSolutionsOpen(true)}
                    className="w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-black hover:scale-110 transition-all group border-t border-white/10 relative"
                  >
                      <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 animate-pulse opacity-50"></div>
                      <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                      </svg>
                      <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm border border-indigo-500 uppercase tracking-widest">PRO</div>
                  </button>
              </div>
          )}

          <footer className="mt-auto py-6 border-t border-slate-100 text-center no-print">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">© Scbc 2026</span>
          </footer>
      </div>

      {isReportModalOpen && selectedReportData && (
          <ReportViewerModal onClose={() => setIsReportModalOpen(false)} onPrint={() => window.print()} title={`Report_${selectedReportData.id || 'History'}`}>
              {activeModule === 'petroleum' ? <PrintablePetroleumReport data={selectedReportData} settings={settings} /> : activeModule === 'petroleum_v2' ? <PrintablePetroleumV2Report data={selectedReportData} settings={settings} /> : activeModule === 'acid' ? <PrintableAcidReport data={selectedReportData} settings={settings} /> : <PrintableGeneralReport data={selectedReportData} settings={settings} />}
          </ReportViewerModal>
      )}
    </div>
  );
};

export default App;