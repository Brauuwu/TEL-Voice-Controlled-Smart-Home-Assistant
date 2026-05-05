import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            if (response.data.success) {
                onLogin(response.data.user);
            }
        } catch (err) {
            setError('Invalid credentials. Try admin/admin');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-6 overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-indigo-100/50 relative animate-slide-up">
                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 premium-gradient rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-black text-slate-800 mb-2 text-center tracking-tight">Smart Home</h2>
                    <p className="text-slate-400 text-center mb-10 font-bold uppercase tracking-widest text-[10px]">Secure Access Portal</p>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-500 p-4 rounded-2xl text-xs mb-8 text-center font-black uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">Username</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-bold text-sm lg:text-base"
                                placeholder="Admin ID"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-2">Password</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-bold text-sm lg:text-base"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full premium-gradient text-white font-black py-4 lg:py-5 px-6 rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-xs lg:text-sm mt-4"
                        >
                            Authorize System
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Connection</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Login;
