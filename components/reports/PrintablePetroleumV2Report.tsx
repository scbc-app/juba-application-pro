
import React from 'react';
import { InspectionData, SystemSettings, InspectionStatus } from '../../types';
import { PETROLEUM_V2_ITEMS } from '../../constants';

const PrintablePetroleumV2Report: React.FC<{data: InspectionData, settings: SystemSettings}> = ({data, settings}) => (
    <div className="max-w-[210mm] mx-auto text-sm leading-tight text-gray-900 font-sans p-8 bg-white min-h-[297mm]">
         {/* Custom Header Matching PDF Template MNT-F-002 */}
         <div className="border border-black mb-6">
             <div className="grid grid-cols-[120px_1fr_150px] divide-x divide-black border-b border-black">
                 {/* Logo Box */}
                 <div className="p-2 flex items-center justify-center">
                      {settings.companyLogo ? (
                          <img src={settings.companyLogo} alt="Logo" className="w-20 object-contain" />
                      ) : (
                          <span className="font-bold text-xs">{settings.companyName}</span>
                      )}
                 </div>
                 {/* Title Box */}
                 <div className="flex flex-col">
                      <div className="border-b border-black px-2 py-1 text-xs font-medium">Doc No: MNT – F – 002</div>
                      <div className="flex-1 flex items-center justify-center p-2">
                           <h1 className="text-xl font-bold uppercase tracking-wider text-center">PETROLEUM TANKER CHECKLIST</h1>
                      </div>
                 </div>
                 {/* Dates Box */}
                 <div className="text-xs divide-y divide-black">
                      <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black">Initial Issue Date</span>
                          <span className="p-1 text-center">03/02/2017</span>
                      </div>
                      <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black">Revision Date:</span>
                          <span className="p-1 text-center">15/03/2022</span>
                      </div>
                       <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black">Revision No.</span>
                          <span className="p-1 text-center">05</span>
                      </div>
                       <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black">Next Review Date:</span>
                          <span className="p-1 text-center">15/04/2025</span>
                      </div>
                 </div>
             </div>

             {/* Details Info Row */}
             <div className="bg-gray-50 p-4 text-xs font-mono border-b border-black">
                 <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                     <div className="flex justify-between"><span>TRUCK #:</span> <span className="font-bold">{data.truckNo}</span></div>
                     <div className="flex justify-between"><span>TRAILER #:</span> <span className="font-bold">{data.trailerNo}</span></div>
                     <div className="flex justify-between"><span>JOB CARD #:</span> <span className="font-bold">{data.jobCard}</span></div>
                     <div className="flex justify-between"><span>DATE/TIME:</span> <span className="font-bold">{new Date(data.timestamp).toLocaleString()}</span></div>
                 </div>
             </div>

             <div className="p-2 text-[10px] text-center font-bold border-black bg-gray-100">
                 C = Compliant, NC = Non-Compliant, NA = Not Applicable, NI = Not Inspected (Tick Accordingly)<br/>
                 Critical = Do Not Release, Non-Critical = Waiver Applicable
             </div>
         </div>

         {/* Checklist Table */}
         <div className="border border-black text-xs mb-8">
             <div className="grid grid-cols-[30px_1fr_30px_30px_30px_30px_1fr] bg-gray-300 border-b border-black font-bold text-center items-center py-2">
                 <span>No.</span>
                 <span className="text-left pl-2">ITEM DESCRIPTION</span>
                 <span>C</span>
                 <span>NC</span>
                 <span>NI</span>
                 <span>NA</span>
                 <span>COMMENTS</span>
             </div>

             {PETROLEUM_V2_ITEMS.map((item, idx) => {
                 const status = data[item.id];
                 const isGood = status === InspectionStatus.GOOD; // Compliant
                 const isBad = status === InspectionStatus.BAD;   // Non-Compliant
                 const isNil = status === InspectionStatus.NIL;   // Not Inspected
                 const isAttn = status === InspectionStatus.ATTENTION; // Not Applicable (Mapped)

                 // Parse Label
                 const splitLabel = item.label.split('. ');
                 const number = splitLabel[0];
                 const text = splitLabel.slice(1).join('. ');
                 
                 // Section Headers
                 let sectionHeader = null;
                 if (item.id === 'petro2_1') sectionHeader = "PRIME MOVER";
                 if (item.id === 'petro2_16') sectionHeader = "TRAILER/TANKS";
                 if (item.id === 'petro2_33') sectionHeader = "DRIVER";
                 if (item.id === 'petro2_38') sectionHeader = "SAFETY & WARNING SIGNS";
                 if (item.id === 'petro2_45') sectionHeader = "LICENCE & MANDATORY DOCUMENTS";

                 return (
                     <React.Fragment key={item.id}>
                         {sectionHeader && (
                             <div className="grid grid-cols-[1fr] bg-gray-200 border-b border-black font-bold px-2 py-1 text-center border-t-2 border-t-black">
                                 {sectionHeader}
                             </div>
                         )}
                         <div className={`grid grid-cols-[30px_1fr_30px_30px_30px_30px_1fr] border-b border-gray-400 min-h-[30px] items-stretch ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                             <span className="text-center font-medium py-1 border-r border-gray-300 flex items-center justify-center">{number}</span>
                             <span className="pl-2 border-r border-gray-300 flex items-center py-1">{text}</span>
                             
                             <span className="border-r border-gray-300 flex items-center justify-center font-bold text-black">
                                 {isGood ? '✔' : ''}
                             </span>
                             <span className="border-r border-gray-300 flex items-center justify-center font-bold text-black">
                                 {isBad ? '✔' : ''}
                             </span>
                             <span className="border-r border-gray-300 flex items-center justify-center font-bold text-black">
                                 {isNil ? '✔' : ''}
                             </span>
                             <span className="border-r border-gray-300 flex items-center justify-center font-bold text-black">
                                 {isAttn ? '✔' : ''}
                             </span>
                             
                             <span className="flex items-center pl-2 italic text-gray-500 py-1">
                                 {isBad ? 'NON-COMPLIANT' : (isAttn ? 'N/A' : '')}
                             </span>
                         </div>
                     </React.Fragment>
                 );
             })}
         </div>

         {/* Remarks */}
         <div className="mt-6 border border-black p-2 min-h-[60px]">
             <span className="font-bold underline">Remarks:</span> {data.remarks}
         </div>

         {/* Signatures */}
         <div className="mt-6 grid grid-cols-2 gap-8 text-xs">
             <div className="space-y-4">
                 <div className="flex justify-between border-b border-gray-400 pb-1">
                     <span>Inspected By:</span> <span className="font-bold">{data.inspectedBy}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-400 pb-1 items-end">
                     <span>Inspector Sign:</span> 
                     {data.inspectorSignature && <img src={data.inspectorSignature} className="h-8" alt="Sig" />}
                 </div>
                 <div className="flex justify-between border-b border-gray-400 pb-1">
                     <span>Date:</span> <span>{new Date(data.timestamp).toLocaleDateString()}</span>
                 </div>
             </div>
             <div className="space-y-4">
                 <div className="flex justify-between border-b border-gray-400 pb-1">
                     <span>Driver Name:</span> <span className="font-bold">{data.driverName}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-400 pb-1 items-end">
                     <span>Driver Sign:</span> 
                     {data.driverSignature && <img src={data.driverSignature} className="h-8" alt="Sig" />}
                 </div>
                 <div className="flex justify-between border-b border-gray-400 pb-1">
                     <span>Date:</span> <span>{new Date(data.timestamp).toLocaleDateString()}</span>
                 </div>
             </div>
         </div>
    </div>
);

export default PrintablePetroleumV2Report;
