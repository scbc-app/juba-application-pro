import React, { useState, useEffect } from 'react';
import { SystemSettings, User } from '../types';

interface SettingsViewProps {
    settings: SystemSettings;
    setSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
    appScriptUrl: string;
    setAppScriptUrl: (url: string) => void;
    handleSaveSettings: () => void;
    isSavingSettings: boolean;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    user?: User | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    settings, setSettings, handleSaveSettings, isSavingSettings, user
}) => {
    const [logoError, setLogoError] = useState(false);

    useEffect(() => { setLogoError(false); }, [settings.companyLogo]);

    const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn space-y-8 pb-12 font-sans">
             <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Account Settings</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Workspace & Brand Identity</p>
             </div>

             {/* Company Profile Section */}
             <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Organization Profile</h3>
                    {!isAdmin && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-widest">Read Only Access</span>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Company Name</label>
                        <input 
                            type="text" 
                            disabled={!isAdmin}
                            value={settings.companyName} 
                            onChange={(e) => setSettings(s => ({...s, companyName: e.target.value}))} 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Support/Admin Email</label>
                        <input 
                            type="email" 
                            disabled={!isAdmin}
                            value={settings.managerEmail} 
                            onChange={(e) => setSettings(s => ({...s, managerEmail: e.target.value}))} 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50" 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Public Portal URL (Sharing Link)</label>
                    <input 
                        type="url" 
                        disabled={!isAdmin}
                        value={settings.webAppUrl || ''} 
                        onChange={(e) => setSettings(s => ({...s, webAppUrl: e.target.value}))} 
                        placeholder="https://yourcompany.github.io/safetycheck/"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50" 
                    />
                    <p className="text-[9px] text-slate-400 ml-1">This link is used when sharing the app via the Support Center.</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Brand Logo (Base64/URL)</label>
                    <textarea 
                        disabled={!isAdmin}
                        value={settings.companyLogo} 
                        onChange={(e) => setSettings(s => ({...s, companyLogo: e.target.value}))} 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[10px] text-slate-500 h-24 outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50" 
                        placeholder="Paste logo image string here..."
                    />
                </div>

                {isAdmin && (
                    <div className="flex justify-end pt-4 border-t border-slate-50">
                        <button 
                            onClick={handleSaveSettings} 
                            disabled={isSavingSettings} 
                            className="px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                        >
                            {isSavingSettings && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            Synchronize Profile
                        </button>
                    </div>
                )}
             </div>
        </div>
    );
}

export default SettingsView;