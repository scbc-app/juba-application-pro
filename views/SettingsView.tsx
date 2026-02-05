import React, { useState, useEffect, useRef } from 'react';
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

const SectionHeader = ({ label }: { label: string }) => (
    <div className="w-full flex items-center gap-4 mb-6 opacity-60">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
        <div className="h-px flex-1 bg-slate-200"></div>
    </div>
);

const SettingsView: React.FC<SettingsViewProps> = ({ 
    settings, setSettings, handleSaveSettings, isSavingSettings, user, showToast
}) => {
    const [logoError, setLogoError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setLogoError(false); }, [settings.companyLogo]);

    const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            showToast("Logo must be under 1MB", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64String = event.target?.result as string;
            setSettings(s => ({ ...s, companyLogo: base64String }));
            showToast("Logo updated", "success");
        };
        reader.readAsDataURL(file);
    };

    const inputClasses = "w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all disabled:opacity-50";
    const labelClasses = "block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 ml-1";

    return (
        <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-8 animate-fadeIn px-2">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-800 tracking-tight uppercase">Application Settings</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Configure your workspace and organization details</p>
                </div>
                {!isAdmin && (
                    <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg">
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Read-Only</span>
                    </div>
                )}
             </div>

             <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-10">
                <section>
                    <SectionHeader label="Organization" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className={labelClasses}>Organization Name</label>
                            <input type="text" disabled={!isAdmin} value={settings.companyName} onChange={(e) => setSettings(s => ({...s, companyName: e.target.value}))} className={inputClasses} placeholder="Enter company name" />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Admin Contact Email</label>
                            <input type="email" disabled={!isAdmin} value={settings.managerEmail} onChange={(e) => setSettings(s => ({...s, managerEmail: e.target.value}))} className={inputClasses} placeholder="admin@company.com" />
                        </div>
                    </div>
                </section>

                <section>
                    <SectionHeader label="System Links" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className={labelClasses}>Web Portal URL</label>
                            <input type="url" disabled={!isAdmin} value={settings.webAppUrl || ''} onChange={(e) => setSettings(s => ({...s, webAppUrl: e.target.value}))} placeholder="https://app.fleetpro.com" className={inputClasses} />
                        </div>
                        <div className="space-y-1">
                            <label className={labelClasses}>Mobile App (APK) Link</label>
                            <input type="url" disabled={!isAdmin} value={settings.mobileApkLink || ''} onChange={(e) => setSettings(s => ({...s, mobileApkLink: e.target.value}))} placeholder="Download link for mobile app" className={inputClasses} />
                        </div>
                    </div>
                </section>

                <section>
                    <SectionHeader label="Branding" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-3">
                            <label className={labelClasses}>Company Logo</label>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} disabled={!isAdmin} />
                            <button onClick={() => fileInputRef.current?.click()} disabled={!isAdmin} className="w-full py-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-all disabled:opacity-50">
                                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Upload Image</span>
                            </button>
                        </div>
                        <div className="flex flex-col">
                            <label className={labelClasses}>Preview</label>
                            <div className="w-full h-32 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-4">
                                {settings.companyLogo && !logoError ? (
                                    <img src={settings.companyLogo} alt="Preview" className="max-h-full object-contain grayscale opacity-50" onError={() => setLogoError(true)} />
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">No Logo</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {isAdmin && (
                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                        <button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full sm:w-auto px-10 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 text-sm">
                            {isSavingSettings ? 'Saving Changes...' : 'Save Configuration'}
                        </button>
                    </div>
                )}
             </div>
        </div>
    );
}

export default SettingsView;