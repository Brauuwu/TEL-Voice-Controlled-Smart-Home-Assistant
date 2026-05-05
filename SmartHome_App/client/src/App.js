import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import ActionHistory from './pages/ActionHistory';
import DataSensor from './pages/DataSensor';
import About from './pages/About';
import MobileNavbar from './components/MobileNavbar';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [dataSensor, setDataSensor] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Set height for mobile browsers (handling the address bar issue)
  useEffect(() => {
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="App selection:bg-indigo-100">
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/users" 
          element={user && user.role === 'admin' ? <UserManagement user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/history" 
          element={user && user.role === 'admin' ? <ActionHistory /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/datasensor" 
          element={user && user.role === 'admin' ? <DataSensor dataSensor={dataSensor} setDataSensor={setDataSensor} currentPage={currentPage} setCurrentPage={setCurrentPage} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/about" 
          element={user ? <About user={user} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
      
      {user && <MobileNavbar user={user} onLogout={handleLogout} />}
    </div>
  );
}


export default App;
