import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8688/api/auth/login', { username, password });
            if (response.data.success) {
                onLogin(response.data.user);
            }
        } catch (err) {
            setError('Invalid credentials. Try admin/admin');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 blur-[80px]"></div>
                
                <div className="relative z-10">
                    <h2 className="text-4xl font-black text-slate-800 mb-2 text-center tracking-tight">Smart Home</h2>
                    <p className="text-slate-400 text-center mb-10 font-medium">Secure Access Portal</p>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-500 p-4 rounded-2xl text-sm mb-8 text-center font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Username</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Password</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-sm mt-4"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Admin Access Only</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
