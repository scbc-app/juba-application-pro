import React, { useState } from 'react';
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
    <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-slate-700 transition-all duration-300 group-hover:scale-110">
        {React.isValidElement(children) ? React.cloneElement(children as React.ReactElement<any>, { 
            className: "w-full h-full", 
            strokeWidth: "2", 
            strokeLinecap: "round",
            strokeLinejoin: "round"
        }) : children}
    </div>
);

const InspectionChecklistIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
    </RefinedIcon>
);

const SecurityIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    </RefinedIcon>
);

const StaffIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
    </RefinedIcon>
);

const SettingsIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
    </RefinedIcon>
);

const RegistryIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h10M7 12h10M7 16h6" />
        </svg>
    </RefinedIcon>
);

const AnalyticsIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
    </RefinedIcon>
);

const RequestsIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    </RefinedIcon>
);

const SupportIcon = () => (
    <RefinedIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path d="M12 17v-4M12 9h.01" strokeWidth="3" />
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
    onNavigate: (module: string) => void;
    isAddon?: boolean;
}

const LauncherTile = ({ 
    id, label, icon, isForcedLock = false, badgeCount = 0, badgeColor = 'bg-slate-800', 
    isInspectionModule = false, isLocked, onNavigate, isAddon = false
}: LauncherTileProps) => {
    const effectiveLock = isForcedLock || (isInspectionModule && isLocked);
    
    return (
        <button 
            onClick={() => !effectiveLock && onNavigate(id)}
            className={`flex flex-col items-center p-4 sm:p-8 transition-all w-full group relative rounded-[2rem]
                ${effectiveLock ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:bg-white hover:shadow-2xl active:scale-95 border border-transparent hover:border-slate-50'}`}
        >
            <div className="mb-4 flex items-center justify-center relative">
                {icon}
                {effectiveLock && (
                    <div className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full p-1.5 shadow-xl ring-4 ring-slate-50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                )}
                {badgeCount > 0 && !effectiveLock && (
                    <div className={`absolute -top-1 -right-1 ${badgeColor} text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                        {badgeCount}
                    </div>
                )}
                {isAddon && !effectiveLock && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm border border-indigo-500 uppercase tracking-tighter">Pro</div>
                )}
            </div>
            <span className={`text-[10px] font-black text-center leading-tight uppercase tracking-[0.2em] ${effectiveLock ? 'text-slate-400' : 'text-slate-600 group-hover:text-slate-900'}`}>
                {label}
            </span>
        </button>
    );
};

const SectionHeader = ({ label }: { label: string }) => (
    <div className="w-full flex items-center gap-6 mb-8 opacity-40">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">{label}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
    </div>
);

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, userRole, isLocked = false, pendingAlertsCount = 0 }) => {
    const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';
    const isSuperAdmin = userRole === 'SuperAdmin';

    return (
        <div className="max-w-5xl mx-auto py-10 sm:py-16 px-4 min-h-screen">
            <div className="space-y-16">
                {/* 1. System Management */}
                <section id="system-mgmt-section" className="animate-fadeIn">
                    <SectionHeader label="CONTROL CENTER" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <LauncherTile id="maintenance" label="SECURITY" isLocked={isLocked} isForcedLock={!isSuperAdmin} onNavigate={onNavigate} icon={<SecurityIcon />} />
                        <LauncherTile id="users" label="PERSONNEL" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<StaffIcon />} />
                        <LauncherTile id="registry" label="REGISTRY" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<RegistryIcon />} />
                        <LauncherTile id="settings" label="SETTINGS" isLocked={isLocked} isForcedLock={!isAdmin} onNavigate={onNavigate} icon={<SettingsIcon />} />
                    </div>
                </section>

                {/* 2. Inspection Hub */}
                <section id="inspection-forms-section" className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                    <SectionHeader label="AUDIT MODULES" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <LauncherTile id="general" label="GENERAL" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="petroleum" label="PETRO V1" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="petroleum_v2" label="PETRO V2" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                        <LauncherTile id="acid" label="ACID CHECK" isInspectionModule={true} isLocked={isLocked} onNavigate={onNavigate} icon={<InspectionChecklistIcon />} />
                    </div>
                </section>

                {/* 3. Operations */}
                <section className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
                    <SectionHeader label="OPERATIONS" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <LauncherTile id="analytics" label="ANALYTICS" isLocked={isLocked} onNavigate={onNavigate} icon={<AnalyticsIcon />} badgeCount={pendingAlertsCount} badgeColor="bg-rose-600" />
                        <LauncherTile id="track_requests" label="PIPELINE" isLocked={isLocked} onNavigate={onNavigate} icon={<RequestsIcon />} />
                        <LauncherTile id="support" label="SUPPORT" isLocked={isLocked} onNavigate={onNavigate} icon={<SupportIcon />} />
                        <div className="hidden sm:flex flex-col items-center justify-center p-8 opacity-20 select-none">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">HUB ACTIVE</span>
                            <div className="w-4 h-1 bg-indigo-500 mt-2 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default OverviewDashboard;