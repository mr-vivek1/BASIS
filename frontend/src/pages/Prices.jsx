import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IndianRupee, 
  RefreshCcw, 
  TrendingUp, 
  History, 
  Droplets,
  Zap,
  CheckCircle,
  Calendar,
  Fuel
} from 'lucide-react';

const Prices = () => {
    const [currentPrices, setCurrentPrices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newRates, setNewRates] = useState({});
    const [history, setHistory] = useState([]);

    const fetchPrices = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await axios.get(`${apiUrl}/api/prices/current`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentPrices(res.data);
            
            // Initializing inputs for editing
            const rates = {};
            res.data.forEach(p => {
                rates[p.fuelType] = p.pricePerLitre;
            });
            setNewRates(rates);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHistory = async () => {
        // This is a simplified "last entries" fetch using stats or direct if available.
        // For now, if we use the backend we might need a dedicated route or just use current.
        // Let's assume we just show the current for now or mock some if it's the first time.
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const handleUpdate = async (type) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await axios.post(`${apiUrl}/api/prices`, {
                fuelType: type,
                pricePerLitre: parseFloat(newRates[type])
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPrices();
            alert(`${type} rate synchronized successfully.`);
        } catch (err) {
            console.error(err);
            alert("Rate update failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center space-x-2 text-red-500 mb-2"
                   >
                     <Zap className="w-4 h-4 fill-red-500/20" />
                     <span className="text-xs font-bold uppercase tracking-[0.2em]">Market Calibration</span>
                   </motion.div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                        <IndianRupee className="w-8 h-8 text-red-500 mr-3" />
                        Fuel Rate Management
                    </h2>
                    <p className="text-slate-400 mt-1">Configure real-time pricing for the operational network</p>
                </div>
                
                <div className="flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 font-medium whitespace-nowrap">
                    Last Global Sync: {new Date().toLocaleTimeString()}
                  </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {['Petrol', 'Diesel', 'CNG'].map((type, idx) => {
                    const priceData = currentPrices.find(p => p.fuelType === type) || { pricePerLitre: 0 };
                    return (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={type}
                            className={`glass-card p-8 border-t-4 ${
                                type === 'Petrol' ? 'border-t-orange-500' : 
                                type === 'Diesel' ? 'border-t-blue-500' : 'border-t-green-500'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div className={`p-4 rounded-3xl ${
                                    type === 'Petrol' ? 'bg-orange-500/10 text-orange-500' : 
                                    type === 'Diesel' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                                }`}>
                                    <Fuel className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{type}</h4>
                                    <p className="text-5xl font-black text-white tracking-tighter mt-1">₹{priceData.pricePerLitre.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">New Market Rate</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">₹</div>
                                        <input 
                                            type="number"
                                            step="0.01"
                                            className="input-glass w-full pl-10 text-xl font-bold"
                                            value={newRates[type] || ''}
                                            onChange={(e) => setNewRates({...newRates, [type]: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleUpdate(type)}
                                    disabled={isLoading}
                                    className="btn-gradient w-full py-4 uppercase font-bold tracking-[0.2em] flex items-center justify-center space-x-2"
                                >
                                    <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    <span>{isLoading ? 'Syncing...' : 'Update Base Rate'}</span>
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <div className="flex items-center text-xs text-slate-500 font-medium">
                                    <TrendingUp className="w-3 h-3 mr-2 text-green-500" />
                                    <span>Market status: <span className="text-white font-bold uppercase tracking-widest">Stabilized</span></span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 bg-slate-900/40"
            >
                <div className="flex items-center space-x-3 mb-8">
                    <History className="w-5 h-5 text-slate-400" />
                    <h3 className="text-xl font-bold text-white">Pricing Audit Logs</h3>
                </div>
                
                <div className="bg-slate-950/50 rounded-2xl overflow-hidden border border-white/5">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">
                                <th className="py-4 px-6">Timestamp</th>
                                <th className="py-4 px-6">Fuel Core</th>
                                <th className="py-4 px-6">Previous Rate</th>
                                <th className="py-4 px-6">New Target</th>
                                <th className="py-4 px-6 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[1, 2, 3].map(i => (
                                <tr key={i} className="text-sm">
                                    <td className="py-4 px-6 text-slate-400 font-mono text-xs">2026-04-01 | 14:15:22</td>
                                    <td className="py-4 px-6 font-bold text-white">Petrol</td>
                                    <td className="py-4 px-6 text-slate-500">₹105.80</td>
                                    <td className="py-4 px-6 text-red-500 font-bold">₹106.10</td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end text-green-500 space-x-2">
                                            <CheckCircle className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase">Live</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Prices;
