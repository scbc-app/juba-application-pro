import { useState, useEffect, useRef } from 'react';
import { AppNotification, User } from '../types';

const MAX_NOTIFICATIONS = 50; 
const POLLING_INTERVAL = 120000; // 2 minutes
const ALERT_MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 Hours - Ignore alerts older than this

export const useNotifications = (appScriptUrl: string, currentUser: User | null, showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
    const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
    const [notifiedIds, setNotifiedIds] = useState<string[]>([]); 
    const [pushEnabled, setPushEnabled] = useState(false);
    
    // CRITICAL: Use Refs for background polling to avoid stale closures
    const dismissedRef = useRef<string[]>([]);
    const readRef = useRef<string[]>([]);
    const pollingRef = useRef<number | null>(null);

    // Sync state to refs whenever state updates
    useEffect(() => {
        dismissedRef.current = dismissedNotificationIds.map(id => String(id));
    }, [dismissedNotificationIds]);

    useEffect(() => {
        readRef.current = readNotificationIds.map(id => String(id));
    }, [readNotificationIds]);

    // Initial Load & Polling Setup
    useEffect(() => {
        if (!currentUser) {
            if (pollingRef.current) window.clearInterval(pollingRef.current);
            return;
        }

        const userPrefix = currentUser.username.replace(/[^a-z0-9]/gi, '_') + '_';
        const savedRead = localStorage.getItem(`sc_read_notifications_${userPrefix}`);
        const savedDismissed = localStorage.getItem(`sc_dismissed_notifications_${userPrefix}`);
        
        const initialRead = (savedRead ? JSON.parse(savedRead) : []).map((id: any) => String(id));
        const initialDismissed = (savedDismissed ? JSON.parse(savedDismissed) : []).map((id: any) => String(id));
        
        setReadNotificationIds(initialRead);
        setDismissedNotificationIds(initialDismissed);
        readRef.current = initialRead;
        dismissedRef.current = initialDismissed;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            setPushEnabled(true);
        }

        fetchNotifications();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchNotifications();
                if (!pollingRef.current) {
                    pollingRef.current = window.setInterval(fetchNotifications, POLLING_INTERVAL);
                }
            } else {
                if (pollingRef.current) {
                    window.clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        pollingRef.current = window.setInterval(fetchNotifications, POLLING_INTERVAL);

        return () => {
            if (pollingRef.current) window.clearInterval(pollingRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentUser, appScriptUrl]);

    const saveReadState = (ids: string[]) => {
        if (!currentUser) return;
        const userPrefix = currentUser.username.replace(/[^a-z0-9]/gi, '_') + '_';
        localStorage.setItem(`sc_read_notifications_${userPrefix}`, JSON.stringify(ids));
        setReadNotificationIds(ids);
    };

    const saveDismissedState = (ids: string[]) => {
        if (!currentUser) return;
        const userPrefix = currentUser.username.replace(/[^a-z0-9]/gi, '_') + '_';
        localStorage.setItem(`sc_dismissed_notifications_${userPrefix}`, JSON.stringify(ids));
        setDismissedNotificationIds(ids);
    };

    const fetchNotifications = async () => {
        if (!appScriptUrl || !navigator.onLine || !currentUser) return;

        try {
            const response = await fetch(`${appScriptUrl}?t=${Date.now()}`);
            if (!response.ok) return;

            const text = await response.text();
            if (!text || text.trim().startsWith('<')) return;

            const json = JSON.parse(text);
            const serverAcknowledgements = (json['Acknowledgements'] || []).map((id: any) => String(id));
            const now = Date.now();

            let allAlerts: AppNotification[] = [];

            // Check against REF (the absolute latest list)
            const isDismissed = (id: string) => dismissedRef.current.includes(String(id));
            const isRead = (id: string) => readRef.current.includes(String(id));

            // --- 1. Inspection Alerts Logic ---
            const processForAlerts = (rows: any[], type: string): AppNotification[] => {
                if (!Array.isArray(rows) || rows.length <= 1) return [];
                const rateIndex = type === 'General' ? 8 : 9;
                const truckIndex = 2;
                
                const alerts: AppNotification[] = [];
                // Look at more rows to ensure we catch everything, but we will filter by date
                const recentRows = rows.slice(Math.max(1, rows.length - 100));
                
                recentRows.forEach((row: any[]) => {
                    const rate = Number(row[rateIndex]);
                    const truck = String(row[truckIndex] || 'Unknown').trim();
                    const tsRaw = String(row[1]); 
                    const tsParsed = Date.parse(tsRaw);

                    // FIX: Ignore alerts older than 48 hours to prevent "Old" popups
                    if (isNaN(tsParsed) || (now - tsParsed > ALERT_MAX_AGE_MS)) {
                        return;
                    }
                    
                    // NORMALIZED STABLE ID (Use MS timestamp for absolute stability)
                    const alertId = `INS_${type}_${tsParsed}_${truck.replace(/[^a-z0-9]/gi, '')}`;

                    if (isDismissed(alertId) || serverAcknowledgements.includes(alertId)) return;

                    if (rate <= 2 || rate === 3) {
                        alerts.push({
                            id: alertId,
                            title: rate <= 2 ? `Critical: ${truck}` : `Warning: ${truck}`,
                            message: `${type} check rated ${rate}/5.`,
                            type: rate <= 2 ? 'critical' : 'warning',
                            timestamp: tsRaw,
                            read: isRead(alertId),
                            module: type
                        });
                    }
                });
                return alerts;
            };

            // --- 2. System Notifications ---
            const systemRows = json['SystemNotification'] || [];
            const userEmail = currentUser.username.toLowerCase().trim();
            const userRole = currentUser.role.toLowerCase().trim();

            if (Array.isArray(systemRows) && systemRows.length > 1) {
                systemRows.forEach((row: any[]) => {
                    const notifId = String(row[0]);
                    if (isDismissed(notifId)) return;

                    const recipientId = String(row[1]).trim().toLowerCase();
                    const isReadOnServer = String(row[5]).toUpperCase() === 'TRUE';
                    
                    const isForUser = recipientId === userEmail;
                    const isForRole = recipientId === userRole || (userRole === 'superadmin' && recipientId === 'admin');
                    const isForAll = recipientId === 'all';
                    
                    if (!isReadOnServer && (isForUser || isForRole || isForAll)) {
                        allAlerts.push({
                            id: notifId,
                            title: 'System Message',
                            message: String(row[3]),
                            type: String(row[2]).toLowerCase() as any || 'info',
                            timestamp: row[4],
                            read: isRead(notifId),
                            actionLink: row[6],
                            isServerEvent: true,
                            module: 'System'
                        });
                    }
                });
            }

            // --- 3. Tickets ---
            const ticketRows = json['Support_Tickets'] || [];
            if (Array.isArray(ticketRows) && ticketRows.length > 1) {
                ticketRows.slice(Math.max(1, ticketRows.length - 30)).forEach((row: any[]) => {
                    const ticketId = String(row[0]); 
                    const status = row[9];
                    const tsRaw = String(row[8]);
                    const tsParsed = Date.parse(tsRaw);
                    const alertId = `TKT_ALERT_${ticketId}`; 
                    
                    // FIX: Ignore tickets older than 48 hours for notifications
                    if (isNaN(tsParsed) || (now - tsParsed > ALERT_MAX_AGE_MS)) {
                        return;
                    }

                    if (isDismissed(alertId)) return;

                    if ((userRole === 'admin' || userRole === 'superadmin') && status === 'Open') {
                        allAlerts.push({
                            id: alertId,
                            title: 'New Ticket',
                            message: `#${ticketId}: ${row[2]}`,
                            type: 'info',
                            timestamp: tsRaw,
                            read: isRead(alertId),
                            module: 'Support',
                            actionLink: 'view:support'
                        });
                    }
                });
            }

            if (json['General']) allAlerts = [...allAlerts, ...processForAlerts(json['General'], 'General')];
            if (json['Petroleum']) allAlerts = [...allAlerts, ...processForAlerts(json['Petroleum'], 'Petroleum')];
            if (json['Petroleum_V2']) allAlerts = [...allAlerts, ...processForAlerts(json['Petroleum_V2'], 'Petroleum_V2')];
            if (json['Acid']) allAlerts = [...allAlerts, ...processForAlerts(json['Acid'], 'Acid')];
            
            allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (allAlerts.length > MAX_NOTIFICATIONS) allAlerts = allAlerts.slice(0, MAX_NOTIFICATIONS);

            // Toast only for truly new items
            const newItems = allAlerts.filter(a => !notifiedIds.includes(a.id) && !a.read && !isDismissed(a.id));
            if (newItems.length > 0) {
                const latest = newItems[0];
                if (latest.type === 'critical') showToast(latest.message, 'error');
                setNotifiedIds(prev => [...new Set([...prev, ...newItems.map(a => a.id)])]);
            }

            setNotifications(allAlerts);
        } catch (e) {}
    };

    const handleMarkNotificationRead = async (id: string, onNavigate?: (module: string) => void) => {
        setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
        const newReadIds = [...new Set([...readRef.current, String(id)])];
        saveReadState(newReadIds);
        
        const target = notifications.find(n => n.id === id);
        if (target?.isServerEvent && appScriptUrl && navigator.onLine) {
            try {
                await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'mark_notification_read', id: id }), mode: 'no-cors' });
            } catch(e) {}
        }
        if (target?.actionLink && onNavigate) onNavigate(target.actionLink);
    };

    const handleDismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        const newDismissedIds = [...new Set([...dismissedRef.current, String(id)])];
        saveDismissedState(newDismissedIds);
    };

    const handleGlobalAcknowledge = async (id: string) => {
        if (!appScriptUrl || !navigator.onLine) return;
        setNotifications(prev => prev.filter(n => n.id !== id));
        const newDismissedIds = [...new Set([...dismissedRef.current, String(id)])];
        saveDismissedState(newDismissedIds);

        try {
            await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'acknowledge_issue', issueId: id, user: currentUser?.name, role: currentUser?.role }),
                mode: 'no-cors'
            });
            showToast("Acknowledge recorded.", 'success');
        } catch (e) {}
    };

    const handleClearAllNotifications = () => {
        const allIds = notifications.map(n => String(n.id));
        const newDismissedIds = [...new Set([...dismissedRef.current, ...allIds])];
        saveDismissedState(newDismissedIds);
        setNotifications([]);
    };

    const requestPushPermission = async () => {
        if (!('Notification' in window)) return;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') setPushEnabled(true);
    };

    return {
        notifications,
        fetchNotifications,
        handleMarkNotificationRead,
        handleDismissNotification,
        handleGlobalAcknowledge,
        handleClearAllNotifications,
        requestPushPermission,
        pushEnabled
    };
};