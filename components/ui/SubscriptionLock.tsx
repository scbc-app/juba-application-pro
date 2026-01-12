import React from 'react';

interface SubscriptionLockProps {
    isLocked: boolean;
    children: React.ReactNode;
    isSuperAdmin?: boolean;
    onUnlock?: () => void;
    lockReason?: 'maintenance' | 'license';
    maintenanceMessage?: string;
}

const SubscriptionLock: React.FC<SubscriptionLockProps> = ({ 
    isLocked, 
    children, 
    isSuperAdmin, 
    onUnlock, 
    lockReason = 'license',
    maintenanceMessage 
}) => {
    return (
        <div className="relative">
            {/* Content Area */}
            <div className={`transition-all duration-500 ${isLocked ? 'opacity-40 pointer-events-none select-none grayscale' : ''}`}>
                {children}
            </div>

            {/* Dynamic Lock Overlay */}
            {isLocked && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center transform scale-100 animate-fadeIn">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner ${lockReason === 'maintenance' ? 'bg-amber-100' : 'bg-red-100'}`}>
                            {lockReason === 'maintenance' ? (
                                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            ) : (
                                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            )}
                        </div>
                        
                        <h2 className="text-xl font-black text-slate-800 mb-1">Action Restricted</h2>
                        
                        <div className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                            {lockReason === 'maintenance' ? (
                                <p>
                                    System is in <strong>View-Only</strong> mode for scheduled maintenance.<br/>
                                    <span className="text-slate-400 mt-1 block italic">"{maintenanceMessage || 'Updating core services...'}"</span>
                                </p>
                            ) : (
                                <p>
                                    System is in <strong>View-Only</strong> mode because the license has expired. No new records or updates can be added.
                                </p>
                            )}
                        </div>

                        {isSuperAdmin && lockReason === 'license' ? (
                            <button 
                                onClick={onUnlock}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                            >
                                Manage License
                            </button>
                        ) : isSuperAdmin && lockReason === 'maintenance' ? (
                            <button 
                                onClick={onUnlock}
                                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                            >
                                Security Console
                            </button>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-normal">
                                    {lockReason === 'maintenance' 
                                        ? "Please check back later once maintenance is complete."
                                        : "Please notify your supervisor to restore full administrative access."
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionLock;