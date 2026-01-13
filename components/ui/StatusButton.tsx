
import React from 'react';
import { InspectionStatus } from '../../types';

const StatusButton: React.FC<{label: string, status: InspectionStatus, current: any, onClick: () => void, colorClass: 'green' | 'red' | 'yellow' | 'gray'}> = ({label, status, current, onClick, colorClass}) => {
  const isSelected = status === current;
  const colors = {
    green: isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' : 'bg-white text-emerald-700 border-emerald-100 hover:bg-emerald-50',
    red: isSelected ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-100' : 'bg-white text-rose-700 border-rose-100 hover:bg-rose-50',
    yellow: isSelected ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' : 'bg-white text-amber-600 border-amber-100 hover:bg-amber-50',
    gray: isSelected ? 'bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-100' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50',
  };

  return (
    <button 
      onClick={onClick} 
      className={`relative py-2.5 px-0.5 rounded-xl border font-black text-[8px] sm:text-[10px] transition-all flex flex-col items-center justify-center gap-1 flex-1 min-w-0 ${colors[colorClass]} ${isSelected ? 'z-10 scale-[1.02]' : 'shadow-sm opacity-90 hover:opacity-100'}`}
    >
      <div className="h-4 flex items-center justify-center pointer-events-none">
        {status === InspectionStatus.GOOD && <span className="text-sm">✓</span>}
        {status === InspectionStatus.BAD && <span className="text-sm">✕</span>}
        {status === InspectionStatus.ATTENTION && <span className="text-sm">!</span>}
        {status === InspectionStatus.NIL && <span className="text-sm">Ø</span>}
      </div>
      <span className="uppercase tracking-tighter sm:tracking-widest truncate w-full px-0.5 text-center pointer-events-none">
        {label === 'Needs Attention' ? 'Review' : label}
      </span>
    </button>
  );
};

export default StatusButton;
