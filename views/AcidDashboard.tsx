import React from 'react';
import { InspectionData } from '../types';
import DashboardTemplate from '../components/dashboard/DashboardTemplate';

interface AcidDashboardProps {
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

const AcidDashboard: React.FC<AcidDashboardProps> = (props) => {
    return (
        <DashboardTemplate 
            {...props}
            title="Acid Inspection"
            description=""
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11z"/><path d="M10 13v6h4v-6z"/></svg>}
            colorTheme="purple"
            titlePrefix="ACID TANKER INSPECTION"
        />
    );
}

export default AcidDashboard;