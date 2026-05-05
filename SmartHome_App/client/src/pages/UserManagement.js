import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { ArrowLeft, Users, UserPlus, Trash2, Shield, User as UserIcon, Key } from 'lucide-react';

const UserManagement = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = () => {
        fetch(`${API_URL}/api/users`)
            .then(res => res.json())
            .then(data => setUsers(data));
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        }).then(() => {
            setNewUser({ username: '', password: '', role: 'user' });
            fetchUsers();
        });
    };

    const handleDeleteUser = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' })
                .then(() => fetchUsers());
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans pb-24 lg:pb-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12">
                    <div className="flex items-center gap-4 lg:gap-6 animate-slide-up">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="hidden lg:block p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 flex items-center gap-3">
                                <Users className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
                                User Accounts
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Access Control Center</p>
                        </div>
                    </div>
                    <div className="hidden md:block bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm animate-slide-up">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database: </span>
                        <span className="text-base font-black text-indigo-600">{users.length} Slots</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Add User Form */}
                    <div className="lg:col-span-1 order-2 lg:order-1 animate-slide-up">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 lg:sticky lg:top-8">
                            <h2 className="text-lg lg:text-xl font-black mb-6 lg:mb-8 text-slate-800 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-indigo-600" />
                                New User
                            </h2>
                            <form onSubmit={handleCreateUser} className="space-y-5 lg:space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest px-2">Identification</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all"
                                            value={newUser.username}
                                            onChange={e => setNewUser({...newUser, username: e.target.value})}
                                            required
                                            placeholder="Username"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest px-2">Access Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input 
                                            type="password" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all"
                                            value={newUser.password}
                                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest px-2">Authority Level</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 cursor-pointer appearance-none"
                                        value={newUser.role}
                                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                                    >
                                        <option value="user">Standard Member</option>
                                        <option value="admin">Root Administrator</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-4 premium-gradient text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-widest text-[11px] mt-4">
                                    Register User
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* User List */}
                    <div className="lg:col-span-2 order-1 lg:order-2 animate-slide-up">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-lg lg:text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                    Active Members
                                </h2>
                                <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest">{users.length} Total</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {users.map(u => (
                                    <div key={u.id} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-[1.5rem] group hover:border-indigo-200 hover:shadow-md transition-all ring-1 ring-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600 shadow-lg shadow-indigo-50' : 'bg-slate-100 text-slate-400'}`}>
                                                {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 text-sm tracking-tight">{u.username}</div>
                                                <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${u.role === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}>{u.role}</div>
                                            </div>
                                        </div>
                                        {u.username !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
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

export default UserManagement;
