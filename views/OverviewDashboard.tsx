
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

const HeavyHaulageIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M2 17h20" strokeWidth="1.5" />
            <path d="M4 17V9a2 2 0 012-2h4a2 2 0 012 2v8" />
            <rect x="12" y="11" width="10" height="6" rx="1" />
            <circle cx="6" cy="18" r="2" fill="currentColor" stroke="none" />
            <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" />
            <circle cx="15" cy="18" r="2" fill="currentColor" stroke="none" />
            <circle cx="19" cy="18" r="2" fill="currentColor" stroke="none" />
            <path d="M12 7l4-4h6v4h-6" opacity="0.4" />
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

const StaffIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10.5" />
            <circle cx="12" cy="10" r="2.8" fill="currentColor" stroke="none" />
            <path d="M7 18.5c0-2.8 2.2-5 5-5s5 2.2 5 5" fill="currentColor" stroke="none" />
            <circle cx="7.5" cy="12" r="2.2" fill="currentColor" stroke="none" opacity="0.6" />
            <path d="M4 17.5c0-1.8 1.5-3.2 3.5-3.2s3.5 1.4 3.5 3.2" fill="currentColor" stroke="none" opacity="0.6" />
            <circle cx="16.5" cy="12" r="2.2" fill="currentColor" stroke="none" opacity="0.6" />
            <path d="M13 17.5c0-1.8 1.5-3.2 3.5-3.2s3.5 1.4 3.5 3.2" fill="currentColor" stroke="none" opacity="0.6" />
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

const IncidentIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" />
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
        </svg>
    </RefinedIcon>
);

const WasteIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
        </svg>
    </RefinedIcon>
);

const JourneyIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
            <path d="M12 22V12" />
            <path d="M12 12l9-5" />
            <path d="M12 12L3 7" />
            <circle cx="12" cy="12" r="3" fill="white" stroke="currentColor" />
        </svg>
    </RefinedIcon>
);

const TyreIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="5" />
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
        </svg>
    </RefinedIcon>
);

const FuelIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 19V5a2 2 0 012-2h11a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <path d="M18 7h3a1 1 0 011 1v3a4 4 0 01-4 4" />
            <rect x="6" y="6" width="8" height="5" rx="1" />
            <circle cx="10" cy="16" r="2" />
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

const SchedulerIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 10h18M8 2v4M16 2v4" strokeWidth="1.5" />
            <path d="M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="18" r="4" fill="white" stroke="currentColor" />
            <path d="M17 18l1 1 2-2" strokeWidth="1.5" />
        </svg>
    </RefinedIcon>
);

const TrainingIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M22 10L12 5 2 10l10 5 10-5z" />
            <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
            <path d="M12 15v5" opacity="0.3" />
            <circle cx="12" cy="10" r="2" fill="currentColor" stroke="none" />
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
    isPro?: boolean;
    isEnterprise?: boolean;
    onNavigate: (module: string) => void;
}

const LauncherTile = ({ 
    id, label, icon, isForcedLock = false, badgeCount = 0, badgeColor = 'bg-slate-900', 
    isInspectionModule = false, isLocked, isPro = false, isEnterprise = false, onNavigate
}: LauncherTileProps) => {
    const effectiveLock = isForcedLock || (isInspectionModule && isLocked);
    return (
        <button 
            onClick={() => !effectiveLock && onNavigate(id)}
            className={`flex flex-col items-center justify-center p-4 transition-all w-full group ${effectiveLock ? 'opacity-25 cursor-not-allowed' : 'hover:opacity-60 active:scale-95'}`}
        >
            <div className="relative mb-5">
                {icon}
                {effectiveLock && (
                    <div className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-1 shadow-sm border border-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                )}
                {badgeCount > 0 && !effectiveLock && (
                    <div className={`absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20 animate-fadeIn`}>
                        {badgeCount}
                    </div>
                )}
                {isEnterprise && !effectiveLock && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded border border-white shadow-sm italic uppercase tracking-tighter">enterprise</div>
                )}
                {isPro && !isEnterprise && !effectiveLock && (
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded border border-white shadow-sm italic">pro</div>
                )}
            </div>
            <span className={`text-[10px] sm:text-[12px] font-medium text-center tracking-wider leading-tight transition-colors w-full ${effectiveLock ? 'text-slate-300' : 'text-slate-900 group-hover:text-blue-600'}`}>
                {label}
            </span>
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
                <section className="w-full animate-fadeIn">
                    <SectionHeader label="System Management" />
                    <div className="grid grid-cols-4 gap-x-4 gap-y-16 sm:gap-y-20">
                        <LauncherTile id="maintenance" label="Security" isLocked={isLocked} isForcedLock={!isSuperAdmin} onNavigate={onNavigate} icon={<SecurityIcon />} />
                        <LauncherTile id="users" label="Staff" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<StaffIcon />} />
                        <LauncherTile id="registry" label="Fleet Registry" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<RegistryIcon />} />
                        <LauncherTile id="settings" label="Settings" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<SettingsIcon />} />
                    </div>
                </section>

                <section className="w-full animate-fadeIn">
                    <SectionHeader label="Inspection Forms" />
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-4 gap-y-16 sm:gap-y-20">
                        <LauncherTile id="general" label="General Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="petroleum" label="Petroleum V1 Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="petroleum_v2" label="Petroleum V2 Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="acid" label="Acid Tank Inspection" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="heavy_haulage" label="Heavy Haulage & Specialized Audit" isInspectionModule={true} isLocked={true} isForcedLock={true} isEnterprise={true} onNavigate={onNavigate} icon={<HeavyHaulageIcon />} />
                    </div>
                </section>

                <section className="w-full animate-fadeIn">
                    <SectionHeader label="Operations & Support" />
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-4 gap-y-16 sm:gap-y-20">
                        <LauncherTile id="analytics" label="Fleet Analysis" isLocked={isLocked} onNavigate={onNavigate} icon={<AnalyticsIcon />} badgeCount={pendingAlertsCount} badgeColor="bg-rose-500" />
                        <LauncherTile id="track_requests" label="Inspection Requests" isLocked={isLocked} onNavigate={onNavigate} icon={<RequestsIcon />} />
                        <LauncherTile id="service_schedule" label="Maintenance Scheduler" isLocked={isLocked} isForcedLock={true} isPro={true} onNavigate={onNavigate} icon={<SchedulerIcon />} />
                        <LauncherTile id="personnel_training" label="Training & Induction" isLocked={isLocked} isForcedLock={true} isPro={true} onNavigate={onNavigate} icon={<TrainingIcon />} />
                        <LauncherTile id="support" label="Help & Support" isLocked={isLocked} onNavigate={onNavigate} icon={<SupportIcon />} />
                    </div>
                </section>

                <section className="w-full animate-fadeIn">
                    <SectionHeader label="Enterprise Operations" />
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-4 gap-y-16 sm:gap-y-20">
                        <LauncherTile id="incident_report" label="Incident Reporting" isLocked={isLocked} isForcedLock={true} isEnterprise={true} onNavigate={onNavigate} icon={<IncidentIcon />} />
                        <LauncherTile id="waste_mgmt" label="Scrap & Waste" isLocked={isLocked} isForcedLock={true} isEnterprise={true} onNavigate={onNavigate} icon={<WasteIcon />} />
                        <LauncherTile id="journey_mgmt" label="Journey Management" isLocked={isLocked} isForcedLock={true} isEnterprise={true} onNavigate={onNavigate} icon={<JourneyIcon />} />
                        <LauncherTile id="tyre_mgmt" label="Tyre Lifecycle" isLocked={isLocked} isForcedLock={true} isEnterprise={true} onNavigate={onNavigate} icon={<TyreIcon />} />
                        <LauncherTile id="fuel_intel" label="Fuel Intelligence" isLocked={isLocked} isForcedLock={true} isEnterprise={true} onNavigate={onNavigate} icon={<FuelIcon />} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OverviewDashboard;
