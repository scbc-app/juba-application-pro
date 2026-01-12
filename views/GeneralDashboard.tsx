import React from 'react';
import { InspectionData } from '../types';
import DashboardTemplate from '../components/dashboard/DashboardTemplate';

interface GeneralDashboardProps {
    stats: { total: number, passRate: number | string };
    startNewInspection: () => void;
    // Fix: Updated signature to match DashboardTemplate
    fetchHistory: (force?: boolean) => void;
    isLoadingHistory: boolean;
    historyList: InspectionData[];
    onViewReport: (item: InspectionData) => void;
    onPrint: (item: InspectionData) => void;
    userRole?: string;
    isLocked?: boolean;
    // Fix: Added missing props passed from App.tsx
    lockReason?: 'maintenance' | 'license';
    maintenanceMessage?: string;
}

const GeneralDashboard: React.FC<GeneralDashboardProps> = (props) => {
    return (
        <DashboardTemplate 
            {...props}
            title="General Inspection"
            description=""
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            colorTheme="slate"
            titlePrefix="VEHICLE INSPECTION"
        />
    );
}

export default GeneralDashboard;