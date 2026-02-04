import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, SystemSettings, SupportTicket, TicketComment, ValidationLists } from '../types';

interface SupportViewProps {
    appScriptUrl: string;
    currentUser: User | null;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    settings?: SystemSettings;
    validationLists?: ValidationLists;
    prefillData?: { subject: string, description: string } | null;
    onPrefillConsumed?: () => void;
}

const TicketList: React.FC<{
    tickets: SupportTicket[]; isLoading: boolean; onRefresh: () => void; onSelect: (t: SupportTicket) => void; isAdmin: boolean; filterStatus: string;
}> = ({ tickets, isLoading, onRefresh, onSelect, filterStatus }) => {
    const filtered = useMemo(() => {
        if (filterStatus === 'OPEN') return tickets.filter(t => t.status === 'Open' || t.status === 'In Progress');
        if (filterStatus === 'CLOSED') return tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
        return tickets;
    }, [tickets, filterStatus]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-700">Help History ({filtered.length})</span>
                <button onClick={onRefresh} className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-colors shadow-sm">Refresh List</button>
            </div>
            <div className="divide-y divide-gray-100">
                {isLoading ? <div className="p-12 text-center text-gray-400 font-medium">Checking for updates...</div> :
                 filtered.length === 0 ? <div className="p-16 text-center text-gray-400 italic font-medium">No help requests found yet.</div> :
                 filtered.map(t => (
                    <div key={t.ticketId} onClick={() => onSelect(t)} className="p-5 hover:bg-slate-50 cursor-pointer transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">Request #{t.ticketId}: {t.subject}</span>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter border ${
                                t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}>
                                {t.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate font-medium">{t.description}</p>
                        <div className="mt-3 flex items-center gap-2">
                             <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(t.timestamp).toLocaleDateString()}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                             <span className="text-[9px] font-bold text-slate-300 uppercase">{t.user}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TicketDetail: React.FC<{
    ticket: SupportTicket; currentUser: User | null; isAdmin: boolean; onClose: () => void; onReply: (msg: string) => void; isSendingReply: boolean; isLocked?: boolean;
}> = ({ ticket, currentUser, isAdmin, onClose, onReply, isSendingReply, isLocked }) => {
    const [replyText, setReplyText] = useState('');
    const handleSend = () => { if(!replyText.trim() || isLocked) return; onReply(replyText); setReplyText(''); };
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-[600px] animate-fadeIn">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <button onClick={onClose} className="text-[10px] font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                    Go Back
                </button>
                <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800 uppercase tracking-tight text-sm">{ticket.subject}</span>
                    {isLocked && <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase">View Only</span>}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
                {/* Initial Description */}
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm mb-4">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Original Problem</p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{ticket.description}</p>
                </div>

                {ticket.comments?.map((c, i) => {
                    const roleLower = c.role?.toLowerCase() || '';
                    const isStaff = roleLower === 'admin' || roleLower === 'superadmin';
                    const displayIdentity = isStaff ? 'Support' : c.user;

                    return (
                        <div key={i} className={`p-4 rounded-2xl shadow-sm border ${c.user === currentUser?.name ? 'bg-indigo-600 text-white ml-auto border-indigo-500' : 'bg-white text-gray-700 mr-auto border-slate-100'} max-w-[90%] md:max-w-[80%]`}>
                            <div className="flex justify-between items-center mb-1.5 gap-6">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-70">
                                    {displayIdentity} {!isStaff && c.role && `(${c.role})`}
                                </p>
                                <p className="text-[8px] font-bold opacity-50 uppercase">{new Date(c.timestamp).toLocaleDateString()} {new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <p className="text-sm font-semibold leading-relaxed">{c.message}</p>
                        </div>
                    );
                })}
            </div>
            {!isLocked && (
                <div className="p-4 border-t bg-white flex gap-3 items-center">
                    <input className="flex-1 border border-slate-200 rounded-xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none transition-all placeholder:text-slate-300" placeholder="Type your reply here..." value={replyText} onChange={e => setReplyText(e.target.value)} />
                    <button onClick={handleSend} disabled={isSendingReply || !replyText.trim()} className="h-[52px] px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 disabled:bg-slate-300 disabled:shadow-none uppercase tracking-[0.2em] text-[10px]">
                        {isSendingReply ? <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : null}
                        {isSendingReply ? 'Sending' : 'Send'}
                    </button>
                </div>
            )}
        </div>
    );
};

const SupportView: React.FC<SupportViewProps> = ({ appScriptUrl, currentUser, showToast, settings, prefillData, onPrefillConsumed }) => {
    const isLocked = (window as any).isSubscriptionLocked || false;
    const [activeTab, setActiveTab] = useState<'create' | 'list'>(isLocked ? 'list' : 'create');
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [formData, setFormData] = useState({ subject: '', description: '', priority: 'Medium' });

    // Handle Prefill Data
    useEffect(() => {
        if (prefillData) {
            setFormData({
                subject: prefillData.subject,
                description: prefillData.description,
                priority: 'Medium'
            });
            setActiveTab('create');
            if (onPrefillConsumed) onPrefillConsumed();
        }
    }, [prefillData]);

    const fetchTickets = async () => {
        if (!appScriptUrl || !currentUser) return;
        setIsLoading(true);
        try {
            const resp = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'get_tickets', email: currentUser.username, role: currentUser.role }) });
            const res = await resp.json();
            if (res.status === 'success') setTickets(res.tickets);
        } finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLocked) {
            showToast("Action restricted: License expired.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = { action: 'submit_support_ticket', type: 'Issue', ...formData, user: currentUser?.name, email: currentUser?.username, role: currentUser?.role };
            const resp = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify(payload) });
            const res = await resp.json();
            if (res.status === 'success') {
                showToast("Your request has been sent to the team.", "success");
                setFormData({ subject: '', description: '', priority: 'Medium' });
                setActiveTab('list');
                fetchTickets();
            }
        } catch (e) { showToast("Sending failed. Check connection.", "error"); } finally { setIsSubmitting(false); }
    };

    const handleReply = async (message: string) => {
        if (!selectedTicket || isLocked) return;
        setIsSendingReply(true);
        try {
            const comment = { user: currentUser?.name, role: currentUser?.role, message, timestamp: new Date().toISOString() };
            await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'update_ticket', ticketId: selectedTicket.ticketId, comment }), mode: 'no-cors' });
            const updated = { ...selectedTicket, comments: [...selectedTicket.comments, comment as any] };
            setSelectedTicket(updated);
            setTickets(ts => ts.map(t => t.ticketId === updated.ticketId ? updated : t));
            showToast("Reply sent.", "success");
        } finally { setIsSendingReply(false); }
    };

    const handleShareApp = async () => {
        if (!settings) return;
        const shareData = {
            title: settings.companyName || 'SafetyCheck Pro',
            text: `Access the ${settings.companyName || 'Fleet'} Inspection Portal here:`,
            url: settings.webAppUrl || window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                showToast("Portal link copied to clipboard.", "info");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn pb-24 px-4 md:px-0 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl shrink-0 shadow-sm border border-amber-50">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">Help & Support</h2>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-3">Get help with the app or report a problem</p>
                    </div>
                </div>
                {isLocked && (
                    <span className="px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">View-Only Mode</span>
                )}
            </div>

            <div className="flex gap-3 bg-slate-100/50 p-2 rounded-2xl w-fit border border-slate-200/50 shadow-inner">
                <button 
                    onClick={() => !isLocked && setActiveTab('create')} 
                    disabled={isLocked}
                    className={`px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'create' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400'} ${isLocked ? 'opacity-30 cursor-not-allowed grayscale' : 'hover:text-indigo-500'}`}
                >
                    Ask for Help
                </button>
                <button onClick={() => setActiveTab('list')} className={`px-8 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400'} hover:text-indigo-500`}>See My Requests</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    {activeTab === 'create' ? (
                        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 animate-fadeIn">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Send a Help Request</h3>
                            <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Tell us what's wrong and we'll look into it as soon as possible.</p>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">What is the problem? (Short Title)</label>
                                    <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-normal" placeholder="e.g. Can't sync my reports" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Explain the problem in detail</label>
                                    <textarea className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 h-44 outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none placeholder:font-normal" placeholder="Describe what happened..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                                </div>
                                <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black rounded-2xl flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 active:scale-95 transition-all text-xs uppercase tracking-[0.3em]">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Help Request
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : selectedTicket ? (
                        <TicketDetail ticket={selectedTicket} currentUser={currentUser} isAdmin={currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin'} onClose={() => setSelectedTicket(null)} onReply={handleReply} isSendingReply={isSendingReply} isLocked={isLocked} />
                    ) : (
                        <TicketList tickets={tickets} isLoading={isLoading} onRefresh={fetchTickets} onSelect={setSelectedTicket} isAdmin={currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin'} filterStatus="ALL" />
                    )}
                </div>

                <div className="space-y-6">
                    {/* Share Application Section */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg animate-fadeIn">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Share Application</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Invite colleagues or save the link to your device for quick access.</p>
                        <button 
                            onClick={handleShareApp}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em]"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                            Share Access Link
                        </button>
                    </div>

                    <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                        <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4">Support Hours</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-indigo-400 uppercase tracking-tighter">Mon - Fri</span>
                                <span className="text-indigo-900">08:00 - 17:00</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-indigo-400 uppercase tracking-tighter">Saturday</span>
                                <span className="text-indigo-900">09:00 - 13:00</span>
                            </div>
                            <div className="pt-4 border-t border-indigo-200/50">
                                <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">Critical system outages are monitored 24/7 by our technical response team.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportView;