
import React from 'react';
import { SystemSettings, User, SubscriptionDetails } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onSelectModule: (m: string) => void;
  settings: SystemSettings;
  user?: User; 
  onLogout?: () => void;
  onEditProfile?: () => void; 
  onLockedItemClick?: (featureName: string) => void;
  subscription?: SubscriptionDetails | null;
  onRequestInspection?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, activeModule, onSelectModule, settings, user, onLogout, onEditProfile, onLockedItemClick, subscription, onRequestInspection 
}) => {
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const isSuperAdmin = user?.role === 'SuperAdmin';

  const NavItem = ({ id, label, icon, isRestricted = false }: { id: string, label: string, icon: React.ReactNode, isRestricted?: boolean }) => {
    const isActive = activeModule === id;
    
    return (
      <button 
        id={id}
        onClick={() => { onSelectModule(id); onClose(); }}
        className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 relative group
          ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
        `}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
        <div className={`shrink-0 transition-transform duration-300 ${!isActive && 'group-hover:scale-110'}`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { 
            className: "w-5 h-5", 
            strokeWidth: "3.2", // Matching the heavier look
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }) : icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity whitespace-nowrap ${!isOpen && 'md:opacity-0'}`}>
          {label}
        </span>
        {isRestricted && (
            <div className="absolute right-4">
                <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50] md:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 bottom-0 z-[60] bg-slate-950 border-r border-white/5 transition-all duration-500 flex flex-col
        ${isOpen ? 'w-72' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-14 border-b border-white/5 flex items-center px-6 shrink-0 overflow-hidden">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
             <span className={`text-white font-black uppercase tracking-tighter text-xs transition-opacity whitespace-nowrap ${!isOpen && 'opacity-0'}`}>
               SafetyPro <span className="text-indigo-400">Portal</span>
             </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6">
          <div className="space-y-1">
            <NavItem id="overview" label="Dashboard" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
            <NavItem id="analytics" label="Analytics" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3v18h18"/><path d="M18 9l-5 5-2-2-4 4"/></svg>} />
            <NavItem id="fleet_wall" label="Live Wall" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>} />
            <NavItem id="library" label="Resources" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5v-15z"/></svg>} />

            <div className={`px-6 pt-8 pb-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] transition-opacity ${!isOpen && 'opacity-0 h-0 p-0 overflow-hidden'}`}>Audits</div>
            
            <NavItem id="general" label="Inspection" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></svg>} />
            <NavItem id="petroleum" label="Petro V1" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4m-17.3-7.3l2.8 2.8m9.9 9.9l2.8 2.8m-15.5 0l2.8-2.8m9.9-9.9l2.8-2.8"/></svg>} />
            <NavItem id="petroleum_v2" label="Petro V2" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>} />
            <NavItem id="acid" label="Acid Check" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>} />
            
            <div className={`px-6 pt-8 pb-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] transition-opacity ${!isOpen && 'opacity-0 h-0 p-0 overflow-hidden'}`}>Workflow</div>
            <NavItem id="track_requests" label="Requests" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>} />
            
            {isAdmin && (
                <>
                    <div className={`px-6 pt-8 pb-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] transition-opacity ${!isOpen && 'opacity-0 h-0 p-0 overflow-hidden'}`}>Admin</div>
                    <NavItem id="users" label="Staff List" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
                    <NavItem id="settings" label="Settings" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>} />
                </>
            )}

            {isSuperAdmin && (
                <NavItem id="maintenance" label="Security" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-4 shrink-0 overflow-hidden">
            <button 
              id="support"
              onClick={() => { onSelectModule('support'); onClose(); }}
              className={`w-full flex items-center gap-4 px-3 py-4 rounded-xl transition-all duration-300
                ${activeModule === 'support' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m0 4h.01"/></svg>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${!isOpen && 'opacity-0'}`}>
                Support
              </span>
            </button>
            <button 
                onClick={onLogout}
                className="w-full flex items-center gap-4 px-3 py-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all mt-1"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${!isOpen && 'opacity-0'}`}>
                    Log Out
                </span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
