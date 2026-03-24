import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Droplets,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Tanks = () => {
    const [tanks, setTanks] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        tankName: '',
        fuelType: 'Petrol',
        capacity: '',
        currentVolume: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchTanks = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/tanks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTanks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTanks();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/tanks`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTanks();
            setIsAdding(false);
            setFormData({ tankName: '', fuelType: 'Petrol', capacity: '', currentVolume: '' });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/tanks/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTanks();
            setEditingId(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this storage terminal?")) return;
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/api/tanks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTanks();
        } catch (err) {
            console.error(err);
        }
    };

    const startEditing = (tank) => {
        setEditingId(tank._id);
        setFormData({
            tankName: tank.tankName,
            fuelType: tank.fuelType,
            capacity: tank.capacity,
            currentVolume: tank.currentVolume
        });
    };

    return (
        <div className="p-4 md:p-10 space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                        <Database className="w-8 h-8 text-green-500 mr-3" />
                        Storage Terminal Management
                    </h2>
                    <p className="text-slate-400 mt-1">Configure bulk tanks and calibrate manual volumes</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-gradient px-6 py-3 flex items-center space-x-2 text-sm uppercase tracking-widest font-bold"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{isAdding ? 'Cancel' : 'Add New Tank'}</span>
                </button>
            </header>

            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-card p-8 border-l-4 border-l-green-500 max-w-2xl"
                    >
                        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Terminal Name</label>
                                <input 
                                    name="tankName"
                                    value={formData.tankName}
                                    onChange={handleChange}
                                    className="input-glass w-full"
                                    placeholder="e.g. Tank-Alpha"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Fuel Type</label>
                                <select 
                                    name="fuelType"
                                    value={formData.fuelType}
                                    onChange={handleChange}
                                    className="input-glass w-full"
                                >
                                    <option>Petrol</option>
                                    <option>Diesel</option>
                                    <option>CNG</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Max Capacity (L)</label>
                                <input 
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="input-glass w-full"
                                    placeholder="20000"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Initial Level (L)</label>
                                <input 
                                    name="currentVolume"
                                    type="number"
                                    value={formData.currentVolume}
                                    onChange={handleChange}
                                    className="input-glass w-full"
                                    placeholder="8000"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button type="submit" disabled={isLoading} className="btn-gradient w-full py-4 uppercase font-bold tracking-[0.2em]">
                                    {isLoading ? 'Registering...' : 'Initialize Storage Unit'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tanks.map(tank => (
                    <motion.div 
                        layout
                        key={tank._id}
                        className="glass-card p-6 overflow-hidden relative group"
                    >
                        {editingId === tank._id ? (
                            <div className="space-y-4 relative z-10">
                                <input 
                                    name="tankName"
                                    value={formData.tankName}
                                    onChange={handleChange}
                                    className="input-glass w-full text-lg font-bold"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        name="capacity"
                                        type="number"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="input-glass w-full text-sm"
                                        placeholder="Max"
                                    />
                                    <input 
                                        name="currentVolume"
                                        type="number"
                                        value={formData.currentVolume}
                                        onChange={handleChange}
                                        className="input-glass w-full text-sm"
                                        placeholder="Current"
                                    />
                                </div>
                                <div className="flex space-x-2 pt-2">
                                    <button 
                                        onClick={() => handleUpdate(tank._id)}
                                        className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center"
                                    >
                                        <Save className="w-3 h-3 mr-1" /> SAVE
                                    </button>
                                    <button 
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3 mr-1" /> CANCEL
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-0 right-0 p-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button onClick={() => startEditing(tank)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(tank._id)} className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className={`p-3 rounded-2xl bg-${tank.fuelType === 'Petrol' ? 'orange' : tank.fuelType === 'Diesel' ? 'blue' : 'green'}-500/10`}>
                                            <Droplets className={`w-5 h-5 ${tank.fuelType === 'Petrol' ? 'text-orange-500' : tank.fuelType === 'Diesel' ? 'text-blue-500' : 'text-green-500'}`} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white">{tank.tankName}</h4>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tank.fuelType} Storage</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Efficiency Level</span>
                                            <span className="text-xl font-black text-white">{((tank.currentVolume / tank.capacity) * 100).toFixed(1)}%</span>
                                        </div>
                                        
                                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
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

                                        <div className="flex justify-between text-sm">
                                            <div className="text-left">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Current Fuel</p>
                                                <p className="font-bold text-white tracking-tight">{tank.currentVolume.toLocaleString()} L</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">Total Cap.</p>
                                                <p className="font-bold text-slate-300 tracking-tight">{tank.capacity.toLocaleString()} L</p>
                                            </div>
                                        </div>

                                        {(tank.currentVolume / tank.capacity) < 0.2 && (
                                            <div className="flex gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl mt-4">
                                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-red-500 uppercase">Warning: Low Threshold</p>
                                                    <p className="text-[10px] text-slate-500">Refill protocol required immediately.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Tanks;
