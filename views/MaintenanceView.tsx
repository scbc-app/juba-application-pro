import React, { useState, useEffect, useMemo } from 'react';
import { User, SystemSettings, SubscriptionDetails } from '../types';
import { BACKEND_FILES } from '../constants';

interface MaintenanceViewProps {
    user: User;
    appScriptUrl: string;
    settings: SystemSettings;
    onSettingsUpdate: (newSettings: Partial<SystemSettings>) => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onRefreshSubscription?: () => void;
    subscription?: SubscriptionDetails | null;
    history?: any[];
}

const MaintenanceView: React.FC<MaintenanceViewProps> = ({ 
    user, appScriptUrl, settings, onSettingsUpdate, showToast, onRefreshSubscription, subscription, history = [] 
}) => {
    // --- 1. System Control State ---
    const [msgType, setMsgType] = useState<'info' | 'warning' | 'critical'>('info');
    const [msgBody, setMsgBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [maintMode, setMaintMode] = useState(settings.maintenanceMode || false);
    const [maintMessage, setMaintMessage] = useState(settings.maintenanceMessage || 'System under scheduled maintenance.');
    const [isSavingMaint, setIsSavingMaint] = useState(false);

    // --- 2. License Calculator State ---
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [durationValue, setDurationValue] = useState(1);
    const [durationUnit, setDurationUnit] = useState<'month' | 'year'>('month');
    const [selectedPlan, setSelectedPlan] = useState('Enterprise');
    const [isSavingLicense, setIsSavingLicense] = useState(false);
    
    // Auto-calculate expiry
    const calculatedExpiry = useMemo(() => {
        const start = new Date(startDate);
        if (durationUnit === 'month') {
            start.setMonth(start.getMonth() + Number(durationValue));
        } else {
            start.setFullYear(start.getFullYear() + Number(durationValue));
        }
        return start.toISOString().split('T')[0];
    }, [startDate, durationValue, durationUnit]);

    useEffect(() => {
        setMaintMode(settings.maintenanceMode || false);
        setMaintMessage(settings.maintenanceMessage || 'System under scheduled maintenance.');
    }, [settings.maintenanceMode, settings.maintenanceMessage]);

    const handleBroadcast = async () => {
        if (!msgBody.trim()) { showToast("Please enter a message.", "error"); return; }
        setIsSending(true);
        try {
            await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'broadcast', type: msgType, message: msgBody }), mode: 'no-cors' });
            showToast("Broadcast sent successfully!", "success");
            setMsgBody('');
        } catch (e) { showToast("Failed to send broadcast.", "error"); } finally { setIsSending(false); }
    };

    const handleSaveMaintenance = async () => {
        setIsSavingMaint(true);
        try {
            await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update_settings',
                    ...settings,
                    maintenanceMode: maintMode,
                    maintenanceMessage: maintMessage
                }),
                mode: 'no-cors'
            });
            onSettingsUpdate({ maintenanceMode: maintMode, maintenanceMessage: maintMessage });
            showToast(maintMode ? "SYSTEM LOCKDOWN ACTIVATED" : "System Access Restored", "success");
        } catch (e) { showToast("Failed to update status.", "error"); } finally { setIsSavingMaint(false); }
    };

    const handleUpdateLicense = async () => {
        setIsSavingLicense(true);
        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'extend_subscription',
                    expiryDate: calculatedExpiry,
                    plan: selectedPlan,
                    processedBy: user.name
                })
            });
            
            const result = await response.json();

            if (result.status === 'success') {
                showToast(`${selectedPlan} license extended until ${calculatedExpiry}`, "success");
                if (onRefreshSubscription) onRefreshSubscription();
            } else {
                throw new Error(result.message);
            }
        } catch (e) {
            showToast("Failed to update license on server.", "error");
        } finally {
            setIsSavingLicense(false);
        }
    };

    // --- 3. Backend/API State ---
    const [selectedFile, setSelectedFile] = useState<string>('1_Controller.gs');
    const [copyStatus, setCopyStatus] = useState<string | null>(null);
    const [localScriptUrl, setLocalScriptUrl] = useState(appScriptUrl);

    const handleCopyCode = () => {
        const code = BACKEND_FILES[selectedFile];
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                setCopyStatus(selectedFile);
                showToast(`${selectedFile} copied`, 'success');
                setTimeout(() => setCopyStatus(null), 2000);
            });
        }
    };

    const handleUpdateScriptUrl = () => {
        // We set the script URL in local storage and application state
        localStorage.setItem('safetyCheck_scriptUrl', localScriptUrl);
        window.location.reload(); // Reload to re-initialize hooks with new URL
    };

    const sortedHistory = useMemo(() => {
        return [...history].reverse();
    }, [history]);

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn pb-24 space-y-8 px-4 sm:px-0 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">System Security & Core</h1>
                    <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Master Administrator Console</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Security Session</span>
                </div>
            </div>

            {/* SECTION 1: SUBSCRIPTION MANAGEMENT */}
            <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 px-8 py-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="font-bold text-xl uppercase tracking-tight">Subscription & Licensing</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Manage enterprise access duration</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
                        <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                </div>

                <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Calculator */}
                    <div className="lg:col-span-5 space-y-8">
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                New License Calculator
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Plan Type</label>
                                    <select 
                                        value={selectedPlan} 
                                        onChange={(e) => setSelectedPlan(e.target.value)}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none h-[58px]"
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="Professional">Professional</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Renewal Duration</label>
                                <div className="flex gap-3">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={durationValue} 
                                        onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
                                    />
                                    <select 
                                        value={durationUnit} 
                                        onChange={(e) => setDurationUnit(e.target.value as any)}
                                        className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none"
                                    >
                                        <option value="month">Month(s)</option>
                                        <option value="year">Year(s)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative z-10 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Calculated Expiry</p>
                                        <p className="text-3xl font-black text-indigo-900 tracking-tighter">{new Date(calculatedExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <button 
                                        onClick={handleUpdateLicense}
                                        disabled={isSavingLicense}
                                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSavingLicense && <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        Commit System Renewal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="lg:col-span-7 space-y-6">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            License Registry History
                        </h4>
                        
                        <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
                            {/* Desktop Table View */}
                            <div className="hidden sm:block">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100/80 text-slate-500 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Processor</th>
                                            <th className="px-6 py-4">Tier</th>
                                            <th className="px-6 py-4">Coverage Date</th>
                                            <th className="px-6 py-4 text-right">Integrity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sortedHistory.length === 0 ? (
                                            <tr><td colSpan={4} className="p-16 text-center text-slate-300 font-bold italic uppercase tracking-widest text-[11px]">Database empty / connection pending</td></tr>
                                        ) : (
                                            sortedHistory.map((entry, idx) => {
                                                const rawExpiry = String(entry.expiryDate || '').trim();
                                                const cleanExpiry = rawExpiry.split('T')[0];
                                                const isActive = subscription?.expiryDate === cleanExpiry;
                                                return (
                                                    <tr key={idx} className={`transition-colors ${isActive ? 'bg-indigo-50/40' : 'hover:bg-white'}`}>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-400 text-[8px] font-black uppercase mb-0.5">{String(entry.timestamp || '2026-01-01').split('T')[0]}</span>
                                                                <span className="text-slate-700 font-bold text-xs truncate max-w-[120px]">{entry.processedBy}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="text-slate-500 font-black text-[10px] uppercase tracking-tighter">{entry.plan}</span>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`font-black uppercase tracking-tight text-sm ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{cleanExpiry}</span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            {isActive ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
                                                                    Active
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Legacy</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="sm:hidden divide-y divide-slate-100 p-4">
                                {sortedHistory.length === 0 ? (
                                    <div className="p-10 text-center text-slate-300 font-bold italic uppercase tracking-widest text-[10px]">No records found</div>
                                ) : (
                                    sortedHistory.map((entry, idx) => (
                                        <div key={idx} className="py-5 first:pt-0 last:pb-0 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">{String(entry.timestamp || '').split('T')[0]}</p>
                                                    <p className="text-xs font-bold text-slate-800">{entry.processedBy}</p>
                                                </div>
                                                {subscription?.expiryDate === String(entry.expiryDate).split('T')[0] ? (
                                                    <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[7px] font-black uppercase tracking-widest">Active</span>
                                                ) : (
                                                    <span className="text-[7px] font-bold text-slate-300 uppercase">Legacy</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Tier</span>
                                                    <span className="text-[10px] font-black text-slate-600">{entry.plan}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase">Expires</span>
                                                    <span className="text-[11px] font-black text-slate-800 tracking-tight">{String(entry.expiryDate).split('T')[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: LOCKDOWN & BROADCAST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100/50">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                        </div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-tight text-lg">Global Broadcast</h3>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                        <textarea 
                            className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl h-36 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 text-sm font-medium transition-all" 
                            placeholder="Type important fleet-wide announcement..." 
                            value={msgBody} 
                            onChange={e => setMsgBody(e.target.value)}
                        ></textarea>
                    </div>
                    <button onClick={handleBroadcast} disabled={isSending} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] active:scale-[0.98] disabled:opacity-50">
                        {isSending ? 'Broadcasting...' : 'Dispatch Fleet Alert'}
                        {!isSending && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                    </button>
                </div>

                <div className="bg-rose-50 rounded-[2rem] border border-rose-100 p-8 space-y-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center border border-rose-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <h3 className="font-bold text-rose-800 uppercase tracking-tight text-lg">System Lockdown</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-white border border-rose-100 rounded-2xl shadow-sm">
                                <div>
                                    <span className="text-sm font-black text-rose-900 uppercase tracking-tighter">Maintenance Mode</span>
                                    <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-0.5">Restrict all non-admin access</p>
                                </div>
                                <button onClick={() => setMaintMode(!maintMode)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${maintMode ? 'bg-rose-600' : 'bg-slate-200'}`}>
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition shadow-sm ${maintMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">Lockdown Message</label>
                                <input 
                                    type="text" 
                                    value={maintMessage} 
                                    onChange={(e) => setMaintMessage(e.target.value)}
                                    className="w-full p-4 bg-white border border-rose-100 rounded-2xl font-bold text-rose-800 outline-none placeholder:text-rose-200 focus:ring-4 focus:ring-rose-500/10"
                                />
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSaveMaintenance} disabled={isSavingMaint} className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] active:scale-[0.98] disabled:opacity-50 mt-4">
                        {isSavingMaint ? 'Updating...' : 'Apply System Status'}
                        {!isSavingMaint && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    </button>
                </div>
            </div>

            {/* SECTION 3: BACKEND CODE MODULES */}
            <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 sm:p-10 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Backend Architecture</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Deployment modules for Google Apps Script</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                            value={selectedFile} 
                            onChange={(e) => setSelectedFile(e.target.value)}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-700 outline-none min-w-[200px] h-[54px]"
                        >
                            {Object.keys(BACKEND_FILES).map(file => (
                                <option key={file} value={file}>{file}</option>
                            ))}
                        </select>
                        <button onClick={handleCopyCode} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-indigo-100 h-[54px] flex items-center justify-center gap-2">
                            {copyStatus === selectedFile ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                            )}
                            {copyStatus === selectedFile ? 'Copied to Clipboard' : 'Source Code'}
                        </button>
                    </div>
                </div>
                <div className="relative group">
                    <div className="absolute top-4 right-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none group-hover:opacity-0 transition-opacity">Read Only</div>
                    <textarea 
                        readOnly 
                        value={BACKEND_FILES[selectedFile] || ''} 
                        className="w-full min-h-[400px] p-8 bg-slate-50 border border-slate-200 rounded-[2rem] font-mono text-[11px] leading-relaxed text-slate-500 focus:ring-0 outline-none resize-none scrollbar-hide border-dashed"
                    />
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest leading-relaxed">
                        Deployment Note: Copy this module into your Google Apps Script editor and deploy as a new version to sync updates.
                    </p>
                </div>
            </section>

            {/* SECTION 4: ENGINE ENDPOINT (TECHNICAL) */}
            <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 sm:p-10 space-y-6">
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center border border-slate-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    Google Apps Script URL
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text" 
                        value={localScriptUrl} 
                        onChange={(e) => setLocalScriptUrl(e.target.value)} 
                        className="flex-1 p-5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-600 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all" 
                        placeholder="https://script.google.com/macros/s/..."
                    />
                    <button onClick={handleUpdateScriptUrl} className="px-8 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] active:scale-[0.98] shadow-2xl transition-all h-[60px]">
                        Save & Reload
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Caution: Changing this URL will reset the connection to your data storage.</p>
            </section>
        </div>
    );
};

export default MaintenanceView;