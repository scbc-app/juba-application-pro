import React, { useState, useEffect, useRef } from 'react';
import { ValidationLists } from '../../types';

interface RequestInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    validationLists: ValidationLists;
    currentUserRole: string;
}

const RequestInspectionModal: React.FC<RequestInspectionModalProps> = ({ 
    isOpen, onClose, onSubmit, validationLists, currentUserRole 
}) => {
    if (!isOpen) return null;

    const [truckNo, setTruckNo] = useState('');
    const [trailerNo, setTrailerNo] = useState('');
    const [type, setType] = useState('General');
    const [priority, setPriority] = useState('Normal');
    const [reason, setReason] = useState('');
    const [inspector, setInspector] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [isTruckVerified, setIsTruckVerified] = useState(false);
    const [isInspectorVerified, setIsInspectorVerified] = useState(false);

    useEffect(() => { setIsTruckVerified(!!truckNo); }, [truckNo]);
    useEffect(() => { setIsInspectorVerified(!!inspector); }, [inspector]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!truckNo) newErrors.truckNo = "Required";
        if (!reason.trim()) newErrors.reason = "Required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsSubmitting(true);
        try {
            await onSubmit({ 
                truckNo, 
                trailerNo, 
                type, 
                priority, 
                reason,
                assignedInspector: inspector 
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const SelectField = ({ 
        label, 
        value, 
        onChange, 
        options, 
        placeholder = "Select...", 
        error, 
        isVerified, 
        isOptional = false 
    }: { 
        label: string, 
        value: string, 
        onChange: (val: string) => void, 
        options: string[], 
        placeholder?: string, 
        error?: string, 
        isVerified?: boolean, 
        isOptional?: boolean 
    }) => {
        const [showDropdown, setShowDropdown] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const wrapperRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            function handleClickOutside(event: any) {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                    setShowDropdown(false);
                }
            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [wrapperRef]);

        const filteredOptions = options.filter(opt => 
            String(opt).toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="relative" ref={wrapperRef}>
                <div className="flex justify-between items-center mb-1 px-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {label} {isOptional && <span className="text-slate-300 font-normal">(Optional)</span>}
                    </label>
                </div>
                
                <div 
                    onClick={() => { if (options.length > 0) setShowDropdown(!showDropdown); }}
                    className={`relative w-full p-3 bg-slate-50 border rounded-xl outline-none text-xs font-semibold text-slate-700 transition-all cursor-pointer flex items-center justify-between
                        ${error ? 'border-red-200 bg-red-50 text-red-900 shadow-sm' : showDropdown ? 'border-indigo-400 ring-2 ring-indigo-50 bg-white' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-100/50'}
                        ${options.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                >
                    <span className={`truncate mr-4 ${!value && 'text-slate-400 font-medium'}`}>
                        {value || (options.length === 0 ? "Empty" : placeholder)}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                        {isVerified && value && !error && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></div>
                        )}
                        <svg className={`w-3.5 h-3.5 text-slate-300 transition-transform ${showDropdown ? 'rotate-180 text-indigo-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                {showDropdown && options.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-40">
                        <div className="p-2 border-b border-slate-50 bg-slate-50 sticky top-0 shrink-0">
                            <input 
                                type="text" 
                                autoFocus
                                className="w-full px-3 py-1.5 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 placeholder-slate-300 font-medium"
                                placeholder="Filter..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="overflow-y-auto scrollbar-hide flex-1">
                            {filteredOptions.length === 0 ? (
                                <div className="p-4 text-center text-[10px] text-slate-400 uppercase">No results</div>
                            ) : (
                                filteredOptions.map((opt, idx) => (
                                    <div 
                                        key={idx}
                                        onClick={() => { onChange(opt); setShowDropdown(false); }}
                                        className={`px-4 py-2 text-xs cursor-pointer transition-all flex items-center justify-between border-b border-slate-50 last:border-0 
                                            ${value === opt ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50'}
                                        `}
                                    >
                                        {opt}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {error && <p className="text-[8px] text-red-500 font-bold mt-0.5 ml-1 uppercase tracking-wide">{error}</p>}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-white w-full max-w-lg rounded-[1.5rem] shadow-2xl overflow-hidden transform transition-all border border-slate-100 my-auto">
                
                {/* Compact Header */}
                <div className="bg-indigo-600 px-6 py-5 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Request Inspection</h3>
                            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest leading-none">Fleet Maintenance</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectField 
                                label="Truck Number *"
                                value={truckNo}
                                onChange={(v) => { setTruckNo(v); setErrors(prev => ({...prev, truckNo: ''})); }}
                                options={validationLists.trucks}
                                placeholder="Select Reg..."
                                error={errors.truckNo}
                                isVerified={isTruckVerified}
                            />
                            
                            <SelectField 
                                label="Trailer Number"
                                value={trailerNo}
                                onChange={(v) => { setTrailerNo(v); setErrors(prev => ({...prev, trailerNo: ''})); }}
                                options={validationLists.trailers}
                                placeholder="Link Trailer..."
                                isOptional={true}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <SelectField 
                                label="Type of Check"
                                value={type}
                                onChange={setType}
                                options={['General', 'Petroleum', 'Petroleum_V2', 'Acid']}
                            />
                            
                            <SelectField 
                                label="Priority"
                                value={priority}
                                onChange={setPriority}
                                options={['Normal', 'Urgent', 'Safety Concern']}
                            />
                        </div>

                        <SelectField 
                            label="Assign to Inspector"
                            value={inspector}
                            onChange={(v) => { setInspector(v); setErrors(prev => ({...prev, inspector: ''})); }}
                            options={validationLists.inspectors}
                            placeholder="Optional"
                            isVerified={isInspectorVerified}
                            isOptional={true}
                        />

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Notes / Instructions *</label>
                            <textarea 
                                className={`w-full p-4 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 text-xs font-semibold h-20 placeholder-slate-300 resize-none transition-all
                                    ${errors.reason ? 'border-red-200 bg-red-50 text-red-900' : 'border-slate-100 focus:border-indigo-400'}
                                `}
                                placeholder="Details for the inspector..."
                                value={reason}
                                onChange={(e) => { setReason(e.target.value); setErrors(prev => ({...prev, reason: ''})); }}
                                required
                            ></textarea>
                            {errors.reason && <p className="text-[8px] text-red-500 font-bold mt-0.5 ml-1 uppercase tracking-wide">{errors.reason}</p>}
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95
                                    ${isSubmitting ? 'bg-slate-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Submit Request
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RequestInspectionModal;