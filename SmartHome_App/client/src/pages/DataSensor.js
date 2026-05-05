import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Database, Search, Thermometer, Droplets, Sun, Wind, Calendar, Clock, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import _ from 'lodash';
import io from 'socket.io-client';
import API_URL from '../config';

const socket = io(API_URL);

const DataSensor = ({ dataSensor, setDataSensor, currentPage, setCurrentPage }) => {
    const navigate = useNavigate();
    const [filteredData, setFilteredData] = useState([]);
    const [sortField, setSortField] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchValue, setSearchValue] = useState('');
    const [searchField, setSearchField] = useState('temp');
    const [isSearching, setIsSearching] = useState(false);

    const recordsPerPage = 10;

    useEffect(() => {
        // Initial fetch
        fetch(`${API_URL}/api/sensordata`)
            .then((res) => res.json())
            .then((data) => {
                setDataSensor(data);
            })
            .catch((err) => console.error('Fetch sensor data error:', err));

        // Real-time listener
        socket.on('sensor_update', (newData) => {
            setDataSensor(prev => {
                // Check if the record already exists (to avoid duplicates if fetch and socket overlap)
                const exists = prev.some(item => item.id === newData.id);
                if (exists) return prev;

                // Create a new record matching DB structure for immediate UI update
                const record = {
                    id: newData.id || Date.now(), // Fallback if ID not provided
                    temp: newData.temperature,
                    humi: newData.humidity,
                    light: newData.ldr,
                    date: new Date().toISOString(), // Use current time for live updates
                    ...newData
                };
                return [record, ...prev];
            });
        });

        return () => {
            socket.off('sensor_update');
        };
    }, []);

    const handleSort = (field) => {
        const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortOrder(newOrder);
        const sorted = _.orderBy(dataSensor, [field], [newOrder]);
        setDataSensor(sorted);
    };

    const handleSearch = () => {
        if (!searchValue) {
            setIsSearching(false);
            setFilteredData([]);
            return;
        }

        const filtered = _.filter(dataSensor, (item) => {
            const val = item[searchField]?.toString().toLowerCase();
            return val?.includes(searchValue.toLowerCase());
        });

        setFilteredData(filtered);
        setIsSearching(true);
        setCurrentPage(1);
    };

    const displayData = isSearching ? filteredData : dataSensor;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const records = displayData.slice(firstIndex, lastIndex);
    const npage = Math.ceil(displayData.length / recordsPerPage);

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
                                <Database className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
                                Sensor Data
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-1">Real-time Telemetry Log</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-wrap items-center gap-2 bg-white p-2 pl-4 rounded-[1.5rem] border border-slate-200 shadow-sm w-full md:w-auto animate-slide-up">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Value..."
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 flex-1 md:w-32"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <select 
                            className="bg-slate-50 border-none text-[9px] font-black uppercase tracking-widest text-slate-500 rounded-xl focus:ring-0 cursor-pointer py-1"
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                        >
                            <option value="temp">Temp</option>
                            <option value="humi">Humid</option>
                            <option value="light">Light</option>
                            <option value="motion">Motion</option>
                        </select>
                        <button 
                            onClick={handleSearch}
                            className="premium-gradient text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden animate-slide-up">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-0">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th onClick={() => handleSort('id')} className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">ID</th>
                                    <th onClick={() => handleSort('temp')} className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                                            Temp
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('humi')} className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                                            Humid
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('light')} className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Sun className="w-3.5 h-3.5 text-yellow-500" />
                                            Light
                                        </div>
                                    </th>
                                    <th onClick={() => handleSort('motion')} className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-rose-500" />
                                            Motion
                                        </div>
                                    </th>
                                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {records.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center text-slate-400 italic">No sensor data found</td>
                                    </tr>
                                ) : (
                                    records.map((sensor, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="p-5 text-xs font-bold text-slate-400">#{sensor.id}</td>
                                            <td className="p-5">
                                                <span className="text-base font-black text-slate-800">{sensor.temp}</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">°C</span>
                                            </td>
                                            <td className="p-5">
                                                <span className="text-base font-black text-slate-800">{sensor.humi}</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">%</span>
                                            </td>
                                            <td className="p-5">
                                                <span className="text-base font-black text-slate-800">{sensor.light}</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-1">LX</span>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                    sensor.motion || sensor.motion === 1 
                                                    ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                                                    : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                                                }`}>
                                                    {sensor.motion || sensor.motion === 1 ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-xs font-bold text-slate-600">
                                                {new Date(sensor.date || sensor.timestamp || sensor.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {npage > 1 && (
                        <div className="p-4 lg:p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {displayData.length} Total Records
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex gap-1 overflow-x-auto max-w-[150px] sm:max-w-none">
                                    {[...Array(npage)].map((_, i) => {
                                        const n = i + 1;
                                        if (n === 1 || n === npage || (n >= currentPage - 1 && n <= currentPage + 1)) {
                                            return (
                                                <button 
                                                    key={n}
                                                    onClick={() => setCurrentPage(n)}
                                                    className={`min-w-[36px] h-9 rounded-xl text-[10px] font-black transition-all ${
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
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataSensor;
