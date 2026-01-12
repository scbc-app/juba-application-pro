
import React from 'react';
import { InspectionData, SystemSettings, InspectionStatus } from '../../types';
import { ACID_INSPECTION_ITEMS } from '../../constants';

const PrintableAcidReport: React.FC<{data: InspectionData, settings: SystemSettings}> = ({data, settings}) => (
    <div className="max-w-[210mm] mx-auto text-sm leading-tight text-gray-900 font-sans p-8 bg-white min-h-[297mm]">
         {/* Custom Header Matching PDF Template MNT-F-013 */}
         <div className="border-2 border-black mb-4">
             <div className="grid grid-cols-[120px_1fr_150px] divide-x-2 divide-black border-b-2 border-black">
                 {/* Logo Box */}
                 <div className="p-2 flex items-center justify-center">
                      {settings.companyLogo ? (
                          <img src={settings.companyLogo} alt="Logo" className="w-24 object-contain" />
                      ) : (
                          <span className="font-bold text-xs">{settings.companyName}</span>
                      )}
                 </div>
                 {/* Title Box */}
                 <div className="flex flex-col">
                      <div className="border-b-2 border-black px-2 py-1 text-xs font-medium">Doc No: MNT – F – 013</div>
                      <div className="flex-1 flex items-center justify-center p-2 bg-gray-50">
                           <h1 className="text-xl font-black uppercase tracking-wider text-center">ACID TANKER CHECKLIST</h1>
                      </div>
                 </div>
                 {/* Dates Box */}
                 <div className="text-xs divide-y divide-black">
                      <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black font-semibold">Initial Issue Date</span>
                          <span className="p-1 text-center">03/02/2017</span>
                      </div>
                      <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black font-semibold">Revision Date:</span>
                          <span className="p-1 text-center">15/03/2022</span>
                      </div>
                       <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black font-semibold">Revision No.</span>
                          <span className="p-1 text-center">05</span>
                      </div>
                       <div className="grid grid-cols-[1fr_80px]">
                          <span className="p-1 pl-2 border-r border-black font-semibold">Next Revision:</span>
                          <span className="p-1 text-center">15/03/2023</span>
                      </div>
                 </div>
             </div>
         </div>

         {/* Meta Data */}
         <div className="mb-4 text-xs font-mono">
             <div className="flex flex-wrap gap-x-8 gap-y-2 mb-2">
                 <div className="flex gap-2"><span>Horse #:</span> <span className="font-bold border-b border-gray-400 min-w-[100px]">{data.truckNo}</span></div>
                 <div className="flex gap-2"><span>Trailer #:</span> <span className="font-bold border-b border-gray-400 min-w-[100px]">{data.trailerNo}</span></div>
                 <div className="flex gap-2"><span>Job Card #:</span> <span className="font-bold border-b border-gray-400 min-w-[100px]">{data.jobCard}</span></div>
             </div>
             <div className="flex flex-wrap gap-x-8 gap-y-2">
                 <div className="flex gap-2"><span>Location:</span> <span className="font-bold border-b border-gray-400 min-w-[150px]">{data.location}</span></div>
                 <div className="flex gap-2"><span>Inspection Date/Time:</span> <span className="font-bold border-b border-gray-400 min-w-[150px]">{new Date(data.timestamp).toLocaleString()}</span></div>
             </div>
         </div>

         {/* Checklist Table */}
         <div className="border-2 border-black text-xs">
             <div className="grid grid-cols-[40px_1fr_120px] bg-white border-b-2 border-black font-bold items-center">
                 <span className="text-center py-2 border-r border-black">S/N</span>
                 <span className="text-left pl-2 py-2 border-r border-black">ITEM</span>
                 <span className="pl-2 py-2">COMMENT</span>
             </div>

             {/* Sections */}
             {['PPE', 'VEHICLE', 'SPILL_KIT', 'DOCUMENTATION'].map((sectionKey) => {
                 let sectionLabel = '';
                 let sectionItems: typeof ACID_INSPECTION_ITEMS = [];

                 if (sectionKey === 'PPE') {
                     sectionLabel = 'A. Personal Protective Equipment (PPE)';
                     sectionItems = ACID_INSPECTION_ITEMS.filter(i => i.category.includes('Personal'));
                 } else if (sectionKey === 'VEHICLE') {
                     sectionLabel = 'B. Vehicle (Horse & Trailer)';
                     sectionItems = ACID_INSPECTION_ITEMS.filter(i => i.category.includes('Vehicle'));
                 } else if (sectionKey === 'SPILL_KIT') {
                     sectionLabel = 'C. Spill Kit';
                     sectionItems = ACID_INSPECTION_ITEMS.filter(i => i.category.includes('Spill'));
                 } else if (sectionKey === 'DOCUMENTATION') {
                     sectionLabel = 'D. Documentation';
                     sectionItems = ACID_INSPECTION_ITEMS.filter(i => i.category.includes('Documentation'));
                 }

                 return (
                     <React.Fragment key={sectionKey}>
                         <div className="grid grid-cols-[1fr] border-b border-black bg-gray-100 font-bold px-2 py-1">
                             {sectionLabel}
                         </div>
                         {sectionItems.map((item, idx) => {
                             const status = data[item.id];
                             
                             // Parse Label to get No and Text
                             const splitLabel = item.label.split('. ');
                             const number = splitLabel[0];
                             const text = splitLabel.slice(1).join('. ');

                             let commentClass = "";
                             if (status === InspectionStatus.GOOD) commentClass = "text-green-700 font-bold";
                             else if (status === InspectionStatus.BAD) commentClass = "text-red-700 font-bold bg-red-50";
                             else if (status === InspectionStatus.ATTENTION) commentClass = "text-amber-700 font-bold bg-amber-50";

                             return (
                                 <div key={item.id} className="grid grid-cols-[40px_1fr_120px] border-b border-black items-stretch">
                                     <span className="text-center py-1 border-r border-black flex items-center justify-center font-semibold">{number}</span>
                                     <span className="pl-2 py-1 border-r border-black flex items-center">{text}</span>
                                     <span className={`pl-2 py-1 flex items-center ${commentClass}`}>
                                         {status || '-'}
                                     </span>
                                 </div>
                             );
                         })}
                     </React.Fragment>
                 )
             })}
         </div>

         {/* Remarks */}
         <div className="mt-4 text-xs space-y-4">
             <div className="flex gap-2">
                 <span className="font-semibold">Remarks:</span>
                 <span className="border-b border-black flex-1 border-dashed">{data.remarks}</span>
             </div>
             
             <div className="flex gap-2 items-center">
                 <span className="font-semibold w-24">Inspector:</span>
                 <span className="border-b border-black flex-1 border-dashed">{data.inspectedBy}</span>
             </div>

             <div className="flex gap-2 items-end">
                 <span className="font-semibold w-24">Inspector Sig:</span>
                 <div className="border-b border-black flex-1 border-dashed h-12">
                      {data.inspectorSignature && <img src={data.inspectorSignature} className="h-full object-contain" />}
                 </div>
             </div>

             <div className="flex gap-2 items-center">
                 <span className="font-semibold w-24">Driver:</span>
                 <span className="border-b border-black flex-1 border-dashed">{data.driverName}</span>
             </div>

             <div className="flex gap-2 items-end">
                 <span className="font-semibold w-24">Driver Sig:</span>
                 <div className="border-b border-black flex-1 border-dashed h-12">
                      {data.driverSignature && <img src={data.driverSignature} className="h-full object-contain" />}
                 </div>
             </div>
         </div>

         {/* Photos Section */}
         <div className="mt-6 text-xs">
             <p className="font-bold mb-2">Pictures of Damage/Broken/Disfigured etc.:</p>
             <div className="h-32 border border-black flex items-center justify-center bg-gray-50 mb-4">
                 {data.photoDamage ? <img src={data.photoDamage} className="h-full object-contain" /> : <span className="text-gray-400">No damage photo</span>}
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div>
                     <p className="font-bold mb-1">Front Picture:</p>
                     <div className="h-32 border border-black flex items-center justify-center bg-gray-50">
                        {data.photoFront ? <img src={data.photoFront} className="h-full object-contain" /> : <span className="text-gray-400">No photo</span>}
                     </div>
                 </div>
                 <div>
                     <p className="font-bold mb-1">LS Picture:</p>
                     <div className="h-32 border border-black flex items-center justify-center bg-gray-50">
                        {data.photoLS ? <img src={data.photoLS} className="h-full object-contain" /> : <span className="text-gray-400">No photo</span>}
                     </div>
                 </div>
                 <div>
                     <p className="font-bold mb-1">BS Picture:</p>
                     <div className="h-32 border border-black flex items-center justify-center bg-gray-50">
                        {data.photoBack ? <img src={data.photoBack} className="h-full object-contain" /> : <span className="text-gray-400">No photo</span>}
                     </div>
                 </div>
                 <div>
                     <p className="font-bold mb-1">RS Picture:</p>
                     <div className="h-32 border border-black flex items-center justify-center bg-gray-50">
                        {data.photoRS ? <img src={data.photoRS} className="h-full object-contain" /> : <span className="text-gray-400">No photo</span>}
                     </div>
                 </div>
             </div>
         </div>
    </div>
);

export default PrintableAcidReport;
