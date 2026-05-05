import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Database, Users, User, LogOut } from 'lucide-react';

const MobileNavbar = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Home', path: '/dashboard' },
        { icon: <History size={20} />, label: 'History', path: '/history', adminOnly: true },
        { icon: <Database size={20} />, label: 'Sensors', path: '/datasensor', adminOnly: true },
        { icon: <Users size={20} />, label: 'Users', path: '/users', adminOnly: true },
        { icon: <User size={20} />, label: 'About', path: '/about' },
    ];

    const filteredItems = navItems.filter(item => !item.adminOnly || (user && user.role === 'admin'));

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 safe-bottom px-4 py-2">
            <div className="flex justify-around items-center h-16">
                {filteredItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                            location.pathname === item.path 
                            ? 'text-indigo-600' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <div className={`p-2 rounded-xl ${location.pathname === item.path ? 'bg-indigo-50' : ''}`}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </button>
                ))}
                <button
                    onClick={onLogout}
                    className="flex flex-col items-center justify-center gap-1 text-rose-400 hover:text-rose-600 transition-all"
                >
                    <div className="p-2">
                        <LogOut size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Exit</span>
                </button>
            </div>
        </div>
    );
};

export default MobileNavbar;
