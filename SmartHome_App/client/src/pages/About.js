import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, User, Mail, Phone, BookOpen, School, Cpu, CheckCircle } from 'lucide-react';
import avt from '../img/avt.jpg';

const About = ({ user }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-6 mb-12">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                            <Info className="w-8 h-8 text-blue-600" />
                            About System
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Information about the Smart Home project</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* User Profile Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-100">
                                    <img src={avt} alt="User Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{user?.username || 'Current User'}</h2>
                            <p className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest mt-2">{user?.role || 'User'}</p>
                            
                            <div className="w-full mt-8 space-y-4 text-left border-t border-slate-50 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                                        <span className="text-xs font-bold text-slate-700">viethieu2611@gmail.com</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</span>
                                        <span className="text-xs font-bold text-slate-700">0936 702 996</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Information */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                Project Overview
                            </h3>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <p className="text-slate-700 font-bold leading-relaxed">
                                    Đề tài: <span className="text-indigo-600">“Hệ thống IoT SmartHome điều khiển và giám sát bằng giọng nói”</span>
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3.5 h-3.5" />
                                        Developed By
                                    </h4>
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-slate-700 flex justify-between">
                                            <span>Vi Minh Hiếu</span>
                                            <span className="text-slate-400">B22DCVT197</span>
                                        </p>
                                        <p className="text-sm font-bold text-slate-700 flex justify-between">
                                            <span>Nguyễn Văn Hoàng</span>
                                            <span className="text-slate-400">B22DCVT213</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <School className="w-3.5 h-3.5" />
                                        Supervised By
                                    </h4>
                                    <p className="text-sm font-bold text-slate-700">PGS.TS Nguyễn Chiến Trinh</p>
                                    <p className="text-[10px] font-medium text-slate-400">Học viện Công nghệ Bưu chính Viễn thông</p>
                                </div>
                            </div>
                        </div>

                        {/* System Specs */}
                        <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                    <Cpu className="w-5 h-5" />
                                    System Specification
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Version</p>
                                        <p className="text-xl font-black mt-1">v2.4.0</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Architecture</p>
                                        <p className="text-xl font-black mt-1">MQTT</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Gateway</p>
                                        <p className="text-xl font-black mt-1">ESP32</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
