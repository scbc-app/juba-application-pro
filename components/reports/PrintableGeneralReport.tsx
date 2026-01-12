
import React from 'react';
import { InspectionData, SystemSettings } from '../../types';
import { INSPECTION_ITEMS } from '../../constants';

const PrintableGeneralReport: React.FC<{data: InspectionData, settings: SystemSettings}> = ({data, settings}) => (
    <div className="max-w-[210mm] mx-auto text-sm leading-tight text-gray-900 font-sans p-8 bg-white min-h-[297mm]">
        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
            <div className="flex flex-col items-center justify-center gap-2 mb-6 w-full">
                {settings.companyLogo ? (
                    <img src={settings.companyLogo} alt="Company Logo" className="h-28 max-w-sm object-contain" />
                ) : (
                    <div className="text-center py-4"><h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wide">{settings.companyName || 'Company Name'}</h1></div>
                )}
            </div>
            <div className="w-full border-2 border-black mt-2">
                <div className="grid grid-cols-3 divide-x-2 divide-black border-b-2 border-black">
                    <div className="p-1.5 pl-2 font-medium text-sm">Doc. No. MNT-F-015</div>
                    <div className="p-1.5 pl-2 font-medium text-sm">Revision No.: 01</div>
                    <div className="p-1.5 pl-2 font-medium text-sm">Date/Time: {new Date(data.timestamp).toLocaleString()}</div>
                </div>
                <div className="p-2 text-center font-black text-xl uppercase tracking-wide bg-gray-50">GENERAL VEHICLE CHECKLIST</div>
            </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 p-4 border border-gray-300 text-xs">
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center"><span className="font-bold uppercase text-gray-600">Reg No:</span><span className="font-mono font-bold text-base border-b border-gray-300">{data.truckNo || 'N/A'}</span></div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center"><span className="font-bold uppercase text-gray-600">Trailer/Unit:</span><span className="font-mono font-bold text-base border-b border-gray-300">{data.trailerNo || 'N/A'}</span></div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center"><span className="font-bold uppercase text-gray-600">Driver Name:</span><span className="font-medium border-b border-gray-300">{data.driverName || 'N/A'}</span></div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center"><span className="font-bold uppercase text-gray-600">Inspected By:</span><span className="font-medium border-b border-gray-300">{data.inspectedBy || 'N/A'}</span></div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center"><span className="font-bold uppercase text-gray-600">Location:</span><span className="font-medium border-b border-gray-300">{data.location || 'N/A'}</span></div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center"><span className="font-bold uppercase text-gray-600">Odometer:</span><span className="font-medium border-b border-gray-300">{data.odometer || 'N/A'} km</span></div>
        </div>

        {/* Items */}
        <div className="mb-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-0 border-t border-gray-300">
                {INSPECTION_ITEMS.map((item, idx) => {
                    const status = data[item.id] as string;
                    let color = 'text-gray-900';
                    let bg = '';
                    if (status === 'Bad') { color = 'text-red-700 font-bold'; bg='bg-red-50'; }
                    if (status === 'Needs Attention') { color = 'text-amber-700 font-bold'; bg='bg-amber-50'; }
                    if (status === 'Nil') { color = 'text-gray-400 italic'; }
                    return (
                        <div key={item.id} className={`flex justify-between items-center border-b border-gray-300 py-1.5 px-2 text-xs ${bg} ${idx % 2 === 0 ? 'pr-4 border-r border-gray-300' : 'pl-4'}`}>
                            <span className="text-gray-800 font-medium">{item.label}</span>
                            <span className={`uppercase tracking-tighter ${color}`}>{status}</span>
                        </div>
                    );
                })}
            </div>
        </div>
        
        {/* Signatures */}
         <div className="grid grid-cols-2 gap-12 mt-8 border-t-2 border-black pt-6 break-inside-avoid">
            <div className="text-center">
                {data.driverSignature ? (<img src={data.driverSignature} className="h-12 mx-auto mb-1" alt="Driver Sig" />) : <div className="h-12"></div>}
                <p className="border-t border-gray-400 pt-1 font-bold uppercase text-[10px] tracking-widest text-gray-600">Driver Signature</p>
            </div>
            <div className="text-center">
                {data.inspectorSignature ? (<img src={data.inspectorSignature} className="h-12 mx-auto mb-1" alt="Inspector Sig" />) : <div className="h-12"></div>}
                <p className="border-t border-gray-400 pt-1 font-bold uppercase text-[10px] tracking-widest text-gray-600">Inspector Signature</p>
            </div>
        </div>
    </div>
);

export default PrintableGeneralReport;
