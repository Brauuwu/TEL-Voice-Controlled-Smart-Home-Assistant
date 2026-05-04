import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import io from 'socket.io-client';
import { Thermometer, Droplets, Sun, Lightbulb, Wind, Maximize2, Bell, Inbox, X, Activity, Cpu, History, Database, User, Volume2, Tv, AirVent } from 'lucide-react';
import VoiceAssistant from '../components/VoiceAssistant';

const socket = io('http://localhost:8688');

const Dashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [sensors, setSensors] = useState({ temperature: 0, humidity: 0, motion: false, ldr: 0 });
    const [history, setHistory] = useState([]);
    const [devices, setDevices] = useState({ led: false, fan: false, buzzer: false, curtain: 0, ac: 0, tv: false });
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('offline');
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [latestActivity, setLatestActivity] = useState(null);
    const [mode, setMode] = useState('manual');

    useEffect(() => {
        // Initial fetches
        fetch('http://localhost:8688/api/logs')
            .then(res => res.json())
            .then(data => setLogs(data));

        fetch('http://localhost:8688/api/sensors/history')
            .then(res => res.json())
            .then(data => {
                const formattedHistory = data.map(item => ({
                    temperature: item.temp,
                    humidity: item.humi,
                    ldr: item.light,
                    time: new Date(item.timestamp || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })).reverse();
                setHistory(formattedHistory);
            })
            .catch(err => console.error('Fetch history error:', err));

        fetch('http://localhost:8688/api/status/gateway')
            .then(res => res.json())
            .then(data => {
                console.log('📡 Initial Gateway Status:', data.status);
                setStatus(data.status);
            })
            .catch(err => console.error('❌ Failed to fetch gateway status:', err));

        // Socket listeners
        socket.on('sensor_update', (data) => {
            setSensors(data);
            if (data.mode) setMode(data.mode);
            setHistory(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), ...data }]);
        });

        socket.on('status_update', (data) => {
            if (data.device === 'gateway') {
                setStatus(data.status);
            } else if (data.device === 'mode') {
                setMode(data.status);
            } else if (devices.hasOwnProperty(data.device)) {
                setDevices(prev => ({ ...prev, [data.device]: data.status === 'ON' || data.status === true || data.status === 1 }));
            }
        });

        socket.on('new_activity', (data) => {
            setLogs(prev => [data, ...prev].slice(0, 50));
            setLatestActivity(data);
            // Auto-hide toast after 4 seconds
            setTimeout(() => setLatestActivity(null), 4000);
        });

        return () => {
            socket.off('sensor_update');
            socket.off('status_update');
            socket.off('new_activity');
        };
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

    const controlDevice = (device, action, type = 'manual') => {
        // Auto-switch to manual mode if user interacts with a device
        if (mode === 'auto' && device !== 'mode') {
            console.log('🔄 Auto-switching to MANUAL mode due to user interaction');
            setMode('manual');
            const modePayload = {
                device: 'mode',
                action: 'manual',
                username: user.username,
                type: 'system'
            };
            socket.emit('control_device', modePayload);
        }

        const nextAction = action === 'TOGGLE' ? !devices[device] : action;
        const payload = {
            device,
            action: typeof nextAction === 'boolean' ? (nextAction ? 'ON' : 'OFF') : nextAction,
            username: user.username, 
            type: type
        };
        
        console.log('📤 Sending Control:', payload);
        socket.emit('control_device', payload);
        
        // Optimistic update for both boolean and numeric values
        // Convert 'ON'/'OFF' strings to boolean for visual switch state
        const visualState = (nextAction === 'ON') ? true : (nextAction === 'OFF' ? false : nextAction);
        setDevices(prev => ({ ...prev, [device]: visualState }));
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
            {/* Header */}
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Smart Home System
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Welcome back, <span className="text-blue-600 font-bold">{user.username}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    {user.role === 'admin' && (
                        <>
                            <button 
                                onClick={() => navigate('/history')}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                                <History className="w-4 h-4" />
                                History
                            </button>
                            <button 
                                onClick={() => navigate('/datasensor')}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                                <Database className="w-4 h-4" />
                                Sensors
                            </button>
                            <button 
                                onClick={() => navigate('/users')}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            >
                                <Cpu className="w-4 h-4" />
                                Users
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => navigate('/about')}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                        <User className="w-4 h-4" />
                        About
                    </button>
                    <button 
                        onClick={onLogout}
                        className="ml-4 px-6 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-600 hover:text-white transition-all font-bold shadow-sm"
                    >
                        Logout
                    </button>
                    <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-full border border-slate-200 shadow-sm">
                        <span className={`w-3 h-3 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        <span className="text-sm font-bold text-slate-700">{status === 'online' ? 'Gateway Online' : 'Gateway Offline'}</span>
                    </div>
                    
                    {/* Inbox/Activity Dropdown Container */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsLogOpen(!isLogOpen)}
                            className="relative p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group z-10"
                        >
                            <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            {logs.length > 0 && (
                                <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>

                        {isLogOpen && (
                            <div className="absolute top-16 right-0 w-[380px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Inbox className="w-5 h-5 text-indigo-600" />
                                        Activity Log
                                    </h2>
                                    <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg uppercase tracking-widest">{logs.length} New</span>
                                </div>
                                
                                <div className="max-h-[450px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {logs.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400 italic text-sm">No recent activity</div>
                                    ) : (
                                        logs.map((log, i) => (
                                            <div key={i} className="group p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent bg-white shadow-sm ring-1 ring-slate-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-xs font-black text-slate-800 flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg ${log.action === 'ON' || log.action === 'true' || log.action === 'ONLINE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                            {getDeviceIcon(log.device)}
                                                        </div>
                                                        {log.device.toUpperCase()}
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 font-bold">
                                                        {new Date(log.timestamp || log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-[10px] text-slate-500 font-medium">
                                                        {typeof log.action === 'number' || (!isNaN(log.action) && log.action !== 'ON' && log.action !== 'OFF')
                                                            ? `Set to ${log.action}%`
                                                            : (log.action === 'ON' || log.action === 'true' || log.action === 'ONLINE' ? 'Switched ON' : 'Switched OFF')} by <span className="text-slate-800 font-bold">{log.username === 'auto' ? 'AI' : log.username}</span>
                                                    </p>
                                                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${log.event_type === 'manual' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {log.event_type}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <button 
                                    onClick={() => setIsLogOpen(false)}
                                    className="p-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-50 w-full text-center"
                                >
                                    Dismiss All
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* LEFT SECTION (Gauges & Trends) */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Gauges */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <GaugeCard icon={<Thermometer className="w-6 h-6" />} label="Temperature" value={status === 'online' ? sensors.temperature : '--'} unit="°C" color="from-orange-400 to-red-500" progress={sensors.temperature * 2} />
                        <GaugeCard icon={<Droplets className="w-6 h-6" />} label="Humidity" value={status === 'online' ? sensors.humidity : '--'} unit="%" color="from-blue-400 to-indigo-500" progress={sensors.humidity} />
                        <GaugeCard icon={<Sun className="w-6 h-6" />} label="Light" value={status === 'online' ? sensors.ldr : '--'} unit="Lux" color="from-yellow-400 to-orange-500" progress={sensors.ldr / 10} />
                        <GaugeCard 
                            icon={<Activity className="w-6 h-6" />} 
                            label="Motion" 
                            value={status === 'online' ? (sensors.motion ? 'DETECTED' : 'CLEAR') : '--'} 
                            unit="" 
                            color={sensors.motion ? "from-rose-400 to-rose-600" : "from-emerald-400 to-emerald-600"} 
                            progress={sensors.motion ? 100 : 0} 
                        />
                    </div>

                    {/* Expanded Trends */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/40">
                        <h2 className="text-xl font-bold mb-8 text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                            Environmental Analytics
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="h-48">
                                <h3 className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase">Temperature (°C)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history}>
                                        <defs><linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="time" hide /><YAxis stroke="#cbd5e1" fontSize={10} domain={['auto', 'auto']} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} /><Area type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="h-48">
                                <h3 className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase text-indigo-500">Humidity (%)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history}>
                                        <defs><linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="time" hide /><YAxis stroke="#cbd5e1" fontSize={10} domain={['auto', 'auto']} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} /><Area type="monotone" dataKey="humidity" stroke="#6366f1" strokeWidth={3} fill="url(#colorHum)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="h-48">
                                <h3 className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase text-yellow-500">Light (Lux)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history}>
                                        <defs><linearGradient id="colorLight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#eab308" stopOpacity={0.2}/><stop offset="95%" stopColor="#eab308" stopOpacity={0}/></linearGradient></defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="time" hide /><YAxis stroke="#cbd5e1" fontSize={10} domain={['auto', 'auto']} /><Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} /><Area type="monotone" dataKey="ldr" stroke="#eab308" strokeWidth={3} fill="url(#colorLight)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (Control Panels) */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Lightbulb className="w-6 h-6 text-yellow-500" />
                                Device Controls
                            </h2>
                            <button 
                                onClick={() => {
                                    const nextMode = mode === 'manual' ? 'auto' : 'manual';
                                    setMode(nextMode);
                                    controlDevice('mode', nextMode);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-[10px] tracking-widest uppercase ${
                                    mode === 'auto' 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                    : 'bg-white border-slate-200 text-slate-400'
                                }`}
                            >
                                <Cpu className={`w-4 h-4 ${mode === 'auto' ? 'animate-pulse' : ''}`} />
                                {mode}
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* LED Control (Actuator Node) */}
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all ${devices.led ? 'bg-yellow-100 text-yellow-600 shadow-lg shadow-yellow-100' : 'bg-slate-200 text-slate-400'}`}>
                                        <Lightbulb className={devices.led ? 'animate-pulse' : ''} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Main LED</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{devices.led ? 'Active' : 'Off'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => controlDevice('led', 'TOGGLE')}
                                    className={`w-14 h-8 rounded-full relative transition-all ${devices.led ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${devices.led ? 'left-7' : 'left-1 shadow-sm'}`}></div>
                                </button>
                            </div>

                            {/* Fan Control (Center Node - Relay) */}
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all ${devices.fan ? 'bg-blue-100 text-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200 text-slate-400'}`}>
                                        <Wind className={devices.fan ? 'animate-spin' : ''} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Cooling Fan</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{devices.fan ? 'Active' : 'Off'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => controlDevice('fan', 'TOGGLE')}
                                    className={`w-14 h-8 rounded-full relative transition-all ${devices.fan ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${devices.fan ? 'left-7' : 'left-1 shadow-sm'}`}></div>
                                </button>
                            </div>

                            {/* Buzzer Control (Center Node) */}
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all ${devices.buzzer ? 'bg-rose-100 text-rose-600 shadow-lg shadow-rose-100' : 'bg-slate-200 text-slate-400'}`}>
                                        <Volume2 className={devices.buzzer ? 'animate-bounce' : ''} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Security Buzzer</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{devices.buzzer ? 'Active' : 'Off'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => controlDevice('buzzer', 'TOGGLE')}
                                    className={`w-14 h-8 rounded-full relative transition-all ${devices.buzzer ? 'bg-rose-600 shadow-lg shadow-rose-200' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${devices.buzzer ? 'left-7' : 'left-1 shadow-sm'}`}></div>
                                </button>
                            </div>

                            {/* RGB Sliders for Curtain, AC, TV */}
                            <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Center Node RGB (Curtain/AC/TV)</h3>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
                                            <span>Curtain (Red)</span>
                                        </div>
                                        <span className="text-rose-600">{devices.curtain}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={devices.curtain} 
                                        onChange={(e) => controlDevice('curtain', parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <AirVent className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>Air Conditioner (Green)</span>
                                        </div>
                                        <span className="text-emerald-600">{devices.ac}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="100" 
                                        value={devices.ac} 
                                        onChange={(e) => controlDevice('ac', parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                                    />
                                </div>
                            </div>

                            {/* TV Control (Blue - Switch) */}
                            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all ${devices.tv ? 'bg-blue-100 text-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200 text-slate-400'}`}>
                                        <Tv className={devices.tv ? 'animate-pulse' : ''} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Smart TV (Blue)</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{devices.tv ? 'Active' : 'Off'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => controlDevice('tv', 'TOGGLE')}
                                    className={`w-14 h-8 rounded-full relative transition-all ${devices.tv ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${devices.tv ? 'left-7' : 'left-1 shadow-sm'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                        <h3 className="font-bold mb-2 flex items-center gap-2 text-indigo-100 uppercase tracking-widest text-[10px]">System Status</h3>
                        <p className="text-sm font-medium leading-relaxed">AI Voice Assistant is active and ready for your commands.</p>
                    </div>
                </div>
            </div>

            <VoiceAssistant 
                onCommand={(cmd) => controlDevice(cmd.device, cmd.action, cmd.type)} 
                sensors={sensors}
                status={status}
            />

            {/* COMPACT ACTIVITY TOAST (TOP RIGHT) */}
            {latestActivity && (
                <div className="fixed top-24 right-8 z-[110] animate-slide-in-right">
                    <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 ring-1 ring-black/5">
                        <div className={`p-2 rounded-xl ${latestActivity.action === 'ON' || latestActivity.action === 'true' || latestActivity.action === 'ONLINE' || latestActivity.action === true ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} shadow-lg`}>
                            {getDeviceIcon(latestActivity.device)}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{latestActivity.device}</p>
                            <p className="text-xs font-bold leading-none">
                                {typeof latestActivity.action === 'number' || !isNaN(latestActivity.action) && latestActivity.action !== 'ON' && latestActivity.action !== 'OFF' 
                                    ? `Adjusted to ${latestActivity.action}%` 
                                    : (latestActivity.action === 'ON' || latestActivity.action === 'true' || latestActivity.action === true ? 'Switched ON' : 'Switched OFF')}
                            </p>
                        </div>
                        <div className="ml-2 pl-3 border-l border-white/10">
                            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">By {latestActivity.username === 'auto' ? 'AI' : latestActivity.username}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const GaugeCard = ({ icon, label, value, unit, color, progress }) => (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl">
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
                    <span className="text-sm font-bold text-slate-400">{unit}</span>
                </div>
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>{icon}</div>
        </div>
        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${color} transition-all duration-1000`} style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}></div>
        </div>
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className={`p-6 rounded-3xl bg-white border border-slate-200 shadow-lg overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
            <div className="text-4xl grayscale group-hover:grayscale-0 transition-all drop-shadow-sm">{icon}</div>
        </div>
    </div>
);

const ControlSwitch = ({ label, active, onToggle }) => (
    <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <span className="text-sm font-bold text-slate-600">{label}</span>
        <button 
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${active ? 'bg-indigo-600 shadow-md shadow-indigo-200' : 'bg-slate-300'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'left-7' : 'left-1 shadow-sm'}`}></div>
        </button>
    </div>
);

export default Dashboard;
