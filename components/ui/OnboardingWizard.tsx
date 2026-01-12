
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
    
    // Identity & Setup State
    const [fullName, setFullName] = useState(user.name || '');
    const [email, setEmail] = useState(user.username || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Notifications
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

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-4 animate-fadeIn">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* Left Branding Panel */}
                <div className="md:w-5/12 bg-slate-900 p-10 flex flex-col justify-between text-white relative">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-8">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                        </div>
                        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight leading-none">Welcome to<br/>SafetyCheck</h1>
                        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest opacity-60">Account Setup</p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        {[
                            { s: 0, l: 'Your Details' },
                            { s: 1, l: 'Password' },
                            { s: 2, l: 'Notifications' }
                        ].map(item => (
                            <div key={item.s} className={`flex items-center gap-4 transition-all duration-500 ${step >= item.s ? 'opacity-100' : 'opacity-20'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step > item.s ? 'bg-emerald-500 border-emerald-500 text-white' : step === item.s ? 'border-blue-400 text-blue-400' : 'border-slate-700 text-slate-700'} font-bold text-xs`}>
                                    {step > item.s ? '✓' : item.s + 1}
                                </div>
                                <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{item.l}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Interactive Panel */}
                <div className="md:w-7/12 p-8 md:p-14 bg-white flex flex-col justify-center relative">
                    
                    {step === 0 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">Your Profile</h2>
                            <p className="text-slate-500 text-sm mb-8">Confirm your name and email to start using the app.</p>
                            <form onSubmit={handleStepSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        autoFocus 
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800" 
                                        value={fullName} 
                                        onChange={e => setFullName(e.target.value)} 
                                        placeholder="e.g. John Smith" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">Login Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value.toLowerCase())} 
                                        placeholder="email@company.com" 
                                    />
                                </div>
                                {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg">{error}</div>}
                                <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl uppercase tracking-widest text-xs mt-4">
                                    Next Step
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">Secure Your Account</h2>
                            <p className="text-slate-500 text-sm mb-8">Create a password you will use to log in next time.</p>
                            <form onSubmit={handleStepSubmit} className="space-y-4">
                                <div className="space-y-4">
                                    <input type="password" autoFocus required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" />
                                    <input type="password" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat Password" />
                                </div>
                                {error && <div className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-lg">{error}</div>}
                                <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-xl uppercase tracking-widest text-xs mt-4">
                                    Continue
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">Email Settings</h2>
                            <p className="text-slate-500 text-sm mb-8">Choose which inspections you want to be notified about.</p>
                            
                            <div className="space-y-4 mb-8">
                                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                                    <span className="text-sm font-bold text-slate-800">Send Email Alerts</span>
                                    <input type="checkbox" className="w-5 h-5 rounded text-blue-600" checked={prefs.emailNotifications} onChange={() => setPrefs(p => ({...p, emailNotifications: !p.emailNotifications}))} />
                                </label>

                                <div className={`grid grid-cols-2 gap-3 ${!prefs.emailNotifications && 'opacity-30 pointer-events-none'}`}>
                                    {[
                                        { k: 'notifyGeneral', l: 'General' },
                                        { k: 'notifyPetroleum', l: 'Petro V1' },
                                        { k: 'notifyPetroleumV2', l: 'Petro V2' },
                                        { k: 'notifyAcid', l: 'Acid' }
                                    ].map(m => (
                                        <label key={m.k} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg cursor-pointer">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{m.l}</span>
                                            <input type="checkbox" className="w-4 h-4 rounded text-blue-600" checked={prefs[m.k as keyof UserPreferences] as boolean} onChange={() => setPrefs(p => ({...p, [m.k]: !p[m.k as keyof UserPreferences]}))} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg mb-4">{error}</div>}

                            <button onClick={handleFinalize} disabled={isLoading} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                {isLoading ? 'Saving...' : 'Finish Setup'}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 text-emerald-600">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">Account Ready</h2>
                            <p className="text-slate-500 text-sm mb-10">Your profile is all set. You can now access the fleet portal.</p>
                            <button 
                                onClick={() => onComplete({ ...user, username: email, name: fullName, preferences: prefs, needsSetup: false })} 
                                className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[11px]"
                            >
                                Open Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingWizard;
