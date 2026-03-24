import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  Settings, 
  User as UserIcon, 
  IndianRupee, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Construction,
  Plus,
  ArrowRight
} from 'lucide-react';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [formData, setFormData] = useState({
        pumpId: '',
        description: '',
        cost: '',
        vendor: '',
        status: 'Pending'
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/maintenance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/maintenance`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRecords();
            setFormData({
                pumpId: '',
                description: '',
                cost: '',
                vendor: '',
                status: 'Pending'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/maintenance/${id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRecords();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-4 md:p-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                      <Settings className="w-8 h-8 text-yellow-500 mr-3" />
                      Maintenance Logs
                   </h2>
                   <p className="text-slate-400 mt-1">Lifecycle management for terminal hardware</p>
                </div>
                <div className="flex space-x-4">
                    <div className="glass-card px-4 py-2 flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Efficiency</span>
                        <span className="text-green-500 font-bold">94.2%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Log Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="glass-card p-6 border-l-4 border-l-yellow-500">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                           <Plus className="w-5 h-5 mr-2 text-yellow-500" />
                           Create Service Log
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Asset ID / Name</label>
                                <input 
                                    type="text" 
                                    className="input-glass w-full" 
                                    value={formData.pumpId}
                                    onChange={(e) => setFormData({...formData, pumpId: e.target.value})}
                                    placeholder="e.g. Terminal-1-Pump"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Work Description</label>
                                <textarea 
                                    className="input-glass w-full text-sm" 
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Detail the failure or preventive measures..."
                                    required
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Cost (₹)</label>
                                    <input 
                                        type="number" 
                                        className="input-glass w-full" 
                                        value={formData.cost}
                                        onChange={(e) => setFormData({...formData, cost: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Priority</label>
                                    <select 
                                        className="input-glass w-full appearance-none cursor-pointer"
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option>Pending</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Vendor/Agency</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        type="text" 
                                        className="input-glass w-full pl-12" 
                                        value={formData.vendor}
                                        onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                                        placeholder="Service provider name"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/10 transition-all flex items-center justify-center space-x-2"
                            >
                                <span>{isLoading ? 'Storing Log...' : 'Submit Log'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6 border border-white/5 flex items-center justify-center p-8 border-dashed">
                       <p className="text-slate-500 text-sm text-center">Optional: Attachment Upload Protocol coming in next release.</p>
                    </div>
                </motion.div>

                {/* Status Timeline */}
                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="lg:col-span-2 space-y-4"
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center px-2">
                       <Clock className="w-5 h-5 mr-2 text-slate-400" />
                       Incident Timeline
                    </h3>
                    
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {records.map((record) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={record._id} 
                                    className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden"
                                >
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                                record.status === 'Completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                                record.status === 'In Progress' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                                'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}>
                                                {record.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : 
                                                 record.status === 'In Progress' ? <Construction className="w-3 h-3" /> : 
                                                 <AlertCircle className="w-3 h-3" />}
                                                <span>{record.status}</span>
                                            </span>
                                            <span className="text-slate-500 text-xs font-mono">{new Date(record.date).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-white">{record.pumpId}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{record.description}</p>
                                        <div className="flex items-center space-x-4 pt-2">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Vendor: {record.vendor || 'In-House'}</span>
                                            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Ticket: #{record._id.slice(-6)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center p-6 bg-white/[0.03] rounded-2xl md:min-w-[180px]">
                                        <div className="text-2xl font-bold text-white mb-2">₹{record.cost.toLocaleString()}</div>
                                        <AnimatePresence>
                                            {record.status !== 'Completed' && (
                                                <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => updateStatus(record._id, 'Completed')}
                                                    className="bg-green-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg shadow-green-500/20"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Resolve</span>
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {records.length === 0 && (
                            <div className="glass-card py-20 text-center">
                                <Wrench className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">No service records detected in the primary logs.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Maintenance;
