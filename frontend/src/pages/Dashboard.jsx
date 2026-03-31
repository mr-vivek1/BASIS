import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Droplets, 
  Wrench, 
  HandCoins,
  ArrowRight,
  AlertTriangle,
  Zap,
  Calendar,
  Layers,
  Database,
  Fuel as TankIcon,
  RefreshCcw,
  ListPlus
} from 'lucide-react';



const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6 group overflow-hidden relative"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 blur-3xl -mr-8 -mt-8 rounded-full`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs text-slate-500">
      <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
      <span className="text-green-500 font-medium mr-1">+2.4%</span> vs yesterday
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalLitres: 0,
    pendingMaintenance: 0,
    outstandingLoans: 0,
    chartData: [],
    fuelBreakdown: []
  });
  const [tanks, setTanks] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      
      const [statsRes, tanksRes] = await Promise.all([
          axios.get(`${apiUrl}/api/stats/today`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${apiUrl}/api/tanks`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats({
          ...statsRes.data,
          fuelBreakdown: statsRes.data.fuelBreakdown || []
      });
      setTanks(tanksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const handleRefill = async (tankId) => {
    const amount = prompt("Enter amount to refill (Litres):");
    if (!amount || isNaN(amount)) return;

    try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || '';
        await axios.put(`${apiUrl}/api/tanks/refill/${tankId}`, { refillAmount: amount }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchDashboardData();
    } catch (err) {
        console.error(err);
        alert("Refill failed. Check console for details.");
    }
  };


  return (
    <div className="p-4 md:p-10 space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        {/* ... existing header ... */}
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 text-red-500 mb-2"
          >
            <Zap className="w-4 h-4 fill-red-500/20" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Operational Overview</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight text-white mb-2"
          >
            Terminal Dashboard
          </motion.h1>
          <p className="text-slate-400 text-lg">System Status: <span className="text-green-500 font-medium animate-pulse">Running Optimized</span></p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl"
        >
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-slate-300 font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </motion.div>
      </header>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} icon={CircleDollarSign} color="red" delay={0.1} />
        <StatCard title="Fuel Volume" value={`${stats.totalLitres || 0} L`} icon={Droplets} color="blue" delay={0.2} />
        <StatCard title="Active Maintenance" value={stats.pendingMaintenance || 0} icon={Wrench} color="yellow" delay={0.3} />
        <StatCard title="Credit Exposure" value={`₹${(stats.outstandingLoans || 0).toLocaleString()}`} icon={HandCoins} color="red" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card lg:col-span-2 p-8"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="text-xl font-bold text-white mb-1">Financial Performance</h4>
              <p className="text-slate-400 text-sm">Revenue trends over the last operational cycle</p>
            </div>
            <div className="bg-slate-900/50 p-1.5 rounded-xl border border-white/5 flex">
               <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/20 transition-all">7D</button>
               <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300">30D</button>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} 
                  dx={-10}
                />
                <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}
                    labelStyle={{color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold'}}
                    itemStyle={{color: '#ef4444', fontSize: '14px', fontWeight: 'bold'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ef4444" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Breakdown Analysis */}
        <div className="space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-card p-6 border-b-4 border-b-blue-500"
            >
                <h4 className="font-bold text-white mb-6 flex items-center">
                   <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                   Fuel Core Analysis
                </h4>
                <div className="space-y-4">
                    {(stats.fuelBreakdown || []).map(fuel => (
                        <div key={fuel.type} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-xs font-bold uppercase ${
                                    fuel.type === 'Petrol' ? 'text-orange-500' :
                                    fuel.type === 'Diesel' ? 'text-blue-500' : 'text-green-500'
                                }`}>{fuel.type}</span>
                                <span className="text-white font-bold">₹{fuel.revenue.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${
                                        fuel.type === 'Petrol' ? 'bg-orange-500' :
                                        fuel.type === 'Diesel' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${stats.totalRevenue > 0 ? (fuel.revenue / stats.totalRevenue) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[10px] text-slate-500 uppercase">Volume Sold</span>
                                <span className="text-[10px] text-slate-300 font-bold">{fuel.volume} L</span>
                            </div>
                        </div>
                    ))}
                    {(!stats.fuelBreakdown || stats.fuelBreakdown.length === 0) && (
                        <p className="text-slate-500 text-sm italic py-4 text-center">No transactions registered for breakdown.</p>
                    )}
                </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-card p-6 border-l-4 border-l-green-500"
            >
                <h4 className="font-bold text-white mb-6 flex items-center">
                   <Database className="w-4 h-4 mr-2 text-green-500" />
                   Storage Terminal Status
                </h4>
                <div className="space-y-6">
                    {tanks.map(tank => (
                        <div key={tank._id} className="relative">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">{tank.tankName}</p>
                                    <div className="flex items-center mt-1">
                                        <TankIcon className={`w-3 h-3 mr-1 ${
                                            tank.fuelType === 'Petrol' ? 'text-orange-500' :
                                            tank.fuelType === 'Diesel' ? 'text-blue-500' : 'text-green-500'
                                        }`} />
                                        <span className="text-sm font-bold text-white tracking-tight">{tank.currentVolume.toLocaleString()} L</span>
                                        <button 
                                            onClick={() => handleRefill(tank._id)}
                                            className="ml-3 p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all group"
                                            title="Refill Tank"
                                        >
                                            <RefreshCcw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
                                        </button>
                                    </div>

                                </div>
                                <span className="text-[10px] font-bold text-slate-500">{((tank.currentVolume / tank.capacity) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(tank.currentVolume / tank.capacity) * 100}%` }}
                                    className={`h-full rounded-full ${
                                        (tank.currentVolume / tank.capacity) < 0.2 ? 'bg-red-500 animate-pulse' :
                                        tank.fuelType === 'Petrol' ? 'bg-orange-500' :
                                        tank.fuelType === 'Diesel' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}
                                />
                            </div>
                            {tank.currentVolume < tank.capacity * 0.2 && (
                                <p className="text-[9px] font-black text-red-500 uppercase mt-2 animate-bounce">Critical Level: Order Refill</p>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-card p-6 border-l-4 border-l-red-500"

            >
                <h4 className="font-bold text-white mb-6 flex items-center">
                   <Layers className="w-4 h-4 mr-2 text-red-500" />
                   Rapid Terminal Actions
                </h4>
                <div className="grid grid-cols-1 gap-4">
                    <Link to="/sales" className="group flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl hover:bg-slate-800/80 transition-all border border-white/5">
                        <span className="font-semibold text-slate-300 group-hover:text-white">Record Fuel Transaction</span>
                        <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/attendance" className="group flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl hover:bg-slate-800/80 transition-all border border-white/5">
                        <span className="font-semibold text-slate-300 group-hover:text-white">Staff Shift Protocol</span>
                        <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};


const CircleDollarSign = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/>
  </svg>
);

export default Dashboard;
