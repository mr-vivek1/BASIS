import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  Fuel, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  Calendar,
  IndianRupee,
  Droplets,
  PlusCircle,
  Search,
  PieChart as PieChartIcon,
  TrendingUp,
  Database
} from 'lucide-react';



const Sales = () => {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    pumpId: 'Pump-1',
    fuelType: 'Petrol',
    openingStock: '',
    closingStock: '',
    pricePerLitre: ''
  });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [tanks, setTanks] = useState([]);
  const [currentRates, setCurrentRates] = useState({});

  const fetchRates = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${apiUrl}/api/prices/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rates = {};
      res.data.forEach(p => {
        rates[p.fuelType] = p.pricePerLitre;
      });
      setCurrentRates(rates);
      if (!formData.pricePerLitre) {
          setFormData(prev => ({...prev, pricePerLitre: rates[prev.fuelType] || ''}));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${apiUrl}/api/tanks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTanks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await axios.get(`${apiUrl}/api/sales?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSales();
    fetchTanks();
    fetchRates();
  }, [date]);

  useEffect(() => {
    if (currentRates[formData.fuelType]) {
      setFormData(prev => ({...prev, pricePerLitre: currentRates[formData.fuelType]}));
    }
  }, [formData.fuelType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await axios.post(`${apiUrl}/api/sales`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSales();
      fetchTanks();
      setFormData({ ...formData, openingStock: '', closingStock: '' });
      // Show success toast here if implemented
    } catch (err) {

      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
             <Fuel className="w-8 h-8 text-red-500 mr-3" />
             Fuel Transactions & Stock
          </h2>
          <p className="text-slate-400 mt-1">Manage daily pump readings and revenue stream</p>
        </div>
        
        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="date" 
            className="input-glass pl-12 bg-slate-900/40" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Advanced Entry Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="glass-card p-6 border-t-4 border-t-red-500">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
               <PlusCircle className="w-5 h-5 mr-2 text-red-500" />
               New Daily Record
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Pump System</label>
                <select 
                  className="input-glass w-full appearance-none cursor-pointer"
                  value={formData.pumpId}
                  onChange={(e) => setFormData({...formData, pumpId: e.target.value})}
                >
                  <option>Pump-1 (North Wing)</option>
                  <option>Pump-2 (South Wing)</option>
                  <option>Pump-3 (Express)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Fuel Core Type</label>
                <div className="grid grid-cols-3 gap-2">
                   {['Petrol', 'Diesel', 'CNG'].map(type => (
                     <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({...formData, fuelType: type})}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          formData.fuelType === type 
                          ? 'bg-red-500/20 border-red-500 text-white shadow-lg shadow-red-500/20' 
                          : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
                        }`}
                     >
                        {type}
                     </button>
                   ))}
                </div>
                {/* Tank Status Indicator */}
                {tanks.find(t => t.fuelType === formData.fuelType) && (
                    <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center">
                            <Database className="w-3 h-3 text-slate-500 mr-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Current Inventory</span>
                        </div>
                        <span className={`text-[10px] font-bold ${
                            (tanks.find(t => t.fuelType === formData.fuelType).currentVolume / tanks.find(t => t.fuelType === formData.fuelType).capacity) < 0.2 
                            ? 'text-red-500' : 'text-green-500'
                        }`}>
                            {tanks.find(t => t.fuelType === formData.fuelType).currentVolume.toLocaleString()} L
                        </span>
                    </div>
                )}
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Opening</label>
                  <div className="relative">
                    <ArrowUpRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="number" 
                      className="input-glass w-full" 
                      placeholder="0.00"
                      value={formData.openingStock}
                      onChange={(e) => setFormData({...formData, openingStock: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Closing</label>
                  <div className="relative">
                    <ArrowDownRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="number" 
                      className="input-glass w-full" 
                      placeholder="0.00"
                      value={formData.closingStock}
                      onChange={(e) => setFormData({...formData, closingStock: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Current Rate (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input-glass w-full pl-12" 
                    placeholder="Rate per Litre"
                    value={formData.pricePerLitre}
                    onChange={(e) => setFormData({...formData, pricePerLitre: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-gradient w-full py-4 mt-4 text-sm uppercase tracking-[0.2em] shadow-2xl"
              >
                {isLoading ? 'Processing...' : 'Sync Record'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6 bg-blue-500/5 border-blue-500/10">
             <div className="flex items-center space-x-3 text-blue-400 mb-2">
                <Droplets className="w-5 h-5" />
                <span className="font-bold uppercase tracking-wider text-xs">Stock Optimization</span>
             </div>
             <p className="text-slate-400 text-sm">Automated reconciliation active. Differences are flagged for audit in real-time.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 border-b-4 border-b-purple-500"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
               <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
               Volume Analysis
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={['Petrol', 'Diesel', 'CNG'].map(type => ({
                  name: type,
                  volume: sales.filter(s => s.fuelType === type).reduce((sum, s) => sum + s.salesLitres, 0)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                  <YAxis hide />
                  <RTTooltip 
                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}}
                    itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                    {['Petrol', 'Diesel', 'CNG'].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : index === 1 ? '#3b82f6' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
               {['Petrol', 'Diesel', 'CNG'].map((type, idx) => {
                 const volume = sales.filter(s => s.fuelType === type).reduce((sum, s) => sum + s.salesLitres, 0);
                 const revenue = sales.filter(s => s.fuelType === type).reduce((sum, s) => sum + s.totalRevenue, 0);
                 return (
                   <div key={type} className="flex justify-between items-center">
                     <span className="text-xs text-slate-500 font-bold uppercase">{type}</span>
                     <div className="text-right">
                        <p className="text-sm font-bold text-white leading-none">₹{revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">{volume.toFixed(1)} L sold</p>
                     </div>
                   </div>
                 );
               })}
            </div>
          </motion.div>
        </motion.div>


        {/* Detailed Logs Table */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 glass-card overflow-hidden h-fit"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
             <h3 className="text-xl font-bold text-white flex items-center">
                <History className="w-5 h-5 mr-2 text-slate-400" />
                Logs for {new Date(date).toLocaleDateString()}
             </h3>
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input placeholder="Search logs..." className="bg-slate-900/50 border border-white/5 rounded-full px-10 py-1.5 text-xs text-slate-300 outline-none focus:border-red-500/30 w-48" />
             </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-[0.15em] font-bold">
                  <th className="py-5 px-6">Terminal ID</th>
                  <th className="py-5 px-6">Fuel Core</th>
                  <th className="py-5 px-6">Volume Sold</th>
                  <th className="py-5 px-6">Rate (₹)</th>
                  <th className="py-5 px-6 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sales.map((sale) => (
                  <motion.tr 
                    layout
                    key={sale._id} 
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                        <span className="font-bold text-slate-300 group-hover:text-white">{sale.pumpId}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          sale.fuelType === 'Petrol' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                          sale.fuelType === 'Diesel' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                          'bg-green-500/10 border-green-500/20 text-green-500'
                       }`}>
                          {sale.fuelType}
                       </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-slate-300 font-mono">{sale.salesLitres.toFixed(1)} L</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-slate-500">₹{sale.pricePerLitre}</span>
                    </td>
                    <td className="py-5 px-6 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-lg font-bold text-white tracking-tight">₹{sale.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-medium">Verified Status</span>
                       </div>
                    </td>
                  </motion.tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                       <div className="flex flex-col items-center">
                          <History className="w-12 h-12 text-slate-800 mb-4" />
                          <p className="text-slate-500 font-medium">No system records found for this operational cycle.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-900/30 border-t border-white/5 flex justify-between items-center">
             <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Cycle Summary</span>
             <div className="flex space-x-8">
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Total Ltr</p>
                   <p className="text-lg font-bold text-white">{sales.reduce((sum, s) => sum + s.salesLitres, 0).toFixed(1)}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-500 uppercase font-bold">Net Revenue</p>
                   <p className="text-lg font-bold text-red-500">₹{sales.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString()}</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Prominent Daily Summary at the end */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-900 border-t-4 border-t-red-500"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-red-500 rounded-2xl shadow-2xl shadow-red-500/20">
              <IndianRupee className="w-10 h-10 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-[0.3em] mb-1">Final Operational Settlement</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">
                ₹{sales.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">Verified Net Revenue for {new Date(date).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex gap-10">
            <div className="text-center md:text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Throughput</p>
              <p className="text-2xl font-bold text-white uppercase">{sales.reduce((sum, s) => sum + s.salesLitres, 0).toFixed(1)} <span className="text-sm font-normal text-slate-500">Litres</span></p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Transactions</p>
              <p className="text-2xl font-bold text-white uppercase">{sales.length} <span className="text-sm font-normal text-slate-500">Records</span></p>
            </div>
          </div>

          <button className="btn-gradient px-10 py-4 text-xs font-bold uppercase tracking-widest flex items-center group">
            <TrendingUp className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Download Analysis report
          </button>
        </div>
      </motion.div>
    </div>
  );
};


export default Sales;
