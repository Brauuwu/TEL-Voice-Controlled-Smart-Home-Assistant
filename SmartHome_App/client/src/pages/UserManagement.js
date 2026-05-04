import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        fetch('http://localhost:8688/api/users')
            .then(res => res.json())
            .then(data => setUsers(data));
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        fetch('http://localhost:8688/api/users', {
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
            fetch(`http://localhost:8688/api/users/${id}`, { method: 'DELETE' })
                .then(() => fetchUsers());
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                                <Users className="w-8 h-8 text-purple-600" />
                                User Management
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">Control access and user accounts</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add User Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 sticky top-8">
                            <h2 className="text-xl font-black mb-8 text-slate-800 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-purple-600" />
                                New Account
                            </h2>
                            <form onSubmit={handleCreateUser} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Username</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                            value={newUser.username}
                                            onChange={e => setNewUser({...newUser, username: e.target.value})}
                                            required
                                            placeholder="JohnDoe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input 
                                            type="password" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                            value={newUser.password}
                                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Role Authority</label>
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                        value={newUser.role}
                                        onChange={e => setNewUser({...newUser, role: e.target.value})}
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="admin">System Administrator</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all uppercase tracking-widest text-xs mt-4">
                                    Create Account
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* User List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-xl shadow-slate-200/50">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                    Active Members
                                </h2>
                                <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-3 py-1 rounded-lg uppercase tracking-widest">{users.length} Users</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {users.map(u => (
                                    <div key={u.id} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-[24px] group hover:border-purple-200 hover:shadow-md transition-all ring-1 ring-slate-50">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                                {u.role === 'admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-700 text-sm">{u.username}</div>
                                                <div className={`text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 ${u.role === 'admin' ? 'text-indigo-500' : 'text-slate-300'}`}>{u.role}</div>
                                            </div>
                                        </div>
                                        {u.username !== 'admin' && (
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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
