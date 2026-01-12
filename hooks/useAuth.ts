
import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';

// Professional Session Constraints
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes inactivity
const MAX_SESSION_MS = 12 * 60 * 60 * 1000; // 12 Hours absolute max

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sessionExpired, setSessionExpired] = useState<'idle' | 'max_duration' | null>(null);
    
    // Refs to track timers without re-renders
    const lastActivityRef = useRef<number>(Date.now());
    const sessionStartRef = useRef<number>(Date.now());
    const timerRef = useRef<number | null>(null);

    // 1. Initialize & Check Session on Mount
    useEffect(() => {
        const savedUser = localStorage.getItem('safetyCheck_user');
        const savedSessionStart = localStorage.getItem('safetyCheck_session_start');
        
        if (savedUser) {
            try { 
                // Check Absolute Session Expiry
                if (savedSessionStart) {
                    const elapsed = Date.now() - parseInt(savedSessionStart);
                    if (elapsed > MAX_SESSION_MS) {
                        handleLogout('max_duration');
                        return;
                    }
                    sessionStartRef.current = parseInt(savedSessionStart);
                } else {
                    localStorage.setItem('safetyCheck_session_start', Date.now().toString());
                }

                const u = JSON.parse(savedUser);
                // Normalize role case for consistency
                const rawRole = u.role ? String(u.role).trim().toLowerCase() : '';
                if (rawRole === 'admin') u.role = 'Admin';
                else if (rawRole === 'operations') u.role = 'Operations';
                else if (rawRole === 'maintenance') u.role = 'Maintenance';
                else if (rawRole === 'secretary') u.role = 'Secretary';
                else if (rawRole === 'other') u.role = 'Other';
                else if (rawRole === 'superadmin') u.role = 'SuperAdmin';
                else u.role = 'Inspector';

                // CRITICAL: Strict Onboarding Check
                // A user needs setup if they have no Name or if needsSetup is explicitly true
                u.needsSetup = !u.name || u.needsSetup === true;
                
                setCurrentUser(u); 
                startActivityListeners();
            } catch(e) {
                handleLogout(); 
            }
        }
    }, []);

    const updateActivity = useCallback(() => {
        if (!currentUser) return;
        const now = Date.now();
        if (now - lastActivityRef.current > 1000) {
            lastActivityRef.current = now;
            localStorage.setItem('safetyCheck_last_activity', now.toString());
        }
    }, [currentUser]);

    const startActivityListeners = () => {
        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('touchstart', updateActivity);
        window.addEventListener('click', updateActivity);
        
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(checkSessionStatus, 60000); 
    };

    const stopActivityListeners = () => {
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('touchstart', updateActivity);
        window.removeEventListener('click', updateActivity);
        
        if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const checkSessionStatus = () => {
        const now = Date.now();
        if (now - lastActivityRef.current > IDLE_TIMEOUT_MS) {
            handleLogout('idle');
            return;
        }
        if (now - sessionStartRef.current > MAX_SESSION_MS) {
            handleLogout('max_duration');
            return;
        }
    };

    const handleLogin = (user: User) => {
        const now = Date.now();
        // Recalculate needsSetup upon login
        const userToStore = {
            ...user,
            needsSetup: !user.name || user.needsSetup === true
        };
        
        setCurrentUser(userToStore);
        localStorage.setItem('safetyCheck_user', JSON.stringify(userToStore));
        localStorage.setItem('safetyCheck_session_start', now.toString());
        localStorage.setItem('safetyCheck_last_activity', now.toString());
        sessionStartRef.current = now;
        lastActivityRef.current = now;
        setSessionExpired(null);
        startActivityListeners();
    };

    const handleLogout = (reason?: 'idle' | 'max_duration') => {
        stopActivityListeners();
        setCurrentUser(null);
        if (reason) setSessionExpired(reason);
        
        const keysToRemove = [
            'safetyCheck_user',
            'safetyCheck_session_start',
            'safetyCheck_last_activity',
            'sc_validation_lists'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
    };

    return { 
        currentUser, 
        setCurrentUser, 
        handleLogin, 
        handleLogout,
        sessionExpired,
        setSessionExpired
    };
};
