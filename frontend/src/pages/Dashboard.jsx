import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalLitres: 0,
    pendingMaintenance: 0,
    outstandingLoans: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/stats/today`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back, <span className="text-accent font-medium">{user?.name}</span></p>
        </div>
        <div className="text-right">
           <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card border-l-4 border-accent">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Today's Revenue</p>
          <h3 className="text-3xl font-bold mt-2">₹{stats.totalRevenue.toLocaleString('en-IN')}</h3>
        </div>
        <div className="card border-l-4 border-blue-500">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Litres Sold</p>
          <h3 className="text-3xl font-bold mt-2">{stats.totalLitres} L</h3>
        </div>
        <div className="card border-l-4 border-yellow-500">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Pending Maint.</p>
          <h3 className="text-3xl font-bold mt-2">{stats.pendingMaintenance}</h3>
        </div>
        <div className="card border-l-4 border-red-500">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Outstanding Loans</p>
          <h3 className="text-3xl font-bold mt-2 text-red-500">₹{stats.outstandingLoans.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="card lg:col-span-2">
          <h4 className="font-bold mb-6 text-gray-300">Revenue (Last 7 Days)</h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                    contentStyle={{backgroundColor: '#16213e', border: '1px solid #2d2d44', borderRadius: '8px'}}
                    itemStyle={{color: '#e94560'}}
                />
                <Bar dataKey="revenue" fill="#e94560" radius={[4, 4, 0, 0]}>
                   {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 6 ? '#e94560' : '#4f46e5'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortcuts & Alerts */}
        <div className="space-y-6">
            <div className="card">
                <h4 className="font-bold mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 gap-3">
                    <Link to="/sales" className="flex items-center justify-between p-3 bg-primary rounded-lg hover:border-accent border border-transparent transition-all group">
                        <span className="text-gray-300 group-hover:text-white">Add Sales Entry</span>
                        <span className="bg-accent/10 text-accent p-1 rounded">→</span>
                    </Link>
                    <Link to="/attendance" className="flex items-center justify-between p-3 bg-primary rounded-lg hover:border-green-500 border border-transparent transition-all group">
                        <span className="text-gray-300 group-hover:text-white">Staff Check-In</span>
                        <span className="bg-green-500/10 text-green-500 p-1 rounded">→</span>
                    </Link>
                    <Link to="/maintenance" className="flex items-center justify-between p-3 bg-primary rounded-lg hover:border-yellow-500 border border-transparent transition-all group">
                        <span className="text-gray-300 group-hover:text-white">Log Maintenance</span>
                        <span className="bg-yellow-500/10 text-yellow-500 p-1 rounded">→</span>
                    </Link>
                </div>
            </div>

            <div className="card">
                <h4 className="font-bold mb-4">Urgent Alerts</h4>
                <div className="space-y-3">
                    {stats.pendingMaintenance > 0 && (
                        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <span className="text-yellow-500">⚠️</span>
                            <p className="text-xs text-yellow-200">{stats.pendingMaintenance} maintenance task(s) require attention.</p>
                        </div>
                    )}
                    {stats.outstandingLoans > 10000 && (
                        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <span className="text-red-500">💰</span>
                            <p className="text-xs text-red-200">High outstanding credit balance: ₹{stats.outstandingLoans.toLocaleString('en-IN')}</p>
                        </div>
                    )}
                    {stats.pendingMaintenance === 0 && stats.outstandingLoans <= 10000 && (
                        <p className="text-center text-gray-500 text-sm py-4 italic">All systems performing within normal parameters.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
