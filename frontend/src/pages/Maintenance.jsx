import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Maintenance = () => {
    const [records, setRecords] = useState([]);
    const [formData, setFormData] = useState({
        pumpId: 'Pump-1',
        description: '',
        cost: '',
        vendor: '',
        status: 'Pending'
    });

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
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/maintenance`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRecords();
            setFormData({
                pumpId: 'Pump-1',
                description: '',
                cost: '',
                vendor: '',
                status: 'Pending'
            });
        } catch (err) {
            console.error(err);
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
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Maintenance Logs</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="card">
                    <h3 className="font-bold mb-4">Log Repair/Service</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400">Pump/Equipment</label>
                            <input 
                                type="text" 
                                className="input-field w-full mt-1" 
                                value={formData.pumpId}
                                onChange={(e) => setFormData({...formData, pumpId: e.target.value})}
                                placeholder="e.g. Pump-1, Generator"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Description</label>
                            <textarea 
                                className="input-field w-full mt-1" 
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                required
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400">Cost (₹)</label>
                                <input 
                                    type="number" 
                                    className="input-field w-full mt-1" 
                                    value={formData.cost}
                                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400">Status</label>
                                <select 
                                    className="input-field w-full mt-1"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option>Pending</option>
                                    <option>In Progress</option>
                                    <option>Completed</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Vendor/Mechanic</label>
                            <input 
                                type="text" 
                                className="input-field w-full mt-1" 
                                value={formData.vendor}
                                onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full py-2">
                            Add Log
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="card lg:col-span-2">
                    <h3 className="font-bold mb-4">Maintenance History</h3>
                    <div className="space-y-4">
                        {records.map((record) => (
                            <div key={record._id} className="bg-primary/50 p-4 rounded-lg border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            record.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                                            record.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                            {record.status}
                                        </span>
                                        <span className="text-gray-400 text-xs">{new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold">{record.pumpId}</h4>
                                    <p className="text-gray-400 text-sm">{record.description}</p>
                                    <p className="text-xs text-gray-500 mt-1">Vendor: {record.vendor || 'N/A'}</p>
                                </div>
                                <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                                    <span className="text-xl font-bold">₹{record.cost}</span>
                                    <div className="flex gap-2">
                                        {record.status !== 'Completed' && (
                                            <button 
                                                onClick={() => updateStatus(record._id, 'Completed')}
                                                className="text-[10px] bg-green-600 px-2 py-1 rounded"
                                            >
                                                Mark Done
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {records.length === 0 && (
                            <p className="text-center text-gray-500 py-8">No maintenance records yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Maintenance;
