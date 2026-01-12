import React, { useState, useMemo } from 'react';
import { InspectionData } from '../../types';
import SubscriptionLock from '../ui/SubscriptionLock';

interface DashboardTemplateProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    colorTheme: 'emerald' | 'orange' | 'rose' | 'purple' | 'blue' | 'slate';
    stats: { total: number, passRate: number | string };
    startNewInspection: () => void;
    fetchHistory: (force?: boolean) => void;
    isLoadingHistory: boolean;
    historyList: InspectionData[];
    onViewReport: (item: InspectionData) => void;
    onPrint: (item: InspectionData) => void;
    userRole?: string;
    titlePrefix?: string;
    isLocked?: boolean;
    lockReason?: 'maintenance' | 'license';
    maintenanceMessage?: string;
}

const DashboardTemplate: React.FC<DashboardTemplateProps> = ({ 
    title, description, icon, colorTheme, stats, 
    startNewInspection, fetchHistory, isLoadingHistory, historyList, 
    onViewReport, onPrint, userRole, titlePrefix = "INSPECTION",
    isLocked = false,
    lockReason = 'license',
    maintenanceMessage
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const displayList = useMemo(() => {
        let list = historyList;
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            list = list.filter(item => 
                (item.truckNo && item.truckNo.toLowerCase().includes(lowerSearch)) ||
                (item.driverName && item.driverName.toLowerCase().includes(lowerSearch)) ||
                (item.inspectedBy && item.inspectedBy.toLowerCase().includes(lowerSearch))
            );
        } else {
            list = list.slice(0, 10);
        }
        return list;
    }, [historyList, searchTerm]);

    const isSuperAdmin = userRole === 'SuperAdmin';
    const canCreate = (userRole === 'Admin' || userRole === 'Inspector' || userRole === 'SuperAdmin') && !isLocked;

    const theme = { btn: 'bg-slate-900', text: 'text-slate-600', bg: 'bg-slate-50', border: "border-slate-200" };

    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn py-1">
          <SubscriptionLock 
            isLocked={isLocked} 
            lockReason={lockReason} 
            maintenanceMessage={maintenanceMessage}
            isSuperAdmin={isSuperAdmin}
          >
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                   <div className="flex-1">
                       <div className="flex items-center gap-3 mb-2">
                           <span className={`p-2.5 rounded-2xl ${theme.bg} ${theme.text} shadow-inner`}>{icon}</span>
                           <h2 className="text-2xl font-medium text-slate-800 tracking-tight uppercase">{title}</h2>
                       </div>
                       {description && <p className="text-slate-500 text-xs leading-relaxed max-w-md font-normal mb-6">{description}</p>}
                       
                       <div className="flex flex-wrap gap-4">
                           {canCreate && (
                               <button 
                                 onClick={startNewInspection}
                                 className="relative px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black rounded-2xl transition-all flex items-center gap-3 uppercase tracking-[0.2em] shadow-[0_10px_20px_-5px_rgba(15,23,42,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(15,23,42,0.4)] active:scale-[0.96] group/btn border-t border-white/10"
                               >
                                   <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center group-hover/btn:scale-110 group-hover/btn:rotate-90 transition-all duration-300">
                                       <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 4v16m8-8H4"></path></svg>
                                   </div>
                                   New Check
                               </button>
                           )}
                           
                           <button 
                             onClick={() => fetchHistory(true)}
                             disabled={isLoadingHistory}
                             className="px-6 py-3 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-2xl hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center gap-2.5 uppercase tracking-widest active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-wait"
                           >
                               <svg className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                               Refresh History
                           </button>
                       </div>
                   </div>
                   
                   <div className="flex gap-5">
                       <div className="bg-slate-50 rounded-[1.5rem] p-5 text-center min-w-[100px] border border-slate-100 shadow-inner">
                           <div className="text-3xl font-medium text-slate-800 leading-none">{stats.total}</div>
                           <div className="text-[9px] text-slate-400 uppercase font-medium tracking-[0.2em] mt-3">Verified</div>
                       </div>
                       <div className="bg-emerald-50 rounded-[1.5rem] p-5 text-center min-w-[100px] border border-emerald-100 shadow-inner">
                           <div className="text-3xl font-medium text-emerald-600 leading-none">{stats.passRate}%</div>
                           <div className="text-[9px] text-slate-400 uppercase font-medium tracking-[0.2em] mt-3">Pass Rate</div>
                       </div>
                   </div>
              </div>
          </SubscriptionLock>

          {/* Table Container */}
          <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-4">
                      <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Audit History</h3>
                      {isLocked && (
                          <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase tracking-tighter">
                              {lockReason === 'maintenance' ? 'Maintenance Access' : 'Read Only Access'}
                          </span>
                      )}
                  </div>
                  <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Search assets..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-44 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] outline-none font-normal focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
                    />
                  </div>
              </div>

              {isLoadingHistory ? (
                  <div className="py-24 text-center">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mx-auto mb-5"></div>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">Syncing Records</p>
                  </div>
              ) : displayList.length === 0 ? (
                  <div className="py-24 text-center text-[11px] font-medium text-slate-300 uppercase tracking-[0.3em]">Vault is empty</div>
              ) : (
                  <div className="w-full">
                      <div className="hidden md:grid grid-cols-12 px-8 py-5 border-b border-slate-50 bg-slate-50/10 text-[10px] font-medium text-slate-400 uppercase tracking-[0.25em]">
                          <div className="col-span-1">Rate</div>
                          <div className="col-span-3">Vehicle Asset</div>
                          <div className="col-span-3">Audit Date</div>
                          <div className="col-span-3">Personnel</div>
                          <div className="col-span-2 text-right">Document</div>
                      </div>
                      
                      <div className="divide-y divide-slate-50">
                          {displayList.map((item, i) => (
                              <div key={i} className="md:grid md:grid-cols-12 flex flex-col md:items-center px-8 py-6 hover:bg-slate-50/30 transition-colors gap-4 md:gap-0 relative group">
                                  <div className="col-span-1">
                                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-[12px] font-medium text-white shadow-sm
                                          ${Number(item.rate) >= 4 ? 'bg-emerald-500' : Number(item.rate) === 3 ? 'bg-amber-500' : 'bg-rose-500'}
                                      `}>
                                          {item.rate}
                                      </span>
                                  </div>

                                  <div className="col-span-3 min-w-0">
                                      <div className="md:hidden text-[9px] font-medium text-slate-300 uppercase tracking-widest mb-1">Vehicle Asset</div>
                                      <div className="font-medium text-slate-800 text-base leading-tight truncate uppercase tracking-tight">{item.truckNo}</div>
                                      {item.trailerNo && <div className="text-[10px] text-slate-400 font-normal uppercase tracking-wide mt-0.5">{item.trailerNo}</div>}
                                  </div>

                                  <div className="col-span-3">
                                      <div className="md:hidden text-[9px] font-medium text-slate-300 uppercase tracking-widest mb-1">Audit Date</div>
                                      <div className="text-xs font-normal text-slate-700">{new Date(item.timestamp).toLocaleDateString()}</div>
                                      <div className="text-[9px] text-slate-400 font-normal uppercase mt-0.5">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  </div>

                                  <div className="col-span-3">
                                      <div className="md:hidden text-[9px] font-medium text-slate-300 uppercase tracking-widest mb-1">Personnel</div>
                                      <div className="flex items-center gap-3">
                                          <div className="hidden md:flex w-8 h-8 rounded-xl bg-slate-100 items-center justify-center text-[10px] font-medium text-slate-400 border border-slate-200 uppercase shadow-sm">
                                              {String(item.inspectedBy || '?').charAt(0)}
                                          </div>
                                          <span className="text-slate-600 font-normal text-xs truncate">{item.inspectedBy}</span>
                                      </div>
                                  </div>

                                  <div className="col-span-2 text-right border-t md:border-none pt-4 md:pt-0">
                                      <button 
                                        onClick={() => onViewReport(item)}
                                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all uppercase tracking-widest border border-indigo-100 shadow-sm active:scale-95 group/btn"
                                      >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                          View Report
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    );
};

export default DashboardTemplate;