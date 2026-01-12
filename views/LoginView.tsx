
import React, { useState, useEffect } from 'react';
import { User, SystemSettings } from '../types';

interface LoginViewProps {
  onLogin: (user: User) => void;
  appScriptUrl: string;
  setAppScriptUrl: (url: string) => void;
  settings: SystemSettings;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, appScriptUrl, setAppScriptUrl, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [showUrlSetup, setShowUrlSetup] = useState(false);
  const [tempUrl, setTempUrl] = useState(appScriptUrl);

  // Load remembered credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem('sc_remembered_creds');
    if (saved) {
      try {
        const { u, p } = JSON.parse(atob(saved));
        setUsername(u);
        setPassword(p);
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem('sc_remembered_creds');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appScriptUrl || !appScriptUrl.startsWith('https://script.google.com')) {
      setError("System connection not configured. Please click the setup icon below.");
      setShowUrlSetup(true);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const payload = isRegistering 
        ? { action: 'register_user', username, password, name: fullName, position: position, role: 'SuperAdmin' }
        : { action: 'login', username, password };

      const response = await fetch(appScriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (result.status === 'success') {
          const rawUser = result.user;
          
          if (rememberMe && password) {
            const creds = btoa(JSON.stringify({ u: username, p: password }));
            localStorage.setItem('sc_remembered_creds', creds);
          } else {
            localStorage.removeItem('sc_remembered_creds');
          }

          if (isRegistering) {
              setError("Admin account created. Log in now.");
              setIsRegistering(false);
              setFullName('');
              setPosition('');
              setPassword('');
          } else {
              let safeRole: User['role'] = 'Inspector';
              const rawRole = rawUser.role ? String(rawUser.role).trim().toLowerCase() : '';
              
              if (rawRole === 'superadmin') safeRole = 'SuperAdmin';
              else if (rawRole === 'admin') safeRole = 'Admin';
              else if (rawRole === 'operations') safeRole = 'Operations';
              else if (rawRole === 'maintenance') safeRole = 'Maintenance';
              else if (rawRole === 'secretary') safeRole = 'Secretary';
              else if (rawRole === 'other') safeRole = 'Other';
              
              onLogin({ 
                ...rawUser, 
                role: safeRole, 
                position: rawUser.position || '',
                needsSetup: !rawUser.name // Logic: If no name, they must go through setup
              });
          }
      } else if (result.code === 'NO_USERS') {
          setError("Initial setup needed. Create Master Admin.");
          setIsRegistering(true);
      } else {
          setError(result.message || "Authentication failed.");
      }

    } catch (err) {
      setError("Unable to reach server. Check your Internet and Engine URL.");
    } finally {
      setIsLoading(false); 
    }
  };

  const handleSaveUrl = () => {
      if (tempUrl.startsWith('https://script.google.com')) {
          setAppScriptUrl(tempUrl);
          localStorage.setItem('safetyCheck_scriptUrl', tempUrl);
          setShowUrlSetup(false);
          setError('');
      } else {
          alert("Please enter a valid Google Apps Script Executable URL.");
      }
  };

  const isUrlValid = appScriptUrl && appScriptUrl.startsWith('https://script.google.com');

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row font-sans text-slate-700 overflow-hidden">
      
      {/* Brand Panel */}
      <div className="w-full md:w-[35%] lg:w-[30%] bg-emerald-950 p-4 sm:p-6 md:p-12 flex flex-col justify-between relative overflow-hidden shrink-0 border-b md:border-b-0 border-emerald-900 shadow-xl z-10">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-400 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 flex md:block items-center justify-between">
          <div className="bg-white p-1.5 rounded-xl inline-block shadow-lg">
             {settings.companyLogo && !logoError ? (
                <img src={settings.companyLogo} alt="Logo" className="h-6 sm:h-8 md:h-12 w-auto object-contain" onError={() => setLogoError(true)} />
             ) : (
                <div className="flex items-center gap-1.5 px-1">
                    <svg className="w-5 h-5 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-black text-emerald-950 text-sm md:text-xl tracking-tight uppercase">SafetyPro</span>
                </div>
             )}
          </div>
          
          <div className="md:mt-8 text-right md:text-left">
            <h1 className="text-sm sm:text-lg md:text-3xl font-black text-white leading-tight uppercase">
                {settings.companyName || 'SafetyPro Fleet'}
            </h1>
            <p className="text-emerald-400 font-bold uppercase tracking-widest text-[7px] sm:text-[9px] mt-0.5 opacity-60">fleet inspection portal</p>
          </div>
        </div>

        <div className="relative z-10 mt-2 sm:mt-4 space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2 animate-fadeIn group" onClick={() => setShowUrlSetup(true)}>
                <div className={`w-[3px] h-4 rounded-full transition-all duration-500 
                    ${isLoading ? 'bg-blue-400 animate-pulse' : isUrlValid ? 'bg-emerald-500 shadow-sm' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                ></div>
                <div className="flex flex-col">
                    <span className={`text-[8px] sm:text-[9px] font-black tracking-widest leading-none uppercase 
                        ${isLoading ? 'text-blue-200' : isUrlValid ? 'text-white' : 'text-red-300'}`}
                    >
                        {isLoading ? 'Processing' : isUrlValid ? 'Engine Online' : 'Server Offline'}
                    </span>
                </div>
            </div>
            <div className="hidden sm:block border-t border-white/5 pt-2 sm:pt-4">
                <span className="text-[7px] sm:text-[8px] text-emerald-100/30 font-medium uppercase tracking-[0.2em]">© SCBC FLEET SOLUTIONS 2026</span>
            </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        <div className="flex-1 px-6 flex items-center justify-center">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-4 sm:mb-8 text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {isRegistering ? 'Admin Setup' : 'Login'}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-medium">
                {isRegistering ? 'Create system owner account.' : 'Sign in to access inspections.'}
              </p>
            </div>

            {error && (
              <div className={`mb-4 p-3 rounded-lg text-[11px] font-medium border animate-fadeIn
                ${error.includes("created") ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {isRegistering && (
                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-2">
                  <input type="text" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs sm:text-sm font-bold" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
                  <input type="text" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs sm:text-sm font-bold" value={position} onChange={e => setPosition(e.target.value)} placeholder="Job Title" />
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <input 
                  type="email" 
                  required 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-bold text-xs sm:text-sm" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="Email Address"
                />
                {!isRegistering && (
                  <div className="space-y-1">
                    <input 
                      type="password" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-bold text-xs sm:text-sm" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="Password"
                    />
                    <p className="text-[9px] sm:text-[10px] text-slate-400 px-1">First-time login? Leave blank if invited.</p>
                  </div>
                )}
                {isRegistering && (
                  <input type="password" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-xs sm:text-sm" value={password} onChange={e => setPassword(e.target.value)} placeholder="Setup Password" />
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                      <span className="text-[11px] text-slate-400 font-medium group-hover:text-slate-600">Stay signed in</span>
                  </label>
              </div>

              <div className="pt-2 sm:pt-4">
                <button 
                  type="submit" 
                  disabled={isLoading || !isUrlValid} 
                  className={`w-full h-12 sm:h-14 rounded-xl font-bold text-white shadow-lg transition-all text-[11px] uppercase tracking-widest active:scale-[0.98] flex items-center justify-center gap-3
                    ${!isUrlValid ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' : isLoading ? 'bg-emerald-900 cursor-wait' : 'bg-slate-900 hover:bg-black'}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-emerald-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : null}
                  {isLoading ? 'Verifying...' : isRegistering ? 'Create Admin' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Setup Toggle */}
        <button 
            onClick={() => setShowUrlSetup(!showUrlSetup)}
            className="absolute bottom-6 right-6 p-3 text-slate-300 hover:text-indigo-600 transition-colors"
            title="Engine Configuration"
        >
            <svg className={`w-5 h-5 ${!isUrlValid ? 'text-red-400 animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>

        {showUrlSetup && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 animate-fadeIn">
                <div className="w-full max-w-sm space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">System Infrastructure</h3>
                        <p className="text-xs text-slate-400 mt-1">Configure your private Google Apps Script backend URL to connect the fleet database.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Script Deployment URL</label>
                        <input 
                            type="text" 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-4 focus:ring-indigo-50"
                            placeholder="https://script.google.com/macros/s/..."
                            value={tempUrl}
                            onChange={e => setTempUrl(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowUrlSetup(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={handleSaveUrl} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Apply Connection</button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Mobile Footer */}
        <div className="sm:hidden text-center pb-4">
            <span className="text-[7px] text-slate-300 font-medium uppercase tracking-[0.2em]">© SCBC FLEET SOLUTIONS 2026</span>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
