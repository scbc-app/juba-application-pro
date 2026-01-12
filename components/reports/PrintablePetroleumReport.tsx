
import React from 'react';
import { InspectionData, SystemSettings, InspectionStatus } from '../../types';
import { PETROLEUM_INSPECTION_ITEMS } from '../../constants';

const PrintablePetroleumReport: React.FC<{data: InspectionData, settings: SystemSettings}> = ({data, settings}) => (
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
                          <span className="p-1 text-center">01/02/2024</span>
                      </div>
                       <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black">Revision No.</span>
                          <span className="p-1 text-center">05</span>
                      </div>
                       <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black">Next Revision:</span>
                          <span className="p-1 text-center">12/04/2026</span>
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
                     <div className="flex justify-between"><span>ODOMETER:</span> <span className="font-bold">{data.odometer}</span></div>
                     <div className="flex justify-between"><span>LOCATION:</span> <span className="font-bold">{data.location}</span></div>
                 </div>
             </div>

             <div className="p-2 text-[10px] text-center font-medium border-black bg-gray-100 italic">
                 NA = Not Applicable, NI = Not Inspected, Tick to indicate status under Good Order or Needs Attention. 
                 If Tick Critical (Bad), The Truck Must Not Leave The Garage Until The Problem Has Been Fixed.
             </div>
         </div>

         {/* Checklist Table */}
         <div className="border border-black text-xs">
             <div className="grid grid-cols-[30px_1fr_60px_70px_60px_1fr] bg-gray-300 border-b border-black font-bold text-center items-center py-2">
                 <span>No.</span>
                 <span className="text-left pl-2">ITEM DESCRIPTION</span>
                 <span>Good Order</span>
                 <span>Needs Attn</span>
                 <span>Critical</span>
                 <span>COMMENTS</span>
             </div>

             {PETROLEUM_INSPECTION_ITEMS.map((item, idx) => {
                 const status = data[item.id];
                 const isGood = status === InspectionStatus.GOOD;
                 const isAttn = status === InspectionStatus.ATTENTION;
                 const isBad = status === InspectionStatus.BAD;

                 // Parse Label to get No and Text
                 const splitLabel = item.label.split('. ');
                 const number = splitLabel[0] + '.';
                 const text = splitLabel.slice(1).join('. ');

                 return (
                     <div key={item.id} className={`grid grid-cols-[30px_1fr_60px_70px_60px_1fr] border-b border-gray-400 min-h-[30px] items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                         <span className="text-center font-medium">{number}</span>
                         <span className="pl-2 border-l border-gray-300 h-full flex items-center py-1">{text}</span>
                         
                         <span className="border-l border-gray-300 h-full flex items-center justify-center font-bold text-green-600">
                             {isGood ? '✓' : ''}
                         </span>
                         <span className="border-l border-gray-300 h-full flex items-center justify-center font-bold text-amber-600">
                             {isAttn ? '!' : ''}
                         </span>
                         <span className="border-l border-gray-300 h-full flex items-center justify-center font-bold text-red-600 bg-red-50">
                             {isBad ? 'X' : ''}
                         </span>
                         
                         <span className="border-l border-gray-300 h-full flex items-center pl-2 italic text-gray-500 py-1">
                             {isBad ? 'CRITICAL FAULT' : (isAttn ? 'Check required' : '')}
                         </span>
                     </div>
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

export default PrintablePetroleumReport;
