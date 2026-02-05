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
      setError("System connection required. Click the gear icon below.");
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
              setError("Admin created. Please sign in.");
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
              else if (rawRole === 'other') safeRole = 'Other';
              
              onLogin({ 
                ...rawUser, 
                role: safeRole, 
                position: rawUser.position || '',
                needsSetup: !rawUser.name
              });
          }
      } else if (result.code === 'NO_USERS') {
          setError("Initial setup: Create administrator.");
          setIsRegistering(true);
      } else {
          setError(result.message || "Sign in failed.");
      }

    } catch (err) {
      setError("Cannot reach server. Check internet and URL.");
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
          alert("Invalid URL. Must be a Google Apps Script endpoint.");
      }
  };

  const isUrlValid = appScriptUrl && appScriptUrl.startsWith('https://script.google.com');

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col md:flex-row font-sans text-slate-700 overflow-hidden">
      
      {/* Brand Panel */}
      <div className="w-full md:w-[35%] lg:w-[30%] bg-slate-900 p-6 md:p-12 flex flex-col justify-between shrink-0 border-b md:border-none shadow-xl z-10">
        <div className="flex md:block items-center justify-between">
          <div className="bg-white p-2 rounded-xl inline-block">
             {settings.companyLogo && !logoError ? (
                <img src={settings.companyLogo} alt="Logo" className="h-6 sm:h-10 w-auto object-contain" onError={() => setLogoError(true)} />
             ) : (
                <div className="flex items-center gap-1.5 px-2">
                    <span className="font-bold text-slate-900 text-lg uppercase tracking-tight">SafetyCheck</span>
                </div>
             )}
          </div>
          
          <div className="md:mt-10 text-right md:text-left">
            <h1 className="text-lg sm:text-2xl font-semibold text-white leading-tight uppercase">
                {settings.companyName || 'Fleet Portal'}
            </h1>
            <p className="text-slate-400 font-medium uppercase tracking-widest text-[9px] mt-1">Vehicle Inspection System</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-blue-400 animate-pulse' : isUrlValid ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    {isLoading ? 'Processing' : isUrlValid ? 'System Ready' : 'Connection Error'}
                </span>
            </div>
            <div className="hidden sm:block pt-4 border-t border-white/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">© 2026 Fleet Safety</span>
            </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative justify-center px-6">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {isRegistering ? 'Setup Admin' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isRegistering ? 'Create your master account.' : 'Sign in to your inspection portal.'}
            </p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-medium border animate-fadeIn
              ${error.includes("created") ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input type="text" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" />
                <input type="text" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none" value={position} onChange={e => setPosition(e.target.value)} placeholder="Job Title" />
              </div>
            )}

            <div className="space-y-4">
              <input type="email" required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-100 outline-none font-medium text-sm" value={username} onChange={e => setUsername(e.target.value)} placeholder="Email Address" />
              <input type="password" required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-100 outline-none font-medium text-sm" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            </div>

            <div className="flex items-center justify-between px-1 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-800" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <span className="text-xs text-slate-500 font-medium">Keep me signed in</span>
                </label>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isLoading || !isUrlValid} className="w-full py-4 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-all text-sm disabled:bg-slate-200 disabled:text-slate-400 shadow-md">
                {isLoading ? 'Processing...' : isRegistering ? 'Register Admin' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Setup Toggle */}
        <button onClick={() => setShowUrlSetup(!showUrlSetup)} className="absolute bottom-6 right-6 p-3 text-slate-300 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>

        {showUrlSetup && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 animate-fadeIn">
                <div className="w-full max-w-sm space-y-6">
                    <h3 className="text-xl font-semibold text-slate-800">Connection Endpoint</h3>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Script URL</label>
                        <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none" placeholder="https://script.google.com/..." value={tempUrl} onChange={e => setTempUrl(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setShowUrlSetup(false)} className="flex-1 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                        <button onClick={handleSaveUrl} className="flex-1 py-3 bg-slate-800 text-white font-semibold rounded-xl text-xs">Apply</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;