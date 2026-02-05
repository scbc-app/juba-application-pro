import React, { useState, useEffect } from 'react';
import { InspectionData, InspectionStatus, InspectionItemConfig, ValidationLists, SystemSettings } from '../types';
import { INSPECTION_ITEMS, INSPECTION_CATEGORIES, PETROLEUM_INSPECTION_ITEMS, PETROLEUM_CATEGORIES, ACID_INSPECTION_ITEMS, ACID_CATEGORIES, PETROLEUM_V2_ITEMS, PETROLEUM_V2_CATEGORIES, SECTIONS } from '../constants';
import CameraCapture from '../components/CameraCapture';
import SignaturePad from '../components/SignaturePad';
import StatusButton from '../components/ui/StatusButton';
import Input from '../components/ui/Input';
import AutocompleteInput from '../components/ui/AutocompleteInput';

interface InspectionFormViewProps {
    initialData: InspectionData;
    activeModule: string;
    validationLists: ValidationLists;
    settings: SystemSettings;
    onSaveDraft: (data: InspectionData) => void;
    onSubmit: (data: InspectionData) => void;
    onExit: () => void;
    submissionStatus: 'idle' | 'submitting' | 'success' | 'offline_saved';
    onViewReport: (data: InspectionData) => void;
}

const InspectionFormView: React.FC<InspectionFormViewProps> = ({ 
    initialData, activeModule, validationLists, onSaveDraft, onSubmit, onExit, submissionStatus
}) => {
    const [formData, setFormData] = useState<InspectionData & any>(initialData);
    const [currentSection, setCurrentSection] = useState(0);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [showDraftSaved, setShowDraftSaved] = useState(false);

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const next = {...prev};
                delete next[field];
                return next;
            });
        }
    };

    const handleSaveDraftLocal = () => {
        onSaveDraft(formData);
        setShowDraftSaved(true);
        setTimeout(() => setShowDraftSaved(false), 2000);
    };

    const getItemsForStep = (stepIndex: number): InspectionItemConfig[] => {
        let categories: string[] = [];
        let sourceItems: InspectionItemConfig[] = [];

        if (activeModule === 'general') sourceItems = INSPECTION_ITEMS;
        else if (activeModule === 'petroleum') sourceItems = PETROLEUM_INSPECTION_ITEMS;
        else if (activeModule === 'petroleum_v2') sourceItems = PETROLEUM_V2_ITEMS;
        else if (activeModule === 'acid') sourceItems = ACID_INSPECTION_ITEMS;

        if (activeModule === 'general') {
            if (stepIndex === 2) categories = [INSPECTION_CATEGORIES.PPE, INSPECTION_CATEGORIES.DOCUMENTATION];
            if (stepIndex === 3) categories = [INSPECTION_CATEGORIES.VEHICLE_EXTERIOR, INSPECTION_CATEGORIES.LIGHTS_ELECTRICAL];
            if (stepIndex === 4) categories = [INSPECTION_CATEGORIES.MECHANICAL, INSPECTION_CATEGORIES.TRAILER];
        } else if (activeModule === 'petroleum') {
            if (stepIndex === 2) categories = [PETROLEUM_CATEGORIES.TRUCK_EQUIPMENT];
            if (stepIndex === 3) categories = [PETROLEUM_CATEGORIES.TYRES, PETROLEUM_CATEGORIES.PPE_ID];
            if (stepIndex === 4) categories = [PETROLEUM_CATEGORIES.DOCUMENTS, PETROLEUM_CATEGORIES.ONBOARD];
        } else if (activeModule === 'petroleum_v2') {
            if (stepIndex === 2) categories = [PETROLEUM_V2_CATEGORIES.PRIME_MOVER];
            if (stepIndex === 3) categories = [PETROLEUM_V2_CATEGORIES.TRAILER_TANKS];
            if (stepIndex === 4) categories = [PETROLEUM_V2_CATEGORIES.DRIVER, PETROLEUM_V2_CATEGORIES.SAFETY_SIGNS, PETROLEUM_V2_CATEGORIES.DOCUMENTS];
        } else if (activeModule === 'acid') {
            if (stepIndex === 2) categories = [ACID_CATEGORIES.PPE];
            if (stepIndex === 3) categories = [ACID_CATEGORIES.VEHICLE];
            if (stepIndex === 4) categories = [ACID_CATEGORIES.SPILL_KIT, ACID_CATEGORIES.DOCUMENTATION];
        }

        return sourceItems.filter(item => categories.includes(item.category));
    };

    const validateSection = (sectionIndex: number): boolean => {
        const newErrors: Record<string, boolean> = {};
        
        if (sectionIndex === 0) {
            if (!formData.truckNo) newErrors.truckNo = true;
            if (!formData.trailerNo) newErrors.trailerNo = true;
            if (!formData.driverName) newErrors.driverName = true;
            if (!formData.location) newErrors.location = true;
            if (!formData.odometer) newErrors.odometer = true;
            if (activeModule !== 'general' && !formData.jobCard) newErrors.jobCard = true;
        }

        if (sectionIndex >= 2 && sectionIndex <= 4) {
            const requiredItems = getItemsForStep(sectionIndex);
            requiredItems.forEach(item => {
                if (!formData[item.id]) newErrors[item.id] = true;
            });
        }

        if (sectionIndex === 5) {
             if (!formData.remarks || formData.remarks.trim() === '') newErrors.remarks = true;
             if (!formData.rate || formData.rate === 0) newErrors.rate = true;
             if (!formData.inspectorSignature) newErrors.inspectorSignature = true;
             if (!formData.driverSignature) newErrors.driverSignature = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
            return false;
        }

        setErrors({});
        return true;
    };

    const handleNext = () => {
        if (!validateSection(currentSection)) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
    };

    const handleBack = () => {
        if (currentSection === 0) onExit();
        else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentSection(prev => Math.max(prev - 1, 0));
        }
    };

    const handleSubmitInspection = () => {
        if (validateSection(currentSection)) onSubmit(formData);
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-56px)] bg-slate-50/50">
             {/* COMPACT FLOW INDICATOR */}
             <div className="bg-white border-b border-slate-100 sticky top-14 z-30 shadow-sm shrink-0">
                <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 overflow-hidden">
                    <div className="flex justify-between items-center gap-1 sm:gap-4">
                        {SECTIONS.map((section, idx) => {
                            const isActive = idx === currentSection;
                            const isCompleted = idx < currentSection;
                            return (
                                <React.Fragment key={section.id}>
                                    <div className="flex flex-col items-center gap-1.5 min-w-0 transition-all duration-500">
                                        <div className={`
                                            w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[8px] sm:text-xs font-black transition-all
                                            ${isActive ? 'bg-slate-900 text-white shadow-lg scale-110' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}
                                        `}>
                                            {isCompleted ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[7px] font-black uppercase tracking-tighter sm:tracking-widest truncate w-full text-center hidden xs:block ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                                            {section.title}
                                        </span>
                                    </div>
                                    {idx < SECTIONS.length - 1 && (
                                        <div className={`h-px flex-1 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FLUID CONTENT AREA */}
            <div className="flex-1 p-4 sm:p-8 w-full max-w-5xl mx-auto pb-32">
                {currentSection === 0 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight">Inspection Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <AutocompleteInput label="Truck Registration *" value={formData.truckNo} onChange={v => updateField('truckNo', v)} options={validationLists.trucks} isRegNo={true} error={errors.truckNo} />
                                <AutocompleteInput label="Trailer ID *" value={formData.trailerNo} onChange={v => updateField('trailerNo', v)} options={validationLists.trailers} isRegNo={true} error={errors.trailerNo} />
                                <Input label="Job Card (if any)" value={formData.jobCard || ''} onChange={v => updateField('jobCard', v)} error={errors.jobCard} />
                                <AutocompleteInput label="Inspector" value={formData.inspectedBy} onChange={v => updateField('inspectedBy', v)} options={validationLists.inspectors} readOnly={true} />
                                <AutocompleteInput label="Driver Name *" value={formData.driverName} onChange={v => updateField('driverName', v)} options={validationLists.drivers} isTitleCase={true} error={errors.driverName} />
                                <AutocompleteInput label="Location *" value={formData.location} onChange={v => updateField('location', v)} options={validationLists.locations} isTitleCase={true} error={errors.location} />
                                <Input label="Odometer Reading (KM) *" type="number" value={formData.odometer} onChange={v => updateField('odometer', v)} error={errors.odometer} />
                            </div>
                        </div>
                    </div>
                )}

                {currentSection === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight">Vehicle Photos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <CameraCapture label="Front View" existingImage={formData.photoFront} onCapture={img => updateField('photoFront', img)} />
                                <CameraCapture label="Left Side" existingImage={formData.photoLS} onCapture={img => updateField('photoLS', img)} />
                                <CameraCapture label="Right Side" existingImage={formData.photoRS} onCapture={img => updateField('photoRS', img)} />
                                <CameraCapture label="Rear View" existingImage={formData.photoBack} onCapture={img => updateField('photoBack', img)} />
                            </div>
                        </div>
                    </div>
                )}

                {(currentSection >= 2 && currentSection <= 4) && (
                    <div className="space-y-6 animate-fadeIn">
                        {Array.from(new Set(getItemsForStep(currentSection).map(i => i.category))).map(cat => (
                            <div key={cat} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{cat}</h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {getItemsForStep(currentSection).filter(i => i.category === cat).map(item => (
                                        <div key={item.id} className={`p-6 sm:p-8 transition-colors ${errors[item.id] ? 'bg-rose-50/30' : ''}`}>
                                            <p className="font-bold text-xs sm:text-sm text-slate-700 uppercase tracking-tight mb-5 leading-snug">{item.label}</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-2xl">
                                                <StatusButton label="Good" status={InspectionStatus.GOOD} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.GOOD)} colorClass="green" />
                                                <StatusButton label="Fault" status={InspectionStatus.BAD} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.BAD)} colorClass="red" />
                                                <StatusButton label="Review" status={InspectionStatus.ATTENTION} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.ATTENTION)} colorClass="yellow" />
                                                <StatusButton label="N/A" status={InspectionStatus.NIL} current={formData[item.id]} onClick={() => updateField(item.id, InspectionStatus.NIL)} colorClass="gray" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {currentSection === 5 && (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-8 uppercase tracking-tight">Review & Sign</h2>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Comments *</label>
                                    <textarea className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl h-40 outline-none font-medium text-sm focus:ring-4 focus:ring-indigo-50/50 resize-none transition-all" value={formData.remarks} onChange={e => updateField('remarks', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Overall Condition Rating *</label>
                                    <div className="flex gap-2 sm:gap-4">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button key={num} onClick={() => updateField('rate', num)} className={`flex-1 h-12 sm:h-14 rounded-xl font-black text-lg transition-all ${formData.rate === num ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{num}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                                    <SignaturePad label="Inspector Signature" existingSignature={formData.inspectorSignature} onSave={sig => updateField('inspectorSignature', sig)} />
                                    <SignaturePad label="Driver Signature" existingSignature={formData.driverSignature} onSave={sig => updateField('driverSignature', sig)} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentSection === 6 && (
                    <div className="animate-fadeIn py-10 text-center">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <button 
                            onClick={handleSubmitInspection} 
                            disabled={submissionStatus !== 'idle'} 
                            className="w-full sm:w-auto px-12 py-5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 border-t border-white/10 uppercase tracking-[0.2em]"
                        >
                            {submissionStatus === 'submitting' ? 'Uploading...' : 'Submit'}
                        </button>
                    </div>
                )}
            </div>

            {/* ADAPTIVE FOOTER NAV */}
            <footer className="bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 sm:p-6 fixed bottom-0 left-0 right-0 z-40 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="max-w-5xl mx-auto flex gap-3 sm:gap-6">
                    <button onClick={handleBack} className="flex-1 sm:flex-none px-6 sm:px-10 py-3.5 rounded-xl sm:rounded-2xl border border-slate-200 font-black text-slate-400 hover:text-slate-800 transition-all text-[10px] uppercase tracking-widest active:scale-95">
                        {currentSection === 0 ? 'Cancel' : 'Previous'}
                    </button>
                    <div className="flex gap-3 flex-[2] sm:flex-1 justify-end">
                        <button onClick={handleSaveDraftLocal} className="flex-1 sm:flex-none px-4 sm:px-8 py-3.5 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 font-black hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest active:scale-95">
                            {showDraftSaved ? 'Saved' : 'Save Draft'}
                        </button>
                        {currentSection < SECTIONS.length - 1 && (
                            <button onClick={handleNext} className="flex-[1.5] sm:flex-none px-8 sm:px-12 py-3.5 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black hover:bg-black shadow-lg transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] active:scale-95 border-t border-white/10">
                                Continue
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InspectionFormView;