
import React from 'react';

interface UpgradeModalProps {
    featureName: string | null;
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ featureName, onClose }) => {
    if (!featureName) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
                {/* Decorative Top Bar */}
                <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600"></div>
                
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-sm">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>

                    <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                        Module Locked
                    </h3>
                    <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full mb-6 border border-slate-200">
                        {featureName}
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        This advanced Operations feature is part of the <strong>Enterprise Suite</strong>. 
                        To access the <span className="font-semibold text-gray-800">{featureName}</span>, 
                        your organization requires a system upgrade.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left mb-6">
                        <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Features Included in Upgrade:</h4>
                        <ul className="text-xs text-blue-700 space-y-1.5 list-disc pl-4">
                            <li>Real-time Journey Tracking</li>
                            <li>Digital Fuel Reconciliation</li>
                            <li>Automated Gate Pass Generation</li>
                            <li>Driver Performance Analytics</li>
                        </ul>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-200"
                    >
                        Acknowledge
                    </button>
                    
                    <p className="mt-4 text-[10px] text-gray-400">
                        Contact your System Administrator for access rights.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
