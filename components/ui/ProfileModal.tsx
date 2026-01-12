import React, { useState } from 'react';
import { User, SystemSettings, UserPreferences } from '../../types';

interface ProfileModalProps {
    user: User;
    settings: SystemSettings;
    appScriptUrl: string;
    onClose: () => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onUpdateSuccess: (newUser: User) => void;
    onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ 
    user, 
    settings, 
    appScriptUrl, 
    onClose, 
    showToast, 
    onUpdateSuccess, 
    onLogout
}) => {
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Password State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Preferences State
    const [prefs, setPrefs] = useState<UserPreferences>(user.preferences || {
        emailNotifications: true,
        notifyGeneral: true,
        notifyPetroleum: true,
        notifyPetroleumV2: true,
        notifyAcid: true
    });
    const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);

    const handlePasswordChange = async () => {
        if (!password) {
            showToast("Please enter a new password.", "warning");
            return;
        }
        if (password !== confirmPassword) {
            showToast("Passwords do not match.", "error");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update_user',
                    originalUsername: user.username,
                    password: password
                })
            });
            const result = await response.json();

            if (result.status === 'success') {
                showToast("Security updated!", 'success');
                setPassword('');
                setConfirmPassword('');
            } else {
                showToast(result.message || "Failed to update.", 'error');
            }
        } catch (e) {
            showToast("Sync failed.", 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleUpdatePrefs = async (newPrefs: UserPreferences) => {
        setPrefs(newPrefs);
        setIsUpdatingPrefs(true);
        try {
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update_user',
                    originalUsername: user.username,
                    preferences: newPrefs
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                onUpdateSuccess({ ...user, preferences: newPrefs });
                showToast("Preferences synced.", 'success');
            }
        } catch (e) {
            showToast("Sync failed.", 'error');
        } finally {
            setIsUpdatingPrefs(false);
        }
    };

    const togglePref = (key: keyof UserPreferences) => {
        const next = { ...prefs, [key]: !prefs[key] };
        handleUpdatePrefs(next);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fadeIn overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center shrink-0 z-10 shadow-sm">
                <button 
                    onClick={onClose}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <h1 className="flex-1 text-center font-bold text-slate-800 text-sm uppercase tracking-widest">My Workspace</h1>
                <div className="w-10"></div>
            </div>

            <div className="max-w-2xl mx-auto w-full px-6 py-10 space-y-12 pb-24">
                
                {/* 1. YOUR DETAILS */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-2 uppercase tracking-tight">Identity Profile</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm py-1">
                            <span className="font-semibold text-slate-600">Organization</span>
                            <span className="text-slate-400 font-medium">{settings.companyName || 'Transport Pro'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-1">
                            <span className="font-semibold text-slate-600">First Name</span>
                            <span className="text-slate-400 font-medium">{firstName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-1">
                            <span className="font-semibold text-slate-600">Last Name</span>
                            <span className="text-slate-400 font-medium">{lastName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-1">
                            <span className="font-semibold text-slate-600">Login ID</span>
                            <span className="text-slate-400 font-medium">{user.username}</span>
                        </div>
                    </div>
                </section>

                {/* 2. CHANGE PASSWORD */}
                <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-gray-100 pb-2 uppercase tracking-tight">Security Access</h3>
                    <div className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="Set New Password"
                            className="w-full p-3.5 border border-gray-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input 
                            type="password" 
                            placeholder="Confirm Password"
                            className="w-full p-3.5 border border-gray-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button 
                            onClick={handlePasswordChange}
                            disabled={isUpdatingPassword}
                            className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                        >
                            {isUpdatingPassword ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Verifying...
                                </>
                            ) : 'Update Security'}
                        </button>
                    </div>
                </section>

                {/* 3. EMAIL NOTIFICATIONS */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Alert Preferences</h3>
                        {isUpdatingPrefs && <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    </div>
                    
                    <div className="space-y-2">
                        <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer group">
                            <div>
                                <p className="text-sm font-bold text-slate-800">Master Email Alert</p>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Automated system triggers</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={prefs.emailNotifications} onChange={() => togglePref('emailNotifications')} />
                        </label>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 transition-opacity duration-300 ${!prefs.emailNotifications && 'opacity-40 pointer-events-none'}`}>
                            {[
                                { key: 'notifyGeneral', label: 'General Fleet' },
                                { key: 'notifyPetroleum', label: 'Petroleum V1' },
                                { key: 'notifyPetroleumV2', label: 'Petroleum V2' },
                                { key: 'notifyAcid', label: 'Acid Tankers' }
                            ].map((item) => (
                                <label key={item.key} className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 text-blue-600" 
                                        checked={prefs[item.key as keyof UserPreferences] as boolean} 
                                        onChange={() => togglePref(item.key as keyof UserPreferences)} 
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. LOGOUT */}
                <section className="pt-8">
                    <button 
                        onClick={onLogout}
                        className="w-full py-4 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] active:scale-95 text-xs"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3-0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sign Out
                    </button>
                </section>
            </div>
        </div>
    );
};

export default ProfileModal;