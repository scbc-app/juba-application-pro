
import React, { useState, useRef } from 'react';
import { ValidationLists } from '../types';

interface FleetRegistryViewProps {
    appScriptUrl: string;
    validationLists: ValidationLists;
    onRefresh: () => void;
    // Fix: Added 'warning' to the allowed types for showToast
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    isLocked?: boolean;
}

const FleetRegistryView: React.FC<FleetRegistryViewProps> = ({ 
    appScriptUrl, validationLists, onRefresh, showToast, isLocked 
}) => {
    const [newTruck, setNewTruck] = useState('');
    const [newTrailer, setNewTrailer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddAsset = async (type: 'truck' | 'trailer') => {
        const val = type === 'truck' ? newTruck : newTrailer;
        if (!val.trim() || isLocked) return;
        setIsSubmitting(true);
        try {
            await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'manage_fleet', type, value: val.trim().toUpperCase() }),
                mode: 'no-cors'
            });
            showToast(`${type === 'truck' ? 'Truck' : 'Trailer'} added`, "success");
            if (type === 'truck') setNewTruck(''); else setNewTrailer('');
            setTimeout(onRefresh, 1000);
        } finally { setIsSubmitting(false); }
    };

    const downloadSampleCsv = () => {
        const csvContent = "Truck,Trailer\nABC 123,T-100\nXYZ 789,T-200";
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "fleet_registry_sample.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || isLocked) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            if (!content) return;
            setIsImporting(true);
            try {
                const lines = content.split(/\r?\n/);
                const trucks: string[] = [];
                const trailers: string[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const [truck, trailer] = line.split(',').map(s => s?.trim().toUpperCase() || "");
                    if (truck) trucks.push(truck);
                    if (trailer) trailers.push(trailer);
                }
                if (trucks.length === 0 && trailers.length === 0) {
                    showToast("No data found", "warning");
                    return;
                }
                await fetch(appScriptUrl, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'bulk_manage_fleet', trucks, trailers }),
                    mode: 'no-cors'
                });
                showToast("Import complete", "success");
                setTimeout(onRefresh, 1500);
            } finally { 
                setIsImporting(false); 
                if (fileInputRef.current) fileInputRef.current.value = ""; 
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 py-4 px-4 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Fleet Registry</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Validated Asset Management</p>
                </div>
                <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button 
                            onClick={downloadSampleCsv}
                            className="flex-1 sm:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Sample
                        </button>
                        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLocked || isImporting}
                            className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            {isImporting ? 'Processing File...' : 'Upload Registry CSV'}
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Format: Truck,Trailer (No spaces)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <input type="text" placeholder="New Truck Reg..." className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-50" value={newTruck} onChange={e => setNewTruck(e.target.value)} />
                        <button onClick={() => handleAddAsset('truck')} disabled={isSubmitting || !newTruck.trim() || isLocked} className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest disabled:opacity-30">Add</button>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-slate-100/50 border-b border-slate-200/50 flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Truck List</span><span className="text-[10px] font-bold text-slate-300">{validationLists.trucks.length} Units</span></div>
                        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                            {validationLists.trucks.map((t, i) => <div key={i} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900">{t}</div>)}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-2">
                        <input type="text" placeholder="New Trailer ID..." className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-emerald-50" value={newTrailer} onChange={e => setNewTrailer(e.target.value)} />
                        <button onClick={() => handleAddAsset('trailer')} disabled={isSubmitting || !newTrailer.trim() || isLocked} className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest disabled:opacity-30">Add</button>
                    </div>
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-4 bg-slate-100/50 border-b border-slate-200/50 flex justify-between"><span className="text-[10px] font-black text-slate-400 uppercase">Trailer List</span><span className="text-[10px] font-bold text-slate-300">{validationLists.trailers.length} Units</span></div>
                        <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                            {validationLists.trailers.map((t, i) => <div key={i} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900">{t}</div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FleetRegistryView;