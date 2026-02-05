import React, { useState } from 'react';
import { User, SystemSettings, SubscriptionDetails } from '../types';

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

const SectionHeader = ({ label }: { label: string }) => (
    <div className="w-full flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6 opacity-80 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] whitespace-nowrap">{label}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
    </div>
);

const MaintenanceView: React.FC<MaintenanceViewProps> = ({ 
    appScriptUrl, settings, onSettingsUpdate, showToast, subscription, onRefreshSubscription, history = []
}) => {
    const [msgType, setMsgType] = useState<'info' | 'warning' | 'critical'>('info');
    const [msgBody, setMsgBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const [maintMode, setMaintMode] = useState(settings.maintenanceMode || false);
    const [maintMessage, setMaintMessage] = useState(settings.maintenanceMessage || 'System under scheduled maintenance.');
    const [isSavingMaint, setIsSavingMaint] = useState(false);

    const [editPlan, setEditPlan] = useState(subscription?.plan || 'Enterprise');
    const [editExpiry, setEditExpiry] = useState(subscription?.expiryDate || '');
    const [isSavingSub, setIsSavingSub] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const handleBroadcast = async () => {
        if (!msgBody.trim()) { showToast("Enter alert message.", "error"); return; }
        setIsSending(true);
        try {
            await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'broadcast', type: msgType, message: msgBody }), mode: 'no-cors' });
            showToast("Broadcast dispatched.", "success");
            setMsgBody('');
        } catch (e) { showToast("Broadcast failed.", "error"); } finally { setIsSending(false); }
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
            showToast(maintMode ? "System Lock Active" : "Access Restored", "success");
        } catch (e) { showToast("Sync failed.", "error"); } finally { setIsSavingMaint(false); }
    };

    const handleUpdateSubscription = async () => {
        setIsSavingSub(true);
        try {
            await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update_subscription',
                    plan: editPlan,
                    expiryDate: editExpiry,
                    status: 'Active'
                }),
                mode: 'no-cors'
            });
            showToast("License synced.", "success");
            if (onRefreshSubscription) onRefreshSubscription();
        } catch (e) { showToast("Sync failed.", "error"); } finally { setIsSavingSub(false); }
    };

    const daysRemaining = subscription?.daysRemaining ?? 0;
    const isExpired = daysRemaining <= 0;

    return (
        <div className="max-w-6xl mx-auto py-2 sm:py-6 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-2 sm:px-4 animate-fadeIn font-sans overflow-hidden">
            <div className="w-full max-w-5xl space-y-6 sm:space-y-10">
                
                {/* Header matches Staff Directory style exactly */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-normal text-slate-800 uppercase tracking-tight leading-none">
                            System Security
                        </h2>
                        <p className="text-[9px] text-slate-400 font-normal uppercase tracking-[0.25em] mt-2">Security Console & Management Hub</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[9px] font-normal text-slate-500 uppercase tracking-widest">Admin Mode</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Global Alerts Section */}
                    <div className="flex flex-col">
                        <SectionHeader label="Global Alerts" />
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-8 flex flex-col h-fit">
                            <textarea 
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl h-24 sm:h-28 outline-none focus:ring-2 focus:ring-indigo-500/10 font-normal text-xs text-slate-600 transition-all resize-none mb-4" 
                                placeholder="System-wide notification text..." 
                                value={msgBody} 
                                onChange={e => setMsgBody(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <select value={msgType} onChange={(e: any) => setMsgType(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-normal uppercase tracking-widest text-slate-400 outline-none">
                                    <option value="info">Info</option>
                                    <option value="critical">Critical</option>
                                </select>
                                <button onClick={handleBroadcast} disabled={isSending} className="flex-1 py-3 bg-slate-900 hover:bg-black text-white font-normal rounded-xl shadow-lg transition-all text-[10px] uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50">
                                    {isSending ? 'Sending' : 'Dispatch Alert'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Access Management Section */}
                    <div className="flex flex-col">
                        <SectionHeader label="System Access" />
                        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-8 flex flex-col h-fit">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4 border border-slate-50">
                                <div>
                                    <span className="text-xs font-normal text-slate-800 uppercase tracking-tight">Maintenance Mode</span>
                                    <p className="text-[8px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Restrict system state</p>
                                </div>
                                <button onClick={() => setMaintMode(!maintMode)} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${maintMode ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'bg-slate-200'}`}>
                                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${maintMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            <input type="text" value={maintMessage} onChange={(e) => setMaintMessage(e.target.value)} placeholder="Display message..." className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-normal text-slate-700 outline-none text-xs mb-4" />
                            <button onClick={handleSaveMaintenance} disabled={isSavingMaint} className="w-full py-3 bg-slate-900 hover:bg-black text-white font-normal rounded-xl shadow-lg transition-all text-[10px] uppercase tracking-[0.2em] active:scale-95">
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subscription Management Section */}
                <div className="flex flex-col">
                    <SectionHeader label="License Status" />
                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-normal uppercase tracking-widest px-3 py-1 rounded-full border ${isExpired ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                    {daysRemaining} Days Left
                                </span>
                            </div>
                            <span className="text-[9px] font-normal text-slate-400 uppercase tracking-widest">Plan: {subscription?.plan || 'Enterprise'}</span>
                        </div>
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan Tier</label>
                                    <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-normal text-slate-700 outline-none">
                                        <option value="Standard">Standard Fleet</option>
                                        <option value="Enterprise">Enterprise Pro</option>
                                        <option value="Unlimited">Corporate Max</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Renewal Expiry</label>
                                    <input type="date" value={editExpiry} onChange={(e) => setEditExpiry(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-normal text-slate-700 outline-none" />
                                </div>
                                <div className="flex items-end">
                                    <button onClick={handleUpdateSubscription} disabled={isSavingSub} className="w-full py-3 bg-slate-900 hover:bg-black text-white font-normal rounded-xl shadow-lg transition-all text-[10px] uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50 h-[46px]">
                                        Sync License
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-slate-50 pt-4">
                                <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-[9px] font-normal text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">
                                    <svg className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                    Registry Audit Trail
                                </button>
                                {showHistory && (
                                    <div className="mt-4 bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100 max-h-32 overflow-y-auto scrollbar-hide animate-fadeIn">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                <tr>
                                                    <th className="px-4 py-2">Sync Date</th>
                                                    <th className="px-4 py-2">Tier</th>
                                                    <th className="px-4 py-2 text-right">Validity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {history.length === 0 ? (
                                                    <tr><td colSpan={3} className="px-4 py-4 text-[9px] text-slate-400 text-center italic">No prior renewal records detected.</td></tr>
                                                ) : history.map((item, idx) => (
                                                    <tr key={idx} className="text-[9px] text-slate-600">
                                                        <td className="px-4 py-2 font-mono uppercase opacity-60">{item.timestamp?.split('T')[0] || 'N/A'}</td>
                                                        <td className="px-4 py-2 font-normal uppercase tracking-tight">{item.plan || 'Standard'}</td>
                                                        <td className="px-4 py-2 text-right font-medium text-slate-400">{item.expiryDate || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-center py-2 shrink-0">
                    <p className="text-[9px] font-normal text-slate-300 uppercase tracking-[0.4em]">Proprietary Modular Framework v2.0</p>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceView;