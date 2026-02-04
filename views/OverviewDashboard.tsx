import React from 'react';
import { InspectionData } from '../types';

interface OverviewDashboardProps {
    appScriptUrl: string;
    onNavigate: (module: string) => void;
    userRole?: string;
    historyList: InspectionData[];
    isLoading?: boolean;
    onViewReport: (item: InspectionData) => void;
    isMaintenanceActive?: boolean;
    pendingAlertsCount?: number;
    isLocked?: boolean; 
}

const RefinedIcon = ({ children }: { children?: React.ReactNode }) => (
    <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center text-slate-900 transition-all duration-300 group-hover:scale-110">
        {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, { 
            className: "w-full h-full", 
            strokeWidth: "1.2", 
            strokeLinecap: "round",
            strokeLinejoin: "round"
        }) : children}
    </div>
);

const InspectionChecklistIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" fill="currentColor" stroke="none" />
            <path d="M9 3.5h6" strokeWidth="1.5" />
            <rect x="6" y="5" width="12" height="15" rx="1" ry="1" />
            <rect x="8" y="8" width="2.5" height="2.5" rx="0.5" />
            <path d="M11.5 9h4" />
            <rect x="8" y="12" width="2.5" height="2.5" rx="0.5" />
            <path d="M11.5 13h4" />
            <rect x="8" y="16" width="2.5" height="2.5" rx="0.5" />
            <path d="M11.5 17h2" />
            <circle cx="17.5" cy="17.5" r="5" fill="white" stroke="currentColor" strokeWidth="1.2" />
            <path d="M15.5 17.5l1.5 1.5 3-3" strokeWidth="1.4" />
        </svg>
    </RefinedIcon>
);

const SecurityIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.2" />
            <circle cx="12" cy="11" r="2.5" fill="currentColor" stroke="none" />
            <rect x="11" y="12" width="2" height="4" rx="0.5" fill="currentColor" stroke="none" />
            <path d="M12 11v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M9 11a3 3 0 116 0" strokeWidth="1" opacity="0.3" />
        </svg>
    </RefinedIcon>
);

// Standardized Staff Icon to match HR & Payroll (as requested)
const StaffIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <rect x="15" y="14" width="7" height="4" rx="1" strokeWidth="1" opacity="0.4" />
        </svg>
    </RefinedIcon>
);

const SettingsIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
            <circle cx="12" cy="12" r="3.5" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    </RefinedIcon>
);

const RegistryIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h10M7 12h10M7 16h6" opacity="0.3" />
            <circle cx="17" cy="16" r="3" strokeWidth="1.5" />
            <path d="M17 14.5v3" />
        </svg>
    </RefinedIcon>
);

const AnalyticsIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeOpacity="0.2" />
            <path d="M7 16V12M12 16V8M17 16V14" strokeWidth="2" />
            <circle cx="17" cy="7" r="3" />
            <path d="M17 5v2h2" opacity="0.5" />
        </svg>
    </RefinedIcon>
);

const RequestsIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M8 2v3M16 2v3" strokeWidth="1.5" />
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M7 10h10M7 14h10M7 18h5" opacity="0.4" />
            <circle cx="18" cy="18" r="4" fill="white" stroke="currentColor" />
            <path d="M18 16v2h2" strokeWidth="1.5" />
        </svg>
    </RefinedIcon>
);

const SupportIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <circle cx="12" cy="12" r="3" strokeOpacity="0.3" />
            <path d="M12 3v18M3 12h18" strokeOpacity="0.1" />
            <path d="M9 12l2 2 4-4" strokeWidth="1.5" />
        </svg>
    </RefinedIcon>
);

// --- Ad Icons ---
const MaintenanceAppIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    </RefinedIcon>
);

const HRPayrollIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <rect x="15" y="14" width="7" height="4" rx="1" strokeWidth="1" opacity="0.4" />
        </svg>
    </RefinedIcon>
);

const FinanceTicketIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <path d="M7 15h.01M11 15h2" />
            <circle cx="18" cy="15" r="2" opacity="0.3" />
        </svg>
    </RefinedIcon>
);

const DriverMgmtIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
        </svg>
    </RefinedIcon>
);

const PlanningIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
            <circle cx="18" cy="5" r="3" opacity="0.4" />
        </svg>
    </RefinedIcon>
);

const IncidentIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    </RefinedIcon>
);

interface LauncherTileProps {
    id: string;
    label: string;
    icon: React.ReactNode;
    isForcedLock?: boolean;
    badgeCount?: number;
    badgeColor?: string;
    isInspectionModule?: boolean;
    isLocked: boolean;
    isAd?: boolean;
    onNavigate: (module: string) => void;
}

const LauncherTile = ({ 
    id, label, icon, isForcedLock = false, badgeCount = 0, badgeColor = 'bg-slate-900', 
    isInspectionModule = false, isLocked, isAd = false, onNavigate
}: LauncherTileProps) => {
    const effectiveLock = isForcedLock || (isInspectionModule && isLocked);
    
    const handleTileClick = () => {
        if (isAd) {
            onNavigate(`support:info:${label}`);
            return;
        }
        if (!effectiveLock) {
            onNavigate(id);
        }
    };

    return (
        <button 
            onClick={handleTileClick}
            className={`flex flex-col items-center justify-center p-4 transition-all w-full group relative 
                ${isAd 
                    ? 'md:opacity-40 opacity-70 hover:opacity-100 cursor-pointer active:scale-95' 
                    : effectiveLock 
                        ? 'opacity-25 cursor-not-allowed' 
                        : 'hover:opacity-60 active:scale-95'
                }`}
        >
            <div className="relative mb-5">
                {icon}
                {effectiveLock && !isAd && (
                    <div className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-1 shadow-sm border border-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                )}
                {isAd && (
                    <>
                        <div className="absolute -top-2 -right-2 bg-slate-100 text-slate-500 text-[6px] font-black px-1.5 py-0.5 rounded-full border border-slate-200 shadow-sm uppercase tracking-widest whitespace-nowrap z-10">Module Pending</div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white text-[7px] font-black px-2 py-1 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none uppercase tracking-widest hidden md:block">
                            Request Setup
                        </div>
                    </>
                )}
                {badgeCount > 0 && !effectiveLock && (
                    <div className={`absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20 animate-fadeIn`}>
                        {badgeCount}
                    </div>
                )}
            </div>
            <span className={`text-[10px] sm:text-[11px] font-bold text-center tracking-wider leading-tight transition-colors w-full uppercase ${effectiveLock && !isAd ? 'text-slate-300' : 'text-slate-900 group-hover:text-blue-600'}`}>
                {label}
            </span>
            {isAd && (
                <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mt-1 group-hover:text-indigo-400 transition-colors">Integration Only</span>
            )}
        </button>
    );
};

const SectionHeader = ({ label }: { label: string }) => (
    <div className="w-full flex items-center gap-4 mb-10 px-8">
        <span className="text-[11px] font-bold text-slate-400 tracking-[0.3em] whitespace-nowrap uppercase">{label}</span>
        <div className="h-px flex-1 bg-slate-100"></div>
    </div>
);

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, userRole, isLocked = false, pendingAlertsCount = 0 }) => {
    const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';
    const isSuperAdmin = userRole === 'SuperAdmin';

    return (
        <div className="max-w-5xl mx-auto py-8 sm:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] overflow-hidden">
            <div className="w-full space-y-24 sm:space-y-32">
                
                {/* 1. System Management */}
                <section id="system-mgmt-section" className="w-full animate-fadeIn">
                    <SectionHeader label="System Management" />
                    <div className="grid grid-cols-4 gap-x-4 gap-y-16">
                        <LauncherTile id="maintenance" label="Security" isLocked={isLocked} isForcedLock={!isSuperAdmin} onNavigate={onNavigate} icon={<SecurityIcon />} />
                        <LauncherTile id="users" label="Staff" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<StaffIcon />} />
                        <LauncherTile id="registry" label="Fleet Registry" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<RegistryIcon />} />
                        <LauncherTile id="settings" label="Settings" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<SettingsIcon />} />
                    </div>
                </section>

                {/* 2. Inspection Hub */}
                <section id="inspection-forms-section" className="w-full animate-fadeIn">
                    <SectionHeader label="Inspection Hub" />
                    <div className="grid grid-cols-4 gap-x-4 gap-y-16">
                        <LauncherTile id="general" label="General Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="petroleum" label="Petroleum V1 Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="petroleum_v2" label="Petroleum V2 Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="acid" label="Acid Tanker Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                    </div>
                </section>

                {/* 3. Operations */}
                <section className="w-full animate-fadeIn">
                    <SectionHeader label="Operations & Logistics" />
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-x-4 gap-y-16">
                        <LauncherTile id="analytics" label="Fleet Analysis" isLocked={isLocked} onNavigate={onNavigate} icon={<AnalyticsIcon />} badgeCount={pendingAlertsCount} badgeColor="bg-rose-500" />
                        <LauncherTile id="track_requests" label="Request Inspection" isLocked={isLocked} onNavigate={onNavigate} icon={<RequestsIcon />} />
                        <LauncherTile id="support" label="Support Center" isLocked={isLocked} onNavigate={onNavigate} icon={<SupportIcon />} />
                    </div>
                </section>

                {/* 4. Integrated Corporate Solutions (Advertisements) */}
                <section className="w-full animate-fadeIn">
                    <SectionHeader label="Integrated Corporate Solutions" />
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-4 gap-y-16">
                        <LauncherTile id="ad_maintenance" label="Fleet Maintenance" isAd={true} isLocked={true} isForcedLock={false} onNavigate={onNavigate} icon={<MaintenanceAppIcon />} />
                        <LauncherTile id="ad_hr" label="HR & Payroll" isAd={true} isLocked={true} isForcedLock={false} onNavigate={onNavigate} icon={<HRPayrollIcon />} />
                        <LauncherTile id="ad_finance" label="Finance Tickets" isAd={true} isLocked={true} isForcedLock={false} onNavigate={onNavigate} icon={<FinanceTicketIcon />} />
                        <LauncherTile id="ad_driver" label="Driver Management" isAd={true} isLocked={true} isForcedLock={false} onNavigate={onNavigate} icon={<DriverMgmtIcon />} />
                        <LauncherTile id="ad_planning" label="Fleet Planning" isAd={true} isLocked={true} isForcedLock={false} onNavigate={onNavigate} icon={<PlanningIcon />} />
                        <LauncherTile id="ad_incident" label="Incident Reports" isAd={true} isLocked={true} isForcedLock={false} onNavigate={onNavigate} icon={<IncidentIcon />} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OverviewDashboard;