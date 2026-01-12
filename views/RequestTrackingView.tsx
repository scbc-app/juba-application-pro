
import React, { useEffect, useState } from 'react';
import { User } from '../types';

interface RequestTrackingViewProps {
    appScriptUrl: string;
    currentUser: User | null;
    // Fix: Updated showToast type signature to include 'warning'
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onRequestNew?: () => void;
}

interface RequestItem {
    id: string;
    requester: string;
    truck: string;
    trailer: string;
    type: string;
    reason: string;
    priority: string;
    assignedTo: string;
    status: string;
    timestamp: string;
}

const RequestTrackingView: React.FC<RequestTrackingViewProps> = ({ appScriptUrl, currentUser, showToast, onRequestNew }) => {
    const [requests, setRequests] = useState<RequestItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isLocked = (window as any).isSubscriptionLocked || false;

    useEffect(() => {
        fetchRequests();
        // Background refresh every 60 seconds
        const interval = setInterval(fetchRequests, 60000);
        return () => clearInterval(interval);
    }, [currentUser?.username, appScriptUrl]);

    const fetchRequests = async () => {
        if (!appScriptUrl || !currentUser) return;
        
        // Only show full loader on first load
        if (requests.length === 0) setIsLoading(true);
        
        try {
            const response = await fetch(`${appScriptUrl}?t=${new Date().getTime()}`);
            const json = await response.json();
            
            const reqSheet = json['Inspection_Requests'];
            if (reqSheet && Array.isArray(reqSheet) && reqSheet.length > 1) {
                const allMapped = reqSheet.slice(1)
                    .map((row: any[]) => ({
                        id: row[0],
                        requester: row[1],
                        truck: row[3],
                        trailer: row[4],
                        type: row[5],
                        reason: row[6],
                        priority: row[7],
                        assignedTo: row[8],
                        status: row[9] || 'Pending',
                        timestamp: row[10]
                    }));

                const filtered = allMapped.filter((req: RequestItem) => {
                    const role = currentUser.role.toLowerCase();
                    // Admins see everything
                    if (role === 'admin' || role === 'superadmin') return true;
                    
                    const myName = String(currentUser.name || '').toLowerCase();
                    const isRequester = String(req.requester).toLowerCase() === myName;
                    const isAssigned = String(req.assignedTo).toLowerCase() === myName;
                    const isUnassigned = String(req.assignedTo).toLowerCase() === 'unassigned';
                    
                    // Inspectors see their assigned work, unassigned work, or stuff they requested
                    if (role === 'inspector') {
                        return isAssigned || isUnassigned || isRequester;
                    }
                    
                    // Default: only see what you requested
                    return isRequester;
                }).sort((a: RequestItem, b: RequestItem) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                setRequests(filtered);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error("Failed to fetch requests", error);
            if (requests.length === 0) showToast("Failed to load requests.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const completedCount = requests.filter(r => r.status === 'Completed').length;
    const completionRate = requests.length > 0 ? Math.round((completedCount / requests.length) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        </div>
                        Inspection Requests & Tracking
                    </h2>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Fleet Request Pipeline Summary</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    {onRequestNew && (
                        <button 
                            onClick={onRequestNew}
                            disabled={isLocked}
                            className={`flex-1 md:flex-none px-6 py-3 text-white font-bold rounded-xl shadow-lg transition-all transform flex items-center justify-center gap-2 text-xs uppercase tracking-widest
                                ${isLocked ? 'bg-slate-300 cursor-not-allowed grayscale' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'}
                            `}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                            {isLocked ? 'Locked' : 'New Request'}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Queue</p>
                        <h3 className="text-3xl font-black text-amber-500">{pendingCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Finished</p>
                        <h3 className="text-3xl font-black text-emerald-600">{completedCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Fulfillment</p>
                        <h3 className="text-3xl font-black text-indigo-600">{completionRate}%</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                </div>
            </div>

            {/* Request List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="block md:table w-full">
                    <div className="bg-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-gray-100 hidden md:table-header-group">
                        <div className="md:table-row">
                            <div className="md:table-cell px-8 py-5">Status</div>
                            <div className="md:table-cell px-8 py-5">Vehicle</div>
                            <div className="md:table-cell px-8 py-5">Order Detail</div>
                            <div className="md:table-cell px-8 py-5">Personnel</div>
                            <div className="md:table-cell px-8 py-5 text-right">Requested</div>
                        </div>
                    </div>
                    <div className="block md:table-row-group divide-y divide-gray-100">
                        {isLoading ? (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest">Updating Pipeline...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="p-16 text-center">
                                <h3 className="text-gray-800 font-bold mb-1">Queue Empty</h3>
                                <p className="text-sm text-gray-400">No active inspection requests found.</p>
                            </div>
                        ) : requests.map((req) => (
                            <div key={req.id} className="hover:bg-gray-50 transition block md:table-row p-6 md:p-0 relative">
                                <div className="md:table-cell md:px-8 md:py-6 block mb-4 md:mb-0">
                                    {req.status === 'Completed' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            Fulfilled
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                            Active
                                        </span>
                                    )}
                                </div>
                                <div className="md:table-cell md:px-8 md:py-6 block mb-4 md:mb-0">
                                    <div className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Vehicle Asset</div>
                                    <div className="font-bold text-gray-800 text-base uppercase">{req.truck}</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{req.trailer || 'Stand-alone Unit'}</div>
                                </div>
                                <div className="md:table-cell md:px-8 md:py-6 block mb-4 md:mb-0">
                                    <div className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Classification</div>
                                    <div className="text-xs font-bold text-gray-700">{req.type} Check</div>
                                    <div className={`text-[10px] font-black uppercase mt-0.5 tracking-wider ${
                                        req.priority === 'Critical' || req.priority === 'Urgent' || req.priority === 'Safety Concern' ? 'text-red-600' : 'text-slate-400'
                                    }`}>
                                        {req.priority} Priority
                                    </div>
                                </div>
                                <div className="md:table-cell md:px-8 md:py-6 block mb-4 md:mb-0">
                                    <div className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Assigned Resource</div>
                                    {req.assignedTo && req.assignedTo !== 'Unassigned' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 shadow-sm">
                                                {req.assignedTo.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-gray-600 font-bold text-xs">{req.assignedTo}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-[11px] font-medium tracking-wide">Pending Dispatch</span>
                                    )}
                                </div>
                                <div className="md:table-cell md:px-8 md:py-6 md:text-right block text-slate-400 font-mono text-[11px] pt-4 md:pt-6 border-t md:border-0 border-gray-50">
                                    <div className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Order Date</div>
                                    {new Date(req.timestamp).toLocaleDateString()}
                                    <div className="text-[9px] opacity-60 uppercase font-black">{new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestTrackingView;