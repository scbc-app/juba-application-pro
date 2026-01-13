
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
    initialData, activeModule, validationLists, settings, onSaveDraft, onSubmit, onExit, submissionStatus, onViewReport 
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

    const validateFullForm = (): boolean => {
        for (let i = 0; i <= 5; i++) {
            if (!validateSection(i)) {
                setCurrentSection(i); 
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validateSection(currentSection)) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentSection(prev => Math.min(prev + 1, SECTIONS.length - 1));
    };

    const handleBack = () => {
        if (currentSection === 0) {
            onExit();
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentSection(prev => Math.max(prev - 1, 0));
        }
    };

    const handleSubmitInspection = () => {
        if (validateFullForm()) {
            onSubmit(formData);
        }
    };

    const renderDetailsSection = () => (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        {formData.requestId && (
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 sm:p-5 rounded-2xl shadow-xl flex items-center justify-between text-white border border-indigo-400/30">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    </div>
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-200">Active Mission</p>
                        <p className="text-sm sm:text-base font-black tracking-tight uppercase">Request ID: {formData.requestId}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-6 sm:mb-8 uppercase tracking-tight">Vehicle Identity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 sm:gap-y-8 gap-x-10">
            <AutocompleteInput label="Truck Reg No *" value={formData.truckNo} onChange={v => updateField('truckNo', v)} options={validationLists.trucks} placeholder="e.g. ABC 123" isRegNo={true} error={errors.truckNo} />
            <AutocompleteInput label="Trailer No *" value={formData.trailerNo} onChange={v => updateField('trailerNo', v)} options={validationLists.trailers} placeholder="e.g. T-100" isRegNo={true} error={errors.trailerNo} />
            <Input label="Job Card Reference" value={formData.jobCard || ''} onChange={v => updateField('jobCard', v)} error={errors.jobCard} />
            <AutocompleteInput label="Primary Inspector" value={formData.inspectedBy} onChange={v => updateField('inspectedBy', v)} options={validationLists.inspectors} isTitleCase={true} readOnly={true} />
            <AutocompleteInput label="Driver Name *" value={formData.driverName} onChange={v => updateField('driverName', v)} options={validationLists.drivers} placeholder="Verified Identity" isTitleCase={true} error={errors.driverName} />
            <AutocompleteInput label="Station Location *" value={formData.location} onChange={v => updateField('location', v)} options={validationLists.locations} placeholder="Hub" isTitleCase={true} error={errors.location} />
            <Input label="Odometer Readout (km) *" type="number" value={formData.odometer} onChange={v => updateField('odometer', v)} error={errors.odometer} />
          </div>
        </div>
      </div>
    );
  
    const renderPhotosSection = () => (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
         <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-6 sm:mb-8 uppercase tracking-tight">Visual Documentation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <CameraCapture label="Horse: Front" existingImage={formData.photoFront} onCapture={img => updateField('photoFront', img)} />
            <CameraCapture label="Horse: Left Profile" existingImage={formData.photoLS} onCapture={img => updateField('photoLS', img)} />
            <CameraCapture label="Horse: Right Profile" existingImage={formData.photoRS} onCapture={img => updateField('photoRS', img)} />
            <CameraCapture label="Trailer: Rear Aspect" existingImage={formData.photoBack} onCapture={img => updateField('photoBack', img)} />
          </div>
        </div>
      </div>
    );
  
    const renderInspectionSection = (categoriesToShow: string[]) => {
        const itemsToRender = getItemsForStep(currentSection).filter(i => categoriesToShow.includes(i.category));
        const grouping: Record<string, InspectionItemConfig[]> = {};
        categoriesToShow.forEach(cat => {
            grouping[cat] = itemsToRender.filter(i => i.category === cat);
        });
  
        return (
          <div className="space-y-6 sm:space-y-10 animate-fadeIn">
            {categoriesToShow.map(cat => (
              <div key={cat} className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50 px-5 sm:px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-[9px] sm:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">{cat}</h3>
                  <span className="text-[7px] sm:text-[8px] font-black bg-rose-50 text-rose-500 px-2 py-1 rounded uppercase tracking-widest border border-rose-100">Verification Req.</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {grouping[cat].map(item => (
                    <div key={item.id} className={`p-5 sm:p-8 transition-colors ${errors[item.id] ? 'bg-rose-50/40' : 'hover:bg-slate-50/30'}`}>
                      <div className="mb-4 sm:mb-5">
                          <span className={`font-bold text-xs sm:text-sm leading-tight uppercase tracking-tight ${errors[item.id] ? 'text-rose-800' : 'text-slate-700'}`}>
                              {item.label}
                          </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-4 max-w-xl">
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
        );
    };
  
    const renderSignaturesSection = () => (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        <div className="bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-6 sm:mb-8 uppercase tracking-tight">Authorization</h2>
          
          <div className="mb-8 sm:mb-10">
            <label className={`block text-[9px] sm:text-[10px] font-black uppercase mb-3 tracking-[0.2em] ${errors.remarks ? 'text-rose-600' : 'text-slate-400'}`}>Inspector Findings & Remarks *</label>
            <textarea className="w-full p-4 sm:p-6 border rounded-2xl h-36 sm:h-44 outline-none font-medium text-sm border-slate-200 focus:ring-4 focus:ring-indigo-50 bg-slate-50 transition-all resize-none" placeholder="Detailed vehicle condition summary..." value={formData.remarks} onChange={(e) => updateField('remarks', e.target.value)} />
          </div>
  
          <div className="mb-8 sm:mb-12">
             <label className="block text-[9px] sm:text-[10px] font-black uppercase mb-4 sm:mb-5 tracking-[0.2em] text-slate-400">Final Health Grade *</label>
             <div className="flex gap-2 sm:gap-5 flex-wrap">
               {[1, 2, 3, 4, 5].map(num => (
                 <button key={num} type="button" onClick={() => updateField('rate', num)} className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl transition-all active:scale-90 ${formData.rate === num ? 'bg-slate-900 text-white shadow-2xl scale-105 sm:scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{num}</button>
               ))}
             </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-8 sm:pt-10 border-t border-slate-100">
             <SignaturePad label="Inspector Authentication" existingSignature={formData.inspectorSignature} onSave={sig => updateField('inspectorSignature', sig)} />
             <SignaturePad label="Driver Confirmation" existingSignature={formData.driverSignature} onSave={sig => updateField('driverSignature', sig)} />
          </div>
        </div>
      </div>
    );
  
    const renderSummarySection = () => (
      <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-12">
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-emerald-100">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3 uppercase tracking-tight">Audit Ready</h2>
          <p className="text-slate-400 font-medium text-xs sm:text-sm max-w-md mx-auto leading-relaxed">Please perform a final data review. Submitting will permanently log this record into the corporate fleet repository.</p>
        </div>
  
        <div className="mt-6 sm:mt-8 bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-10">
                <div className="text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-black mb-1 text-white uppercase tracking-tight">Synchronize Records</h3>
                    <p className="text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-80">Transmit to HQ Database</p>
                </div>
                <button onClick={handleSubmitInspection} disabled={submissionStatus !== 'idle'} className={`w-full md:w-auto px-8 sm:px-12 py-4 sm:py-5 text-white rounded-2xl font-black text-base sm:text-lg shadow-2xl transition-all flex items-center justify-center gap-3 sm:gap-4 active:scale-95 border-2 border-white/10 uppercase tracking-[0.15em] sm:tracking-[0.2em] ${submissionStatus !== 'idle' ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                    {submissionStatus === 'submitting' ? 'Uploading...' : submissionStatus === 'offline_saved' ? 'Stored Locally' : 'Submit Inspection'}
                    {submissionStatus === 'idle' && <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                </button>
            </div>
        </div>
      </div>
    );

    return (
        <div className="flex flex-col min-h-[calc(100vh-56px)] bg-slate-50/50 overflow-x-hidden">
             <div className="bg-white border-b border-slate-100 sticky top-14 z-30 shadow-sm">
                <div className="w-full">
                    <div className="flex px-3 sm:px-4 py-4 sm:py-5 justify-between md:justify-center items-center overflow-x-hidden">
                    {SECTIONS.map((section, idx) => {
                        const isActive = idx === currentSection;
                        const isCompleted = idx < currentSection;
                        return (
                        <div key={section.id} className="flex items-center flex-1 md:flex-none">
                            <div className="flex flex-col items-center gap-1.5 sm:gap-2 transition-all w-full">
                                <div className={`
                                    w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-[8px] sm:text-xs font-black transition-all duration-500
                                    ${isActive ? 'bg-slate-900 text-white shadow-xl scale-110' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-300'}
                                `}>
                                    {isCompleted ? '✓' : idx + 1}
                                </div>
                                <span className={`hidden sm:block text-[8px] uppercase font-black tracking-[0.2em] ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                                    {section.title}
                                </span>
                            </div>
                            {idx < SECTIONS.length - 1 && (
                            <div className={`h-px sm:h-0.5 flex-1 md:w-12 mx-1 sm:mx-4 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                            )}
                        </div>
                        );
                    })}
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-8 md:p-12 w-full max-w-5xl mx-auto overflow-x-hidden pb-32 sm:pb-32">
                {currentSection === 0 && renderDetailsSection()}
                {currentSection === 1 && renderPhotosSection()}
                
                {activeModule === 'general' && currentSection === 2 && renderInspectionSection([INSPECTION_CATEGORIES.PPE, INSPECTION_CATEGORIES.DOCUMENTATION])}
                {activeModule === 'general' && currentSection === 3 && renderInspectionSection([INSPECTION_CATEGORIES.VEHICLE_EXTERIOR, INSPECTION_CATEGORIES.LIGHTS_ELECTRICAL])}
                {activeModule === 'general' && currentSection === 4 && renderInspectionSection([INSPECTION_CATEGORIES.MECHANICAL, INSPECTION_CATEGORIES.TRAILER])}
                
                {activeModule === 'petroleum' && currentSection === 2 && renderInspectionSection([PETROLEUM_CATEGORIES.TRUCK_EQUIPMENT])}
                {activeModule === 'petroleum' && currentSection === 3 && renderInspectionSection([PETROLEUM_CATEGORIES.TYRES, PETROLEUM_CATEGORIES.PPE_ID])}
                {activeModule === 'petroleum' && currentSection === 4 && renderInspectionSection([PETROLEUM_CATEGORIES.DOCUMENTS, PETROLEUM_CATEGORIES.ONBOARD])}

                {activeModule === 'petroleum_v2' && currentSection === 2 && renderInspectionSection([PETROLEUM_V2_CATEGORIES.PRIME_MOVER])}
                {activeModule === 'petroleum_v2' && currentSection === 3 && renderInspectionSection([PETROLEUM_V2_CATEGORIES.TRAILER_TANKS])}
                {activeModule === 'petroleum_v2' && currentSection === 4 && renderInspectionSection([PETROLEUM_V2_CATEGORIES.DRIVER, PETROLEUM_V2_CATEGORIES.SAFETY_SIGNS, PETROLEUM_V2_CATEGORIES.DOCUMENTS])}

                {activeModule === 'acid' && currentSection === 2 && renderInspectionSection([ACID_CATEGORIES.PPE])}
                {activeModule === 'acid' && currentSection === 3 && renderInspectionSection([ACID_CATEGORIES.VEHICLE])}
                {activeModule === 'acid' && currentSection === 4 && renderInspectionSection([ACID_CATEGORIES.SPILL_KIT, ACID_CATEGORIES.DOCUMENTATION])}
                
                {currentSection === 5 && renderSignaturesSection()}
                {currentSection === 6 && renderSummarySection()}
            </div>

            <footer className="bg-white border-t border-slate-100 p-4 sm:p-8 fixed bottom-0 left-0 right-0 z-40 shadow-2xl backdrop-blur-md bg-white/95 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="max-w-5xl mx-auto flex gap-2 sm:gap-4">
                <button onClick={handleBack} className="px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200 font-black text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all text-[9px] sm:text-[10px] uppercase tracking-widest active:scale-95 shrink-0">
                    {currentSection === 0 ? 'Exit' : 'Prev'}
                </button>
                <div className="flex gap-2 flex-1 justify-end">
                    <button onClick={handleSaveDraftLocal} className="flex-1 sm:flex-none px-3 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 font-black hover:bg-indigo-100 transition-all items-center justify-center gap-1.5 sm:gap-3 text-[9px] sm:text-[10px] uppercase tracking-widest active:scale-95 relative overflow-hidden">
                        {showDraftSaved ? (
                            <>
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                <span className="animate-fadeIn">Saved</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                <span className="hidden xs:inline">Save Draft</span><span className="xs:hidden">Draft</span>
                            </>
                        )}
                    </button>
                    {currentSection < SECTIONS.length - 1 && (
                    <button onClick={handleNext} className="flex-[1.5] sm:flex-none px-6 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black hover:bg-black shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] active:scale-95 border-t border-white/10">
                        Next
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                    )}
                </div>
              </div>
            </footer>
        </div>
    );
};

export default InspectionFormView;
