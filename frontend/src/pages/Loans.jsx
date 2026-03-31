import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDollarSign, 
  HandCoins, 
  Calendar, 
  Wallet, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  ChevronRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';

const Loans = () => {
    const [records, setRecords] = useState([]);
    const [formData, setFormData] = useState({
        partyName: '',
        phoneNumber: '',
        type: 'Loan Given',
        amount: '',
        dueDate: '',
        notes: ''
    });

    const [paymentAmount, setPaymentAmount] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
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
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await axios.post(`${apiUrl}/api/loans`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLoans();
            setFormData({ partyName: '', phoneNumber: '', type: 'Loan Given', amount: '', dueDate: '', notes: '' });

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
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
        <div className="p-4 md:p-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                      <HandCoins className="w-8 h-8 text-red-500 mr-3" />
                      Financial Exposure & Credit
                   </h2>
                   <p className="text-slate-400 mt-1">Management of liabilities and outstanding customer credit</p>
                </div>
                <div className="glass-card px-6 py-3 flex items-center space-x-6">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Net exposure</p>
                        <p className="text-xl font-black text-red-500">₹{records.reduce((sum, r) => sum + r.balance, 0).toLocaleString()}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Advanced Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4 space-y-6"
                >
                    <div className="glass-card p-6 border-t-4 border-t-red-500">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                           <Plus className="w-5 h-5 mr-2 text-red-500" />
                           Create Credit Entry
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Counterparty Identity</label>
                                <div className="relative">
                                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        type="text" 
                                        className="input-glass w-full pl-12" 
                                        value={formData.partyName}
                                        onChange={(e) => setFormData({...formData, partyName: e.target.value})}
                                        placeholder="Customer or Vendor Name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number (For SMS Notifications)</label>
                                <div className="relative">
                                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    <input 
                                        type="tel" 
                                        className="input-glass w-full pl-12" 
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Transaction Category</label>
                                <select 
                                    className="input-glass w-full appearance-none cursor-pointer"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option>Loan Given</option>
                                    <option>Credit Taken</option>
                                    <option>Advance</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Principal (₹)</label>
                                    <input 
                                        type="number" 
                                        className="input-glass w-full" 
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Due Cycle</label>
                                    <input 
                                        type="date" 
                                        className="input-glass w-full text-xs" 
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Intelligence Notes</label>
                                <textarea 
                                    className="input-glass w-full text-sm" 
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Context for this exposure..."
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-2xl shadow-red-600/20 transition-all flex items-center justify-center space-x-2"
                            >
                                <span>{isLoading ? 'Encrypting Record...' : 'COMMIT TRANSACTION'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6 bg-red-500/5 border-red-500/10 flex items-start space-x-4">
                        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Risk Protocol</p>
                            <p className="text-slate-400 text-xs leading-relaxed">System-wide credit limits are enforced at ₹3,00,000 per party. Exceeding this triggers mandatory admin reconciliation.</p>

                        </div>
                    </div>
                </motion.div>

                {/* Record List */}
                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="lg:col-span-8 space-y-4"
                >
                    <div className="flex items-center justify-between px-2 mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center">
                           <Clock className="w-5 h-5 mr-2 text-slate-400" />
                           Exposure Timeline
                        </h3>
                        <div className="flex space-x-2">
                             <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-900 border border-white/5 py-1 px-3 rounded-full">All Records</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {records.map((record) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={record._id} 
                                    className="glass-card group overflow-hidden"
                                >
                                    <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <h4 className="text-2xl font-bold text-white">{record.partyName}</h4>
                                                <span className={`text-[10px] px-3 py-1 rounded-full uppercase font-black border tracking-tighter ${
                                                    record.type === 'Loan Given' 
                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' 
                                                    : 'bg-purple-500/10 border-purple-500/20 text-purple-500'
                                                }`}>
                                                    {record.type}
                                                </span>
                                                {record.phoneNumber && (
                                                    <span className="text-[10px] text-slate-500 font-bold bg-slate-900/50 border border-white/5 py-1 px-3 rounded-full">
                                                        📞 {record.phoneNumber}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                                <div>
                                                   <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Principal</p>
                                                   <p className="text-white font-bold">₹{record.amount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                   <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Settled</p>
                                                   <p className="text-green-500 font-bold">₹{record.amountPaid.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                   <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
                                                   <span className={`text-xs font-bold ${
                                                       record.status === 'Cleared' ? 'text-green-500' : 'text-red-500 underline decoration-red-500/30 underline-offset-4'
                                                   }`}>
                                                      {record.status}
                                                   </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end justify-center min-w-[200px] bg-slate-900/40 p-6 rounded-2xl border border-white/5 group-hover:bg-slate-900/60 transition-all">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current Balance</p>
                                            <div className="text-3xl font-black text-white tracking-tighter mb-4">₹{record.balance.toLocaleString()}</div>
                                            
                                            {record.status !== 'Cleared' && (
                                                <div className="flex w-full space-x-2">
                                                    <input 
                                                        type="number" 
                                                        className="input-glass py-2 px-3 text-sm flex-1 bg-slate-950" 
                                                        placeholder="Amt"
                                                        value={paymentAmount[record._id] || ''}
                                                        onChange={(e) => setPaymentAmount({...paymentAmount, [record._id]: e.target.value})}
                                                    />
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handlePayment(record._id)}
                                                        className="bg-white text-slate-950 p-2 rounded-xl"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row justify-between items-center group-hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center space-x-4">
                                           <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-medium">
                                              <Calendar className="w-3 h-3" />
                                              <span>DUE: {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'OPEN ENDED'}</span>
                                           </div>
                                           <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                           <div className="text-[10px] text-slate-500 font-medium italic">"{record.notes || 'No operational notes recorded.'}"</div>
                                        </div>
                                        <div className="mt-2 md:mt-0 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">
                                           REF:{record._id.slice(-8)}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {records.length === 0 && (
                            <div className="glass-card py-24 text-center">
                                <Wallet className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-500 font-medium">Clear ledger. No financial liabilities currently detected.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Loans;
