import { useState, useEffect } from 'react';
import { SubscriptionDetails, User } from '../types';

export const useSubscription = (appScriptUrl: string, currentUser: User | null) => {
    const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSubscription = async () => {
        if (!appScriptUrl || typeof appScriptUrl !== 'string' || !appScriptUrl.startsWith('http')) return;
        if (!currentUser) return;
        
        setIsLoading(true);
        try {
            const response = await fetch(`${appScriptUrl}?t=${new Date().getTime()}`);
            if (!response.ok) return;

            const json = await response.json();
            
            if (json['Subscription_Data']) {
                const data = json['Subscription_Data'];
                const current = data.current || data; 
                const serverHistory = data.history || [];
                
                // Robust date parsing: Normalize to the end of that specific day
                const rawDateStr = String(current.expiryDate || '').trim();
                
                // STRICTOR CHECK: If there is no date string, it is absolutely expired.
                if (!rawDateStr || rawDateStr === "undefined" || rawDateStr === "null" || rawDateStr === "") {
                    setSubscription({
                        status: 'Expired',
                        plan: 'None',
                        expiryDate: '',
                        daysRemaining: 0
                    });
                    setHistory(serverHistory);
                    return;
                }

                const dateOnly = rawDateStr.split('T')[0];
                const parts = dateOnly.split('-');
                
                let expiry: Date;
                if (parts.length === 3) {
                    // Set to 23:59:59 of the expiry date
                    expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
                } else {
                    expiry = new Date(rawDateStr);
                    expiry.setHours(23, 59, 59, 999);
                }
                
                if (isNaN(expiry.getTime())) {
                    // Invalid date parsed
                    setSubscription({
                        status: 'Expired',
                        plan: 'None',
                        expiryDate: '',
                        daysRemaining: 0
                    });
                    return;
                }

                const now = new Date();
                const diffTime = expiry.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                // Overriding sheet status if time has run out or date is invalid
                const isSystemExpired = diffDays <= 0;

                setSubscription({
                    status: isSystemExpired ? 'Expired' : (current.status || 'Active'),
                    plan: current.plan || 'Standard',
                    expiryDate: dateOnly,
                    daysRemaining: Math.max(0, diffDays)
                });
                setHistory(serverHistory);
            } else {
                // Failsafe: No sheet data at all = Expired
                setSubscription({
                    status: 'Expired',
                    plan: 'None',
                    expiryDate: '',
                    daysRemaining: 0
                });
            }
        } catch (error) {
            console.error("Subscription fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, [appScriptUrl, currentUser]);

    return { subscription, history, isLoading, refreshSubscription: fetchSubscription };
};