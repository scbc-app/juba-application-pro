
import React, { useState } from 'react';
import { User, UserPreferences } from '../../types';

interface OnboardingWizardProps {
    user: User;
    appScriptUrl: string;
    onComplete: (updatedUser: User) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ user, appScriptUrl, onComplete }) => {
    const [step, setStep] = useState(0); // 0: Identity, 1: Security, 2: Notifications, 3: Success
    const [isLoading, setIsLoading] = useState(false);
    
    const [fullName, setFullName] = useState(user.name || '');
    const [email, setEmail] = useState(user.username || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const [prefs, setPrefs] = useState<UserPreferences>({
        emailNotifications: true,
        notifyGeneral: true,
        notifyPetroleum: true,
        notifyPetroleumV2: true,
        notifyAcid: true
    });

    const nextStep = () => {
        setError('');
        setStep(prev => prev + 1);
    };

    const handleStepSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 0) {
            if (!fullName.trim()) { setError("Please enter your name."); return; }
            if (!email.trim() || !email.includes('@')) { setError("Please enter a valid email."); return; }
        }
        if (step === 1) {
            if (newPassword.length < 4) { setError("Password must be at least 4 characters."); return; }
            if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
        }
        nextStep();
    };

    const handleFinalize = async () => {
        setIsLoading(true);
        setError('');
        try {
            const payload = {
                action: 'update_user',
                originalUsername: user.username,
                username: email,
                name: fullName,
                password: newPassword,
                preferences: { ...prefs, hasCompletedTour: false }
            };

            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                setStep(3);
            } else {
                setError(result.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Connection error. Check your internet.");
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { l: 'Identity' },
        { l: 'Security' },
        { l: 'Alerts' }
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-0 sm:p-4 animate-fadeIn overflow-hidden">
            <div className="w-full h-full sm:h-auto sm:max-w-4xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Responsive Progress Bar / Sidebar */}
                <div className="md:w-5/12 bg-slate-900 p-5 md:p-10 flex flex-row md:flex-col justify-between items-center md:items-start text-white shrink-0 border-b border-white/5 md:border-none">
                    <div className="relative z-10 flex items-center md:block gap-3">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-indigo-600 rounded-lg md:rounded-2xl flex items-center justify-center md:mb-8">
                            <svg className="w-4 h-4 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                        </div>
                        <div className="md:block">
                            <h1 className="text-sm md:text-3xl font-black md:mb-2 uppercase tracking-tight leading-none">SafetyCheck</h1>
                            <p className="hidden md:block text-indigo-400 text-[10px] font-bold uppercase tracking-widest opacity-60">Account Setup</p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-row md:flex-col gap-2 md:gap-6">
                        {steps.map((item, idx) => (
                            <div key={idx} className={`flex items-center gap-2 md:gap-4 transition-all duration-500 ${step >= idx ? 'opacity-100' : 'opacity-20'}`}>
                                <div className={`w-5 h-5 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${step > idx ? 'bg-emerald-500 border-emerald-500 text-white' : step === idx ? 'border-indigo-400 text-indigo-400' : 'border-slate-700 text-slate-700'} font-bold text-[10px] md:text-xs`}>
                                    {step > idx ? '✓' : idx + 1}
                                </div>
                                <span className="hidden md:block font-bold text-[10px] uppercase tracking-[0.2em]">{item.l}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Interactive Panel */}
                <div className="flex-1 p-6 md:p-14 bg-white flex flex-col justify-center relative overflow-y-auto">
                    
                    {step === 0 && (
                        <div className="animate-fadeIn w-full max-w-sm mx-auto">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1 uppercase tracking-tight">Your Profile</h2>
                            <p className="text-slate-400 text-xs mb-6 md:mb-8 font-medium">Verification required for log access.</p>
                            <form onSubmit={handleStepSubmit} className="space-y-4 md:space-y-5">
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        autoFocus 
                                        required
                                        className="w-full p-3.5 md:p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 transition-all" 
                                        value={fullName} 
                                        onChange={e => setFullName(e.target.value)} 
                                        placeholder="e.g. John Smith" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">Login Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full p-3.5 md:p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 transition-all" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value.toLowerCase())} 
                                        placeholder="email@company.com" 
                                    />
                                </div>
                                {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg border border-red-100">{error}</div>}
                                <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all mt-2">
                                    Continue Setup
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="animate-fadeIn w-full max-w-sm mx-auto">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1 uppercase tracking-tight">Security</h2>
                            <p className="text-slate-400 text-xs mb-6 md:mb-8 font-medium">Establish your unique access code.</p>
                            <form onSubmit={handleStepSubmit} className="space-y-3 md:space-y-4">
                                <input type="password" autoFocus required className="w-full p-3.5 md:p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 transition-all" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter New Password" />
                                <input type="password" required className="w-full p-3.5 md:p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 transition-all" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat Password" />
                                {error && <div className="text-red-600 text-[10px] font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                                <button type="submit" className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all mt-4">
                                    Secure Account
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn w-full max-w-sm mx-auto">
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1 uppercase tracking-tight">Email Alerts</h2>
                            <p className="text-slate-400 text-xs mb-6 md:mb-8 font-medium">Manage your notification stream.</p>
                            
                            <div className="space-y-3 mb-6 md:mb-8">
                                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer group hover:bg-slate-100 transition-colors">
                                    <span className="text-xs font-bold text-slate-800">Master Email Alert</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={prefs.emailNotifications} onChange={() => setPrefs(p => ({...p, emailNotifications: !p.emailNotifications}))} />
                                </label>

                                <div className={`grid grid-cols-2 gap-2 ${!prefs.emailNotifications && 'opacity-25 pointer-events-none'}`}>
                                    {[
                                        { k: 'notifyGeneral', l: 'General' },
                                        { k: 'notifyPetroleum', l: 'Petro V1' },
                                        { k: 'notifyPetroleumV2', l: 'Petro V2' },
                                        { k: 'notifyAcid', l: 'Acid' }
                                    ].map(m => (
                                        <label key={m.k} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-indigo-200 transition-all">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase">{m.l}</span>
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" checked={prefs[m.k as keyof UserPreferences] as boolean} onChange={() => setPrefs(p => ({...p, [m.k]: !p[m.k as keyof UserPreferences]}))} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg mb-4 border border-red-100">{error}</div>}

                            <button onClick={handleFinalize} disabled={isLoading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                                {isLoading ? (
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : 'Complete Enrollment'}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-fadeIn w-full max-w-sm mx-auto">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-emerald-100 text-emerald-600 shadow-inner">
                                <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Identity Verified</h2>
                            <p className="text-slate-400 text-xs mb-8 md:mb-10 font-medium">Welcome to the SafetyCheck Pro Fleet Portal.</p>
                            <button 
                                onClick={() => onComplete({ ...user, username: email, name: fullName, preferences: prefs, needsSetup: false })} 
                                className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl uppercase tracking-[0.25em] text-[10px] shadow-xl active:scale-95 transition-all"
                            >
                                Open Fleet Terminal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
