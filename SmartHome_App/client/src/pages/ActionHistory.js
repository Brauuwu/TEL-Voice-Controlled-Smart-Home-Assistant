import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import { ArrowLeft, History, Lightbulb, Wind, Maximize2, Cpu, Activity, User as UserIcon, Calendar, Clock } from 'lucide-react';

const ActionHistory = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        fetch(`${API_URL}/api/logs`)
            .then((res) => res.json())
            .then((data) => {
                setLogs(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Fetch history error:', err);
                setLoading(false);
            });
    }, []);

    const getDeviceIcon = (device) => {
        switch (device?.toLowerCase()) {
            case 'led': return <Lightbulb className="w-4 h-4" />;
            case 'fan': return <Wind className="w-4 h-4" />;
            case 'curtain': return <Maximize2 className="w-4 h-4" />;
            case 'gateway': return <Cpu className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const records = logs.slice(firstIndex, lastIndex);
    const npage = Math.ceil(logs.length / recordsPerPage);

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans pb-24 lg:pb-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-10">
                    <div className="flex items-center gap-4 lg:gap-6 animate-slide-up">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="hidden lg:block p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 flex items-center gap-3">
                                <History className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
                                Action History
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Activity Audit Trail</p>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm animate-slide-up">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged: </span>
                        <span className="text-base font-black text-indigo-600">{logs.length}</span>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden animate-slide-up">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[650px] lg:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Device</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performed By</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Syncing logs...</p>
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-slate-400 italic">No events recorded</td>
                                    </tr>
                                ) : (
                                    records.map((log, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${log.action === 'ON' || log.action === 'true' || log.action === 'ONLINE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {getDeviceIcon(log.device)}
                                                    </div>
                                                    <span className="font-black text-slate-800 uppercase text-[11px] tracking-tight">{log.device}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                                    log.action === 'ON' || log.action === 'true' || log.action === 'ONLINE'
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-rose-500 text-white'
                                                }`}>
                                                    {log.action === 'ON' || log.action === 'true' || log.action === 'ONLINE' ? 'Active' : 'Off'}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{log.username === 'auto' ? 'AI' : log.username}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${
                                                    log.event_type === 'manual' ? 'border-blue-200 text-blue-600 bg-blue-50' : 
                                                    log.event_type === 'voice' ? 'border-purple-200 text-purple-600 bg-purple-50' : 
                                                    'border-amber-200 text-amber-600 bg-amber-50'
                                                }`}>
                                                    {log.event_type}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {new Date(log.timestamp || log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {new Date(log.timestamp || log.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {npage > 1 && (
                        <div className="p-4 lg:p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center gap-2 overflow-x-auto">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                            >
                                Prev
                            </button>
                            <div className="flex gap-1">
                                {[...Array(npage)].map((_, i) => {
                                    const n = i + 1;
                                    if (n === 1 || n === npage || (n >= currentPage - 1 && n <= currentPage + 1)) {
                                        return (
                                            <button 
                                                key={n}
                                                onClick={() => setCurrentPage(n)}
                                                className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                                                    currentPage === n 
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        );
                                    }
                                    if (n === 2 || n === npage - 1) return <span key={n} className="px-1 self-center text-slate-400">...</span>;
                                    return null;
                                })}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(npage, prev + 1))}
                                disabled={currentPage === npage}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionHistory;
