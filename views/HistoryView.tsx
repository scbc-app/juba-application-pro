import React from 'react';
import { InspectionData } from '../types';

interface HistoryViewProps {
    activeModule: string;
    isLoadingHistory: boolean;
    historyList: InspectionData[];
    fetchHistory: (force?: boolean) => void;
    onViewReport: (item: InspectionData) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ activeModule, isLoadingHistory, historyList, fetchHistory, onViewReport }) => {
    return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </span>
            {activeModule === 'petroleum' ? 'Petroleum Inspection History' : 'General Inspection History'}
        </h2>
        <button 
          onClick={() => fetchHistory(true)} 
          disabled={isLoadingHistory}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
        >
           <svg className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
           Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoadingHistory ? (
            <div className="p-12 text-center text-gray-500">Loading history...</div>
        ) : historyList.length === 0 ? (
            <div className="p-12 text-center">
                <div className="text-gray-400 mb-2">No inspections found.</div>
                <p className="text-sm text-gray-500">Connect to a database with existing records or submit a new inspection.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Vehicle / Trailer</th>
                            <th className="px-6 py-4">Inspector</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {historyList.map((item, i) => (
                            <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                    <div className="text-xs text-gray-400 font-normal">{new Date(item.timestamp).toLocaleTimeString()}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{item.truckNo || 'N/A'}</div>
                                    <div className="text-xs text-gray-500">{item.trailerNo}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{item.inspectedBy}</td>
                                <td className="px-6 py-4">
                                    {item.rate && (
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            Number(item.rate) >= 4 ? 'bg-green-100 text-green-700' : 
                                            Number(item.rate) === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {item.rate}/5
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                     <button 
                                        onClick={() => onViewReport(item)}
                                        className="text-blue-600 hover:text-blue-800 font-medium underline"
                                     >
                                         View Report
                                     </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}

export default HistoryView;