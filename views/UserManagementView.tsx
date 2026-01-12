
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
            <div className="flex flex-col items-center justify-center py-20 text-center font-sans">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-medium text-slate-800 tracking-tight">Access Restricted</h3>
                <p className="text-slate-500 max-w-xs mt-2 text-sm font-normal">You do not have the required permissions to access Staff Management.</p>
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
                // Modified: Now we show all users including SuperAdmins, but masking happens in the UI
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
                showToast("User removed successfully", 'success');
                fetchUsers();
            } else { showToast(result.message || "Delete failed", 'error'); }
        } catch (e) { showToast("Connection failed", 'error'); } finally { setIsLoading(false); }
    };

    const handleToggleStatus = async (user: User) => {
        // Prevent disabling yourself or superadmins
        if (user.username === currentUser.username) {
            showToast("You cannot restrict your own access.", "warning");
            return;
        }
        if (user.role === 'SuperAdmin') {
            showToast("SuperAdmin access cannot be restricted.", "error");
            return;
        }

        const nextStatus = !user.isActive;
        
        // Optimistic Update
        setUsers(prev => prev.map(u => u.username === user.username ? { ...u, isActive: nextStatus } : u));

        try {
            const response = await fetch(appScriptUrl, { 
                method: 'POST', 
                body: JSON.stringify({ 
                    action: 'update_user', 
                    username: user.username,
                    isActive: nextStatus
                }) 
            });
            const result = await response.json();
            if (result.status !== 'success') {
                // Rollback on failure
                setUsers(prev => prev.map(u => u.username === user.username ? { ...u, isActive: !nextStatus } : u));
                showToast("Failed to sync access state.", "error");
            } else {
                showToast(`Access ${nextStatus ? 'restored' : 'restricted'} for ${user.name || user.username}`, "info");
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
        const orgName = settings?.companyName || 'Fleet Operations';
        const msg = `*${orgName.toUpperCase()} - STAFF IDENTITY*\n\n*Name:* ${u.name || 'Setup Pending'}\n*Role:* ${u.role}\n*Job Title:* ${u.position || 'N/A'}\n*Login Email:* ${u.username}\n\n_Security Notice: This confirms identity mapping in the Fleet Portal._`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Staff Identity Detail',
                    text: msg
                });
            } catch (e) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    fallbackCopy(msg);
                }
            }
        } else {
            fallbackCopy(msg);
        }
    };

    const fallbackCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Professional details copied to clipboard", "success");
        }).catch(() => {
            showToast("Failed to share details", "error");
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username) { showToast("Login Email is required.", 'error'); return; }

        setIsSubmitting(true);
        try {
            const payload: any = { 
                action: isEditing ? 'update_user' : 'register_user', 
                ...formData,
                preferences: {
                    ... (isEditing ? {} : { mustChangePassword: true })
                }
            };
            
            if (isEditing) payload.originalUsername = originalUsername;
            
            const response = await fetch(appScriptUrl, { method: 'POST', body: JSON.stringify(payload) });
            const result = await response.json();
            
            if (result.status === 'success') {
                showToast(isEditing ? "Staff details updated" : "Invite sent to new staff member", 'success');
                setViewMode('list');
                fetchUsers();
            } else { 
                showToast(result.message || "Operation failed", 'error'); 
            }
        } catch (e) { 
            showToast("Connection failed", 'error'); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    if (viewMode === 'form') {
        return (
            <div className="max-w-lg mx-auto animate-fadeIn py-4 px-4 font-sans">
                <button onClick={() => setViewMode('list')} className="mb-6 text-[10px] font-medium text-slate-400 hover:text-slate-800 flex items-center gap-2 transition-colors group uppercase tracking-widest">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                    Back to Directory
                </button>
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-6 sm:p-10">
                    <h2 className="text-2xl font-normal text-slate-800 mb-2 uppercase tracking-tight leading-none">{isEditing ? 'Edit Profile' : 'Invite Staff'}</h2>
                    <p className="text-slate-400 text-[10px] font-normal mb-10 uppercase tracking-[0.2em]">Configure workspace permissions</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-normal uppercase text-slate-400 mb-2 tracking-[0.15em]">Login Identity (Email) *</label>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition font-normal text-slate-700" 
                                    value={formData.username} 
                                    onChange={e => setFormData({...formData, username: e.target.value})} 
                                    placeholder="e.g. staff@company.com" 
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-normal uppercase text-slate-400 mb-2 tracking-[0.15em]">System Role</label>
                                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-normal text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none h-[58px] appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                                        <option value="Inspector">Inspector</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Admin">Admin</option>
                                        {isSuperAdmin && <option value="SuperAdmin">SuperAdmin</option>}
                                    </select>
                                </div>
                                <AutocompleteInput 
                                    label="Job Title" 
                                    value={formData.position} 
                                    onChange={v => setFormData({...formData, position: v})} 
                                    options={validationLists.positions} 
                                    isTitleCase={true} 
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        {!isEditing && (
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                                <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <p className="text-[10px] text-indigo-800 font-normal leading-relaxed uppercase tracking-wider">
                                    <strong>Security Notice:</strong> New users will be prompted to establish their credentials upon first access via the invite email.
                                </p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="pt-4 border-t border-slate-100">
                                <AutocompleteInput label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} options={validationLists.inspectors} isTitleCase={true} />
                            </div>
                        )}

                        <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-slate-900 hover:bg-black text-white font-normal rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-4 uppercase tracking-[0.2em] text-xs">
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : null}
                            {isSubmitting ? 'Processing' : isEditing ? 'Update Profile' : 'Dispatch Invite'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn px-4 md:px-0 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-normal text-slate-800 uppercase tracking-tight leading-none flex items-center gap-3">
                        Staff Directory
                    </h2>
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-[0.25em] mt-2">Access Control & Identity Center</p>
                </div>
                <button onClick={() => { setFormData({ name: '', username: '', password: '', role: 'Inspector', position: '' }); setIsEditing(false); setViewMode('form'); }} className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-black text-white font-normal rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group text-xs uppercase tracking-[0.2em]">
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                    New Member
                </button>
            </div>
            
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm border-collapse block md:table">
                    <thead className="bg-slate-50 text-[10px] font-normal text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100 hidden md:table-header-group">
                        <tr className="md:table-row">
                            <th className="px-10 py-6 md:table-cell">Identity</th>
                            <th className="px-10 py-6 md:table-cell">Role</th>
                            <th className="px-10 py-6 md:table-cell">Access Control</th>
                            <th className="px-10 py-6 text-right md:table-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 block md:table-row-group">
                        {users.map((u, i) => {
                            const isUserSuperAdmin = u.role === 'SuperAdmin';
                            const hideDetails = isUserSuperAdmin && !isSuperAdmin;
                            
                            return (
                                <tr key={i} className={`hover:bg-slate-50/50 transition-colors group block md:table-row relative p-8 md:p-0 ${!u.isActive && 'opacity-60'}`}>
                                    <td className="md:px-10 md:py-6 block md:table-cell mb-6 md:mb-0">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center font-normal text-slate-300 text-sm tracking-tighter">
                                                {u.name ? u.name.substring(0, 2).toUpperCase() : '??'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-normal text-slate-800 text-base leading-tight truncate flex items-center gap-2">
                                                    {u.name || 'Setup Pending'}
                                                    {!u.isActive && <span className="text-[7px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-black">Restricted</span>}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-normal tracking-tight truncate">
                                                    {hideDetails ? '•••••••• (Protected Identity)' : u.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="md:px-10 md:py-6 block md:table-cell mb-6 md:mb-0">
                                        <div className="md:hidden text-[9px] font-normal text-slate-300 uppercase tracking-widest mb-2">Access Role</div>
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-normal uppercase tracking-widest
                                            ${u.role === 'Admin' || isUserSuperAdmin ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'bg-slate-50 text-slate-500 border border-slate-100'}
                                        `}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="md:px-10 md:py-6 block md:table-cell mb-6 md:mb-0">
                                        <div className="md:hidden text-[9px] font-normal text-slate-300 uppercase tracking-widest mb-2">Login Access</div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => !hideDetails && handleToggleStatus(u)}
                                                disabled={hideDetails}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${hideDetails ? 'opacity-20 cursor-not-allowed' : ''} ${u.isActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}
                                                title={hideDetails ? "Restricted" : (u.isActive ? "Disable Access" : "Enable Access")}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${u.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <span className={`text-[10px] font-normal uppercase tracking-widest ${u.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {u.isActive ? 'Active' : 'Locked'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="md:px-10 md:py-6 md:text-right block md:table-cell">
                                        <div className="flex justify-start md:justify-end gap-3 md:opacity-0 group-hover:opacity-100 transition-all border-t md:border-0 pt-6 md:pt-0 mt-6 md:mt-0">
                                            {hideDetails ? (
                                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest p-3">Immutable</span>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleShare(u)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border md:border-0 bg-white md:bg-transparent shadow-sm md:shadow-none" title="Share Identity">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleEdit(u)} className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all border md:border-0 bg-white md:bg-transparent shadow-sm md:shadow-none" title="Edit Profile">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(u.username)} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all border md:border-0 bg-white md:bg-transparent shadow-sm md:shadow-none" title="Remove User">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementView;
