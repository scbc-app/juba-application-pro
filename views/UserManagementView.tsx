import React, { useState, useEffect } from 'react';
import { User, ValidationLists, SystemSettings } from '../types';
import AutocompleteInput from '../components/ui/AutocompleteInput';

interface UserManagementViewProps {
    currentUser: User;
    appScriptUrl: string;
    showToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    validationLists: ValidationLists;
    settings?: SystemSettings;
}

const SectionHeader = ({ label }: { label: string }) => (
    <div className="w-full flex items-center gap-4 mb-4 sm:mb-6 opacity-70 shrink-0">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">{label}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
    </div>
);

const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser, appScriptUrl, showToast, validationLists, settings }) => {
    const [users, setUsers] = useState<(User & {password?: string})[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [isEditing, setIsEditing] = useState(false);
    const [originalUsername, setOriginalUsername] = useState('');
    
    const [formData, setFormData] = useState({
        name: '', username: '', password: '', role: 'Inspector' as any, position: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isSuperAdmin = currentUser.role === 'SuperAdmin';
    const isAdmin = currentUser.role === 'Admin' || isSuperAdmin;

    useEffect(() => { 
        if (isAdmin) fetchUsers(); 
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center font-sans min-h-[50vh]">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-lg font-medium text-slate-800 tracking-tight uppercase">Access Restricted</h3>
                <p className="text-slate-400 max-w-xs mt-1 text-[9px] font-medium uppercase tracking-widest leading-relaxed">Admin clearance required.</p>
            </div>
        );
    }

    const fetchUsers = async (force: boolean = false) => {
        if (!appScriptUrl) return;
        setIsLoading(true);
        try {
            const response = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'get_users' }) });
            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.users)) {
                setUsers(result.users);
            }
        } catch (e) { showToast("Failed to load users", 'error'); } finally { setIsLoading(false); }
    };

    const handleDelete = async (username: string) => {
        if (!window.confirm(`Remove user "${username}"?`)) return;
        setIsLoading(true);
        try {
            const response = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify({ action: 'delete_user', username }) });
            const result = await response.json();
            if (result.status === 'success') {
                showToast("User removed", 'success');
                fetchUsers();
            } else { showToast(result.message || "Delete failed", 'error'); }
        } catch (e) { showToast("Connection error", 'error'); } finally { setIsLoading(false); }
    };

    const handleToggleStatus = async (user: User) => {
        if (user.username === currentUser.username) {
            showToast("Cannot restrict own access.", "warning");
            return;
        }
        const nextStatus = !user.isActive;
        setUsers(prev => prev.map(u => u.username === user.username ? { ...u, isActive: nextStatus } : u));
        try {
            const response = await fetch(appScriptUrl, { 
                method: 'POST', 
                body: JSON.stringify({ action: 'update_user', username: user.username, isActive: nextStatus }) 
            });
            const result = await response.json();
            if (result.status !== 'success') {
                setUsers(prev => prev.map(u => u.username === user.username ? { ...u, isActive: !nextStatus } : u));
                showToast("Sync failed.", "error");
            }
        } catch (e) {
            setUsers(prev => prev.map(u => u.username === user.username ? { ...u, isActive: !nextStatus } : u));
            showToast("Connection failed.", "error");
        }
    };

    const handleEdit = (user: User) => {
        setFormData({ name: user.name || '', username: user.username, role: user.role as any, position: user.position || '', password: '' });
        setOriginalUsername(user.username);
        setIsEditing(true);
        setViewMode('form');
    };

    const handleShare = async (u: User) => {
        const orgName = settings?.companyName || 'Fleet Portal';
        const msg = `*${orgName.toUpperCase()} STAFF*\n\n*Name:* ${u.name || 'N/A'}\n*ID:* ${u.username}\n*Role:* ${u.role}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Staff Identity', text: msg }); } catch (e) { if (e instanceof Error && e.name !== 'AbortError') fallbackCopy(msg); }
        } else { fallbackCopy(msg); }
    };

    const fallbackCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => showToast("Copied", "success")).catch(() => showToast("Failed", "error"));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username) return;
        setIsSubmitting(true);
        try {
            const payload: any = { action: isEditing ? 'update_user' : 'register_user', ...formData, preferences: { ... (isEditing ? {} : { mustChangePassword: true }) } };
            if (isEditing) payload.originalUsername = originalUsername;
            const response = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify(payload) });
            const result = await response.json();
            if (result.status === 'success') {
                showToast(isEditing ? "Updated" : "Enrolled", 'success');
                setViewMode('list');
                fetchUsers();
            } else { showToast(result.message || "Failed", 'error'); }
        } catch (e) { showToast("Error", 'error'); } finally { setIsSubmitting(false); }
    };

    if (viewMode === 'form') {
        return (
            <div className="max-w-2xl mx-auto py-4 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-4 animate-fadeIn font-sans overflow-hidden">
                <div className="w-full space-y-4">
                    <button onClick={() => setViewMode('list')} className="text-[10px] font-medium text-slate-400 hover:text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                        Back
                    </button>
                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 p-6 md:p-10">
                        <SectionHeader label={isEditing ? "Modify Profile" : "Staff Enrollment"} />
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-semibold uppercase text-slate-400 mb-1.5 tracking-widest">Email Address</label>
                                        <input type="email" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 text-sm" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="staff@domain.com" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-semibold uppercase text-slate-400 mb-1.5 tracking-widest">Role</label>
                                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none h-[46px] appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                            <option value="Inspector">Inspector</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Admin">Admin</option>
                                            {isSuperAdmin && <option value="SuperAdmin">SuperAdmin</option>}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <AutocompleteInput label="Designation" value={formData.position} onChange={v => setFormData({...formData, position: v})} options={validationLists.positions} isTitleCase={true} />
                                    {isEditing && (
                                        <AutocompleteInput label="Display Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} options={validationLists.inspectors} isTitleCase={true} />
                                    )}
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10 py-3 bg-slate-900 hover:bg-black text-white font-medium rounded-xl transition-all text-[10px] uppercase tracking-widest active:scale-95">
                                    {isSubmitting ? 'Wait...' : isEditing ? 'Sync' : 'Enroll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-2 flex flex-col min-h-[calc(100vh-140px)] px-2 sm:px-4 animate-fadeIn font-sans overflow-hidden">
            <div className="w-full flex-1 flex flex-col min-h-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 mb-6 shrink-0">
                    <div>
                        <h2 className="text-3xl font-normal text-slate-800 uppercase tracking-tight leading-none">Staff Directory</h2>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-[0.3em] mt-2">Access Control</p>
                    </div>
                    <button onClick={() => { setFormData({ name: '', username: '', password: '', role: 'Inspector', position: '' }); setIsEditing(false); setViewMode('form'); }} className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-black text-white font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest active:scale-95">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M12 4v16m8-8H4"></path></svg>
                        Add Personnel
                    </button>
                </div>

                <div className="flex flex-col flex-1 min-h-0">
                    <SectionHeader label="Fleet Personnel" />
                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden flex-1 flex flex-col min-h-0">
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <table className="w-full text-left text-sm border-collapse hidden md:table">
                                <thead className="bg-slate-50/50 text-[9px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-50 sticky top-0 z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="px-8 py-4">Identity</th>
                                        <th className="px-8 py-4">Privileges</th>
                                        <th className="px-8 py-4">State</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr><td colSpan={4} className="py-24 text-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div></td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan={4} className="py-24 text-center text-[10px] font-medium text-slate-300 uppercase tracking-widest">No personnel logged</td></tr>
                                    ) : users.map((u, i) => (
                                        <tr key={i} className={`hover:bg-slate-50/30 transition-colors group ${!u.isActive && 'opacity-60'}`}>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-semibold text-slate-300 text-[10px] shrink-0">{u.name ? u.name.substring(0, 2).toUpperCase() : '??'}</div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-slate-800 text-xs tracking-tight truncate uppercase">{u.name || 'Setup Pending'}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal truncate">{u.role === 'SuperAdmin' && !isSuperAdmin ? '••••••' : u.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-widest border ${u.role === 'Admin' || u.role === 'SuperAdmin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <button onClick={() => handleToggleStatus(u)} disabled={u.role === 'SuperAdmin' && !isSuperAdmin} className={`relative inline-flex h-3.5 w-8 items-center rounded-full transition-all ${u.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${u.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </button>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-400 hover:text-blue-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2.5"/></svg></button>
                                                    <button onClick={() => handleDelete(u.username)} className="p-1.5 text-rose-400 hover:text-rose-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2.5"/></svg></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* MOBILE TIGHT VIEW */}
                            <div className="md:hidden divide-y divide-slate-50">
                                {isLoading ? (
                                    <div className="py-24 text-center"><div className="w-6 h-6 border-2 border-slate-100 border-t-indigo-500 rounded-full animate-spin mx-auto"></div></div>
                                ) : users.length === 0 ? (
                                    <div className="py-24 text-center text-[10px] font-medium text-slate-300 uppercase tracking-widest">No Personnel</div>
                                ) : users.map((u, i) => (
                                    <div key={i} className={`p-3.5 flex flex-col gap-2.5 transition-all ${!u.isActive && 'opacity-60'}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-semibold text-slate-300 text-[10px] shrink-0">{u.name ? u.name.substring(0, 2).toUpperCase() : '??'}</div>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-slate-800 text-xs tracking-tight truncate uppercase leading-none">{u.name || 'Setup Pending'}</div>
                                                    <div className="text-[9px] text-slate-400 font-normal truncate mt-1">{u.role === 'SuperAdmin' && !isSuperAdmin ? '••••••' : u.username}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <button onClick={() => handleEdit(u)} className="p-1.5 text-blue-500 bg-blue-50 rounded-lg"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                                <button onClick={() => handleDelete(u.username)} className="p-1.5 text-rose-500 bg-rose-50 rounded-lg"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex gap-2">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-semibold uppercase tracking-widest border ${u.role === 'Admin' || u.role === 'SuperAdmin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{u.role}</span>
                                                {u.position && <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tight self-center truncate max-w-[100px]">{u.position}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-semibold uppercase tracking-widest ${u.isActive ? 'text-emerald-500' : 'text-slate-300'}`}>{u.isActive ? 'Live' : 'Off'}</span>
                                                <button onClick={() => handleToggleStatus(u)} disabled={u.role === 'SuperAdmin' && !isSuperAdmin} className={`relative inline-flex h-3.5 w-8 items-center rounded-full transition-all ${u.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                                    <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${u.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagementView;