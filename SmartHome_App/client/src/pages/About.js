import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, User, Mail, Phone, BookOpen, School, Cpu, CheckCircle } from 'lucide-react';
import avt from '../img/avt.jpg';

const About = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans pb-24 lg:pb-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 lg:gap-6 mb-8 lg:mb-12 animate-slide-up">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="hidden lg:block p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Info className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
                            System Info
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Smart Home Project Details</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {/* User Profile Card */}
                    <div className="md:col-span-1 animate-slide-up">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100">
                                    <img src={avt} alt="User Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{user?.username || 'Current User'}</h2>
                            <p className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg uppercase tracking-widest mt-2">{user?.role || 'User'}</p>
                            
                            <div className="w-full mt-8 space-y-4 text-left border-t border-slate-50 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                        <span className="text-[11px] font-bold text-slate-700">hieuhoang9713@gmail.com</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                                        <span className="text-[11px] font-bold text-slate-700">1900 1296</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Information */}
                    <div className="md:col-span-2 space-y-6 lg:space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 lg:p-8">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                Overview
                            </h3>
                            <div className="bg-slate-50 rounded-2xl p-5 lg:p-6 border border-slate-100">
                                <p className="text-slate-700 font-bold leading-relaxed text-sm lg:text-base">
                                    Đề tài: <span className="text-indigo-600">“Hệ thống IoT SmartHome điều khiển và giám sát bằng giọng nói”</span>
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <User className="w-3.5 h-3.5" />
                                        Team Members
                                    </h4>
                                    <div className="space-y-3">
                                        <p className="text-[11px] font-black text-slate-700 flex justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span>Vi Minh Hiếu</span>
                                            <span className="text-indigo-400 uppercase">B22DCVT197</span>
                                        </p>
                                        <p className="text-[11px] font-black text-slate-700 flex justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <span>Nguyễn Văn Hoàng</span>
                                            <span className="text-indigo-400 uppercase">B22DCVT213</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                        <School className="w-3.5 h-3.5" />
                                        Supervision
                                    </h4>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <p className="text-[11px] font-black text-slate-700">PGS.TS Nguyễn Chiến Trinh</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">PTIT Academy</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Specs */}
                        <div className="premium-gradient rounded-[2.5rem] p-6 lg:p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                    <Cpu className="w-5 h-5" />
                                    Architecture
                                </h3>
                                <div className="grid grid-cols-3 gap-3 lg:gap-4">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 lg:p-4 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Version</p>
                                        <p className="text-sm lg:text-xl font-black mt-1">v2.4</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 lg:p-4 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Protocol</p>
                                        <p className="text-sm lg:text-xl font-black mt-1">MQTT</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 lg:p-4 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Hardware</p>
                                        <p className="text-sm lg:text-xl font-black mt-1">ESP32</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
