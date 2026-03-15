import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Loans = () => {
    const [records, setRecords] = useState([]);
    const [formData, setFormData] = useState({
        partyName: '',
        type: 'Loan Given',
        amount: '',
        dueDate: '',
        notes: ''
    });
    const [paymentAmount, setPaymentAmount] = useState({});

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/loans`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecords(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/loans`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLoans();
            setFormData({ partyName: '', type: 'Loan Given', amount: '', dueDate: '', notes: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handlePayment = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/loans/${id}/payment`, { paymentAmount: paymentAmount[id] }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLoans();
            setPaymentAmount({ ...paymentAmount, [id]: '' });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Loan & Credit Management</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="card h-fit">
                    <h3 className="font-bold mb-4">Add New Record</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400">Party Name</label>
                            <input 
                                type="text" 
                                className="input-field w-full mt-1" 
                                value={formData.partyName}
                                onChange={(e) => setFormData({...formData, partyName: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Type</label>
                            <select 
                                className="input-field w-full mt-1"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                            >
                                <option>Loan Given</option>
                                <option>Credit Taken</option>
                                <option>Advance</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400">Amount (₹)</label>
                                <input 
                                    type="number" 
                                    className="input-field w-full mt-1" 
                                    value={formData.amount}
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400">Due Date</label>
                                <input 
                                    type="date" 
                                    className="input-field w-full mt-1" 
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400">Notes</label>
                            <textarea 
                                className="input-field w-full mt-1" 
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn-primary w-full py-2">
                            Add Entry
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="card lg:col-span-2">
                    <h3 className="font-bold mb-4">Outstanding Balances</h3>
                    <div className="space-y-4">
                        {records.map((record) => (
                            <div key={record._id} className="bg-primary/50 p-4 rounded-lg border border-gray-800">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold">{record.partyName}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                            record.type === 'Loan Given' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                                        }`}>
                                            {record.type}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold">₹{record.balance.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">Balance / Total: ₹{record.amount}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between gap-4 mt-4 pt-4 border-t border-gray-800/50">
                                    <div className="text-xs text-gray-400">
                                        {record.dueDate && <div>Due Date: {new Date(record.dueDate).toLocaleDateString()}</div>}
                                        <div>Notes: {record.notes || 'None'}</div>
                                    </div>
                                    {record.status !== 'Cleared' && (
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                className="input-field py-1 px-2 text-xs w-24" 
                                                placeholder="Amount"
                                                value={paymentAmount[record._id] || ''}
                                                onChange={(e) => setPaymentAmount({...paymentAmount, [record._id]: e.target.value})}
                                            />
                                            <button 
                                                onClick={() => handlePayment(record._id)}
                                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
                                            >
                                                Pay
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loans;
