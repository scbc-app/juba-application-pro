import React, { useState } from 'react';

interface ReportViewerModalProps {
    onClose: () => void;
    onPrint: () => void;
    children: React.ReactNode;
    title: string;
}

const ReportViewerModal: React.FC<ReportViewerModalProps> = ({ 
    onClose, 
    onPrint, 
    children, 
    title 
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = () => {
        setIsGenerating(true);
        const element = document.getElementById('printable-report-content');
        
        if (!element) {
            console.error("Report content not found");
            setIsGenerating(false);
            return;
        }

        const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const html2pdf = (window as any).html2pdf;

        if (html2pdf) {
            html2pdf().set(opt).from(element).save().then(() => {
                setIsGenerating(false);
            }).catch((err: any) => {
                console.error("PDF Generation Error", err);
                setIsGenerating(false);
                alert("Failed to generate PDF. You can use the Print button as a fallback.");
            });
        } else {
            onPrint();
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fadeIn no-print">
            <div className="bg-white w-full max-w-5xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
                {/* Simplified Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 border-slate-200">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={onClose}
                            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                            Close
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:bg-slate-400"
                        >
                            {isGenerating ? (
                                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            )}
                            Download PDF
                        </button>

                        <button 
                            onClick={onPrint}
                            className="hidden sm:flex px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all items-center gap-2"
                        >
                             <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                             Print
                        </button>
                    </div>
                </div>

                {/* Content Viewer Area */}
                <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-10 flex justify-center relative">
                    <div className="origin-top transform scale-[0.9] lg:scale-100 transition-transform duration-500">
                         <div 
                            id="printable-report-content" 
                            className="bg-white shadow-2xl min-h-[297mm] relative z-10 w-[210mm] print:shadow-none"
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportViewerModal;