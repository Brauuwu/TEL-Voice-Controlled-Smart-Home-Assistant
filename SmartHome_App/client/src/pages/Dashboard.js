import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import io from 'socket.io-client';
import { Thermometer, Droplets, Sun, Lightbulb, Wind, Maximize2, Bell, Inbox, X, Activity, Cpu, History, Database, User, Volume2, Tv, AirVent } from 'lucide-react';
import VoiceAssistant from '../components/VoiceAssistant';
import API_URL from '../config';

const socket = io(API_URL);

const Dashboard = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [sensors, setSensors] = useState({ temperature: 0, humidity: 0, motion: false, ldr: 0 });
    const [history, setHistory] = useState([]);
    const [devices, setDevices] = useState({ led: 0, fan: false, buzzer: false, curtain: 0, ac: 0, tv: false });
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('offline');
    const [nodeStatus, setNodeStatus] = useState({ sensorNode: false, actuatorNode: false });
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [latestActivity, setLatestActivity] = useState(null);
    const [mode, setMode] = useState('manual');

    useEffect(() => {
        // Initial fetches
        fetch(`${API_URL}/api/logs`)
            .then(res => res.json())
            .then(data => setLogs(data));

        fetch(`${API_URL}/api/sensors/history`)
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

        fetch(`${API_URL}/api/status/gateway`)
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
            if (data.sensorNode !== undefined || data.actuatorNode !== undefined) {
                setNodeStatus(prev => ({
                    sensorNode: data.sensorNode ?? prev.sensorNode,
                    actuatorNode: data.actuatorNode ?? prev.actuatorNode
                }));
            }
            setHistory(prev => [...prev.slice(-19), { time: new Date().toLocaleTimeString(), ...data }]);
        });

        socket.on('status_update', (data) => {
            if (data.device === 'gateway') {
                setStatus(data.status);
            } else if (data.device === 'mode') {
                setMode(data.status);
            } else if (devices.hasOwnProperty(data.device)) {
                // Preserve numeric values for level-based devices
                const numericDevices = ['led', 'curtain', 'ac'];
                if (numericDevices.includes(data.device)) {
                    const val = typeof data.status === 'number' ? data.status : parseInt(data.status);
                    setDevices(prev => ({ ...prev, [data.device]: isNaN(val) ? (data.status === 'ON' ? 1 : 0) : val }));
                } else {
                    setDevices(prev => ({ ...prev, [data.device]: data.status === 'ON' || data.status === true || data.status === 1 }));
                }
            }
        });

        socket.on('new_activity', (data) => {
            setLogs(prev => [data, ...prev].slice(0, 50));
            setLatestActivity(data);
            // Auto-hide toast after 8 seconds
            setTimeout(() => setLatestActivity(null), 8000);
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
            case 'ac': return <AirVent className="w-4 h-4" />;
            case 'tv': return <Tv className="w-4 h-4" />;
            case 'gateway': return <Cpu className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const formatAction = (device, action) => {
        const val = typeof action === 'string' ? parseInt(action) : action;
        const dev = device?.toLowerCase();
        if (dev === 'led') {
            const labels = { 0: 'Tắt', 1: 'Sáng yếu', 2: 'Sáng vừa', 3: 'Sáng max' };
            if (!isNaN(val) && labels[val] !== undefined) return labels[val];
        }
        if (dev === 'curtain') {
            if (val === 0) return 'Đóng';
            if (val === 50) return 'Mở vừa';
            if (val === 100) return 'Mở toang';
        }
        if (dev === 'ac') {
            if (!isNaN(val) && val >= 20 && val <= 29) return `${val}°C`;
            if (val === 0 || action === 'OFF') return 'Tắt';
        }
        if (action === 'ON' || action === 'true' || action === true || action === 'ONLINE') return 'Bật';
        if (action === 'OFF' || action === 'false' || action === false || action === 'OFFLINE') return 'Tắt';
        return String(action);
    };

    const isActionPositive = (device, action) => {
        const val = typeof action === 'string' ? parseInt(action) : action;
        if (typeof val === 'number' && !isNaN(val)) return val > 0;
        return action === 'ON' || action === 'true' || action === true || action === 'ONLINE';
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
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 lg:p-8 font-sans pb-24 lg:pb-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-12 gap-4">
                <div className="animate-slide-up">
                    <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                        Smart Home
                    </h1>
                    <p className="text-slate-400 mt-1 text-sm font-bold uppercase tracking-widest">
                        Hi, <span className="text-indigo-600">{user.username}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="hidden lg:flex items-center gap-2">
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
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${status === 'online' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                            <Cpu className={`w-3.5 h-3.5 ${status === 'online' ? 'text-emerald-500 animate-pulse' : 'text-rose-400'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${status === 'online' ? 'text-emerald-600' : 'text-rose-500'}`}>GW</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${nodeStatus.sensorNode ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                            <Thermometer className={`w-3.5 h-3.5 ${nodeStatus.sensorNode ? 'text-emerald-500' : 'text-rose-400'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${nodeStatus.sensorNode ? 'text-emerald-600' : 'text-rose-500'}`}>Sensor</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${nodeStatus.actuatorNode ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                            <Lightbulb className={`w-3.5 h-3.5 ${nodeStatus.actuatorNode ? 'text-emerald-500' : 'text-rose-400'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${nodeStatus.actuatorNode ? 'text-emerald-600' : 'text-rose-500'}`}>Actuator</span>
                        </div>
                    </div>

                    {/* Inbox/Activity Dropdown Container */}
                    <div className="relative">
                        <button
                            onClick={() => setIsLogOpen(!isLogOpen)}
                            className="relative p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group z-10"
                        >
                            <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {logs.length > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
                            )}
                        </button>

                        {isLogOpen && (
                            <div className="fixed inset-0 lg:absolute lg:inset-auto lg:top-16 lg:right-0 w-full h-full lg:w-[380px] lg:h-auto lg:max-h-[520px] bg-white lg:rounded-[32px] shadow-2xl border border-slate-100 z-[100] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 lg:origin-top-right">
                                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 safe-top">
                                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                        <Inbox className="w-5 h-5 text-indigo-600" />
                                        Activity Log
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg uppercase tracking-widest">
                                            {logs.length > 8 ? `8 / ${logs.length}` : `${logs.length} New`}
                                        </span>
                                        <button onClick={() => setIsLogOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20} /></button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {logs.length === 0 ? (
                                        <div className="text-center py-20 text-slate-400 italic text-sm">No recent activity</div>
                                    ) : (
                                        logs.slice(0, 8).map((log, i) => (
                                            <div key={i} className="group p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent bg-white shadow-sm ring-1 ring-slate-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-xs font-black text-slate-800 flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg ${isActionPositive(log.device, log.action) ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
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
                                                        {formatAction(log.device, log.action)} by <span className="text-slate-800 font-bold">{log.username === 'auto' ? 'AI' : log.username}</span>
                                                    </p>
                                                    <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${log.event_type === 'manual' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {log.event_type}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex border-t border-slate-50 safe-bottom">
                                    {user.role === 'admin' && (
                                        <button
                                            onClick={() => { setIsLogOpen(false); navigate('/history'); }}
                                            className="flex-1 p-4 text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors text-center"
                                        >
                                            View All →
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsLogOpen(false)}
                                        className="flex-1 p-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors text-center"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* LEFT COLUMN — Sensors & Analytics */}
                <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                    {/* Sensor Gauges */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <GaugeCard icon={<Thermometer className="w-5 h-5 lg:w-6 lg:h-6" />} label="Temp" value={status === 'online' ? sensors.temperature : '--'} unit="°C" color="from-orange-400 to-red-500" progress={sensors.temperature * 2} />
                        <GaugeCard icon={<Droplets className="w-5 h-5 lg:w-6 lg:h-6" />} label="Humi" value={status === 'online' ? sensors.humidity : '--'} unit="%" color="from-blue-400 to-indigo-500" progress={sensors.humidity} />
                        <GaugeCard icon={<Sun className="w-5 h-5 lg:w-6 lg:h-6" />} label="Light" value={status === 'online' ? sensors.ldr : '--'} unit="Lux" color="from-yellow-400 to-orange-500" progress={sensors.ldr / 10} />
                        <GaugeCard
                            icon={<Activity className="w-5 h-5 lg:w-6 lg:h-6" />}
                            label="Motion"
                            value={status === 'online' ? (sensors.motion ? 'YES' : 'NO') : '--'}
                            unit=""
                            color={sensors.motion ? "from-rose-400 to-rose-600" : "from-emerald-400 to-emerald-600"}
                            progress={sensors.motion ? 100 : 0}
                        />
                    </div>

                    {/* Analytics */}
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/40 overflow-hidden">
                        <div className="flex justify-between items-center mb-6 lg:mb-8">
                            <h2 className="text-lg lg:text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                Analytics
                            </h2>
                            <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <TrendChart title="Temperature (°C)" data={history} dataKey="temperature" color="#f97316" gradientId="colorTemp" />
                            <TrendChart title="Humidity (%)" data={history} dataKey="humidity" color="#6366f1" gradientId="colorHum" />
                            <TrendChart title="Light (Lux)" data={history} dataKey="ldr" color="#eab308" gradientId="colorLight" />
                        </div>
                    </div>
                    
                    {/* AI Assistant */}
                    <div className="premium-gradient rounded-[2rem] p-6 lg:p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                        <h3 className="font-bold mb-2 flex items-center gap-2 text-indigo-100 uppercase tracking-widest text-[10px]">AI Assistant</h3>
                        <p className="text-sm font-medium leading-relaxed opacity-90">Voice commands are active. Try "Bật đèn", "Tăng độ sáng", "Điều hòa 24 độ" or "Hỏi nhiệt độ".</p>
                    </div>
                </div>

                {/* RIGHT COLUMN — Device Controls */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Quick Toggles */}
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                Quick Toggles
                            </h2>
                            <button
                                onClick={() => {
                                    const nextMode = mode === 'manual' ? 'auto' : 'manual';
                                    setMode(nextMode);
                                    controlDevice('mode', nextMode);
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-[9px] tracking-widest uppercase ${mode === 'auto'
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'bg-white border-slate-200 text-slate-400'
                                    }`}
                            >
                                <Cpu className={`w-3.5 h-3.5 ${mode === 'auto' ? 'animate-pulse' : ''}`} />
                                {mode}
                            </button>
                        </div>
                        <div className="space-y-4">
                            <DeviceToggle
                                icon={<Wind />}
                                label="Cooling Fan"
                                active={devices.fan}
                                onClick={() => controlDevice('fan', 'TOGGLE')}
                                color="blue"
                                spin={devices.fan}
                            />
                            <DeviceToggle
                                icon={<Volume2 />}
                                label="Security Buzzer"
                                active={devices.buzzer}
                                onClick={() => controlDevice('buzzer', 'TOGGLE')}
                                color="rose"
                                bounce={devices.buzzer}
                            />
                            <DeviceToggle
                                icon={<Tv />}
                                label="Smart TV"
                                active={devices.tv}
                                onClick={() => controlDevice('tv', 'TOGGLE')}
                                color="blue"
                            />
                        </div>
                    </div>

                    {/* Level Controls */}
                    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base lg:text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-yellow-500 rounded-full"></span>
                                Level Controls
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <SegmentedControl
                                icon={<Lightbulb />}
                                label="Main LED"
                                value={devices.led}
                                options={[
                                    { label: 'Tắt', value: 0 },
                                    { label: 'Yếu', value: 1 },
                                    { label: 'Vừa', value: 2 },
                                    { label: 'Max', value: 3 }
                                ]}
                                onChange={(val) => controlDevice('led', val)}
                                color="yellow"
                            />
                            <SegmentedControl
                                icon={<Maximize2 />}
                                label="Curtain"
                                value={devices.curtain}
                                options={[
                                    { label: 'Đóng', value: 0 },
                                    { label: 'Vừa', value: 50 },
                                    { label: 'Mở', value: 100 }
                                ]}
                                onChange={(val) => controlDevice('curtain', val)}
                                color="rose"
                            />
                            <StepperControl
                                icon={<AirVent />}
                                label="AC Unit"
                                value={devices.ac}
                                min={20}
                                max={29}
                                unit="°C"
                                onChange={(val) => controlDevice('ac', val)}
                                color="emerald"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <VoiceAssistant
                onCommand={(cmd) => controlDevice(cmd.device, cmd.action, cmd.type)}
                sensors={sensors}
                status={status}
                devices={devices}
            />

            {/* COMPACT ACTIVITY TOAST */}
            {latestActivity && (
                <div className="fixed top-6 lg:top-24 right-4 lg:right-8 z-[110] animate-slide-in-right">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 ring-1 ring-black/5">
                        <div className={`p-2 rounded-xl ${isActionPositive(latestActivity.device, latestActivity.action) ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} shadow-lg`}>
                            {getDeviceIcon(latestActivity.device)}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{latestActivity.device}</p>
                            <p className="text-xs font-bold leading-none">
                                {formatAction(latestActivity.device, latestActivity.action)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const GaugeCard = ({ icon, label, value, unit, color, progress }) => (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-4 lg:p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
        <div className="flex justify-between items-start relative z-10 mb-4 lg:mb-6">
            <div className={`p-2 lg:p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>{icon}</div>
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
            </div>
        </div>
        <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${color} transition-all duration-1000`} style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}></div>
        </div>
    </div>
);

const TrendChart = ({ title, data, dataKey, color, gradientId }) => (
    <div className="h-40 lg:h-48">
        <h3 className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase" style={{ color: color }}>{title}</h3>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#cbd5e1" fontSize={10} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: color }}
                />
                <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fill={`url(#${gradientId})`} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const DeviceToggle = ({ icon, label, active, onClick, color, spin, bounce }) => {
    const colors = {
        yellow: 'bg-yellow-100 text-yellow-600 shadow-yellow-100',
        blue: 'bg-blue-100 text-blue-600 shadow-blue-100',
        rose: 'bg-rose-100 text-rose-600 shadow-rose-100',
        indigo: 'bg-indigo-100 text-indigo-600 shadow-indigo-100',
    };

    return (
        <div className="p-4 lg:p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all ${active ? colors[color] + ' shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                    {React.cloneElement(icon, { className: `w-5 h-5 ${spin ? 'animate-spin' : ''} ${bounce ? 'animate-bounce' : ''} ${active && !spin && !bounce ? 'animate-pulse' : ''}` })}
                </div>
                <div>
                    <p className="text-xs lg:text-sm font-black text-slate-800 uppercase tracking-tight">{label}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{active ? 'Active' : 'Off'}</p>
                </div>
            </div>
            <button
                onClick={onClick}
                className={`w-12 lg:w-14 h-7 lg:h-8 rounded-full relative transition-all ${active ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-5 lg:w-6 h-5 lg:h-6 bg-white rounded-full transition-all ${active ? 'left-6 lg:left-7' : 'left-1 shadow-sm'}`}></div>
            </button>
        </div>
    );
};

const SegmentedControl = ({ icon, label, value, options, onChange, color }) => {
    const colorMap = {
        yellow: { active: 'bg-yellow-500 text-white shadow-yellow-200', icon: 'bg-yellow-100 text-yellow-600 shadow-yellow-100' },
        rose: { active: 'bg-rose-500 text-white shadow-rose-200', icon: 'bg-rose-100 text-rose-600 shadow-rose-100' },
        emerald: { active: 'bg-emerald-500 text-white shadow-emerald-200', icon: 'bg-emerald-100 text-emerald-600 shadow-emerald-100' },
    };
    const colors = colorMap[color] || colorMap.yellow;
    const isActive = value > 0 || value === true;

    return (
        <div className="p-4 lg:p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl transition-all ${isActive ? colors.icon + ' shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                    {React.cloneElement(icon, { className: `w-4 h-4 ${isActive ? 'animate-pulse' : ''}` })}
                </div>
                <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{label}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {options.find(o => o.value === value)?.label || 'Off'}
                    </p>
                </div>
            </div>
            <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                            value === opt.value
                                ? colors.active + ' shadow-md'
                                : 'text-slate-500 hover:bg-white hover:shadow-sm'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const StepperControl = ({ icon, label, value, min, max, unit, onChange, color }) => {
    const colorMap = {
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600 shadow-emerald-100', btn: 'hover:bg-emerald-100 text-emerald-600' },
        rose: { text: 'text-rose-600', bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600 shadow-rose-100', btn: 'hover:bg-rose-100 text-rose-600' },
    };
    const colors = colorMap[color] || colorMap.emerald;
    const isActive = value >= min;

    return (
        <div className="p-4 lg:p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-all ${isActive ? colors.icon + ' shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                        {React.cloneElement(icon, { className: `w-4 h-4 ${isActive ? 'animate-pulse' : ''}` })}
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{label}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            {isActive ? `${value}${unit}` : 'Off'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isActive && (
                        <button
                            onClick={() => onChange(value <= min ? 0 : value - 1)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg bg-white border border-slate-200 transition-all ${colors.btn} shadow-sm`}
                        >
                            −
                        </button>
                    )}
                    <div className={`min-w-[52px] h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                        isActive ? colors.bg + ' ' + colors.text : 'bg-slate-200 text-slate-400'
                    }`}>
                        {isActive ? `${value}${unit}` : 'OFF'}
                    </div>
                    <button
                        onClick={() => onChange(isActive ? Math.min(value + 1, max) : min)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg bg-white border border-slate-200 transition-all ${colors.btn} shadow-sm`}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};


export default Dashboard;
