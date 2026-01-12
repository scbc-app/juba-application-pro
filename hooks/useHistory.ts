import { useState, useMemo, useEffect, useRef } from 'react';
import { InspectionData, ValidationLists, User } from '../types';
import { CACHE_TTL, SHEET_HEADERS, PETROLEUM_HEADERS, PETROLEUM_V2_HEADERS, ACID_HEADERS } from '../constants';

// Professional constraints to prevent server overload
const MIN_MANUAL_REFRESH_INTERVAL = 15000; // 15 seconds minimum between network calls for manual clicks

export const useHistory = (appScriptUrl: string, activeModule: string, currentUser: User | null) => {
    const [historyList, setHistoryList] = useState<InspectionData[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isBackgroundFetching, setIsBackgroundFetching] = useState(false);
    
    // Ref to track the last time we actually hit the network
    const lastNetworkRequestRef = useRef<number>(0);

    const [validationLists, setValidationLists] = useState<ValidationLists>({
        trucks: [],
        trailers: [],
        drivers: [],
        inspectors: [],
        locations: [],
        positions: []
    });

    // Auto-fetch data on module or URL change
    useEffect(() => {
        if (appScriptUrl && currentUser) {
            fetchHistory(false); // Default to cached fetch on mount/change
        }
    }, [activeModule, appScriptUrl, currentUser?.username]);

    const fetchHistory = async (forceRefresh: boolean | any = false) => {
        if (!appScriptUrl || typeof appScriptUrl !== 'string' || !appScriptUrl.startsWith('http')) return;
        
        // Fix: Ensure we don't treat the MouseEvent object as 'true'
        const isManualForced = forceRefresh === true;
        
        const now = Date.now();
        const userPrefix = currentUser ? `${currentUser.username}_` : 'anon_';
        const cacheKey = `sc_history_${userPrefix}${activeModule}`;
        
        const cachedData = localStorage.getItem(cacheKey);
        let hasCachedData = false;

        // 1. Check Long-Term Cache (only if not a manual force refresh)
        if (cachedData && !isManualForced) {
            try {
                const parsed = JSON.parse(cachedData);
                if (parsed.data && Array.isArray(parsed.data)) {
                    setHistoryList(parsed.data);
                    hasCachedData = true;
                    const cachedLists = localStorage.getItem('sc_validation_lists');
                    if (cachedLists) setValidationLists(JSON.parse(cachedLists));
                    
                    // If cache is still within TTL, we don't need to hit the network at all
                    if (now - parsed.timestamp < CACHE_TTL) {
                        setIsLoadingHistory(false);
                        return; 
                    }
                }
            } catch (e) {
                console.error("Cache parsing error", e);
            }
        }

        // 2. Throttling: Prevent spamming the 'Refresh' button
        // If it's a manual refresh but we just fetched < 15s ago, skip the network call
        if (isManualForced && (now - lastNetworkRequestRef.current < MIN_MANUAL_REFRESH_INTERVAL)) {
            console.debug("Fetch throttled to protect server.");
            return;
        }

        if (!hasCachedData) setIsLoadingHistory(true);
        else setIsBackgroundFetching(true);
        
        if (!navigator.onLine) {
            setIsLoadingHistory(false);
            setIsBackgroundFetching(false);
            return;
        }

        try {
            lastNetworkRequestRef.current = now; // Mark the attempt
            
            const response = await fetch(`${appScriptUrl}?t=${now}`);
            if (!response.ok) throw new Error("Network response was not ok");

            const text = await response.text();
            if (!text || text.trim().startsWith('<')) throw new Error("Invalid response format");

            const json = JSON.parse(text);

            const validationData = json['Validation_Data'];
            if (validationData) {
                const newLists = {
                    trucks: validationData['Truck_Reg_No'] || [],
                    trailers: validationData['Trailer_Reg_No'] || [],
                    drivers: validationData['Driver_Name'] || [],
                    inspectors: validationData['Inspector_Name'] || [],
                    locations: validationData['Location'] || [],
                    positions: validationData['Position'] || []
                };
                setValidationLists(newLists);
                localStorage.setItem('sc_validation_lists', JSON.stringify(newLists));
            }
            
            let targetSheet = 'General';
            let targetHeaders = SHEET_HEADERS;

            if (activeModule === 'petroleum') {
                targetSheet = 'Petroleum';
                targetHeaders = PETROLEUM_HEADERS;
            } else if (activeModule === 'petroleum_v2') {
                targetSheet = 'Petroleum_V2';
                targetHeaders = PETROLEUM_V2_HEADERS;
            } else if (activeModule === 'acid') {
                targetSheet = 'Acid';
                targetHeaders = ACID_HEADERS;
            }
            
            const rawRows = json[targetSheet];
            let historyData: InspectionData[] = [];

            if (rawRows !== undefined && Array.isArray(rawRows) && rawRows.length > 1) {
                historyData = rawRows.slice(1).map((row: any[]) => {
                    const item: any = {};
                    targetHeaders.forEach((header, index) => {
                    item[header] = row[index] !== undefined ? row[index] : null;
                    });
                    return item as InspectionData;
                }).reverse();
            }

            setHistoryList(historyData);
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: historyData
            }));

        } catch (error) {
            // Silence background errors
        } finally {
            setIsLoadingHistory(false);
            setIsBackgroundFetching(false);
        }
    };

    const stats = useMemo(() => {
        if (!historyList.length) return { total: 0, avgRate: 0, passRate: 0 };
        const total = historyList.length;
        const goodInspections = historyList.filter(i => Number(i.rate) >= 4).length;
        const passRate = ((goodInspections / total) * 100).toFixed(0);
        return { total, avgRate: 0, passRate };
    }, [historyList]);

    return { 
        historyList, 
        isLoadingHistory, 
        isBackgroundFetching, 
        validationLists, 
        stats, 
        fetchHistory 
    };
};