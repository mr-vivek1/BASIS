import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Timer,
  Fingerprint,
  ChevronRight
} from 'lucide-react';

const Attendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [todayRecord, setTodayRecord] = useState(null);
    const [shiftType, setShiftType] = useState('Morning');
    const [isLoading, setIsLoading] = useState(false);

    const fetchAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const res = await axios.get(`${apiUrl}/api/attendance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(res.data);
            
            const today = new Date().toISOString().split('T')[0];
            const myRecord = res.data.find(r => 
                r.staffId._id === user.id && 
                new Date(r.date).toISOString().split('T')[0] === today
            );
            setTodayRecord(myRecord);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    const handleCheckIn = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await axios.post(`${apiUrl}/api/attendance/checkin`, { shiftType }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendance();
        } catch (err) {
            alert(err.response?.data?.msg || 'Check-in failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || '';
            await axios.put(`${apiUrl}/api/attendance/checkout/${todayRecord._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendance();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-10 space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                   <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                      <Users className="w-8 h-8 text-blue-500 mr-3" />
                      Staff Attendance Protocol
                   </h2>
                   <p className="text-slate-400 mt-1">Biometric-style identity and shift management</p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 px-4 py-2 rounded-2xl flex items-center space-x-3">
                    <Timer className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-300 font-mono font-bold tracking-widest uppercase text-sm">Active Relay</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Check-in/out Action */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4"
                >
                    <div className="glass-card p-8 border-t-4 border-t-blue-500 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 rounded-full"></div>
                        
                        <div className="text-center mb-8 relative z-10">
                            <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                                <Fingerprint className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Shift Authentication</h3>
                            <p className="text-slate-400 text-sm">Secure terminal for Daily Operations Log</p>
                        </div>

                        {!todayRecord ? (
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Select Shift Sector</label>
                                    <div className="grid grid-cols-3 gap-2">
                                       {['Morning', 'Evening', 'Night'].map(type => (
                                         <button
                                            key={type}
                                            onClick={() => setShiftType(type)}
                                            className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                                              shiftType === type 
                                              ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20' 
                                              : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
                                            }`}
                                         >
                                            {type}
                                         </button>
                                       ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleCheckIn}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl shadow-2xl shadow-blue-600/20 transition-all active:scale-95 text-lg flex items-center justify-center space-x-3"
                                >
                                    <span>{isLoading ? 'Authenticating...' : 'INITIALIZE CHECK-IN'}</span>
                                    {!isLoading && <ChevronRight className="w-5 h-5" />}
                                </button>
                                <div className="flex items-center justify-center space-x-2 text-slate-500">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-mono">{new Date().toLocaleTimeString()} (Standard Time)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                <div className="p-6 bg-slate-900/80 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-xs font-bold uppercase text-slate-500">Log Entry</span>
                                        <span className="text-green-500 flex items-center text-xs font-bold">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-slate-400 text-sm">Check-In Time</span>
                                       <span className="text-white font-mono font-bold">{new Date(todayRecord.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-slate-400 text-sm">Shift Sector</span>
                                       <span className="text-blue-500 font-bold uppercase text-xs">{todayRecord.shiftType}</span>
                                    </div>
                                </div>

                                {!todayRecord.checkOut ? (
                                    <button 
                                        onClick={handleCheckOut}
                                        disabled={isLoading}
                                        className="w-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold py-5 rounded-2xl transition-all active:scale-95 text-lg flex items-center justify-center space-x-3"
                                    >
                                        <span>TERMINATE SHIFT</span>
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400 text-sm">Departure</span>
                                            <span className="text-white font-mono font-bold">{new Date(todayRecord.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="pt-4 border-t border-green-500/20 flex justify-between items-center">
                                            <span className="text-xs font-bold text-green-500/70 uppercase">Total Efficiency</span>
                                            <span className="text-2xl font-black text-green-500">{todayRecord.hoursWorked} hrs</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Status Table */}
                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="lg:col-span-8 glass-card overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                        <h3 className="text-xl font-bold text-white flex items-center">
                           <MapPin className="w-5 h-5 mr-2 text-slate-400" />
                           Personnel Status Relays
                        </h3>
                        <div className="flex items-center space-x-2 text-blue-500 text-sm font-bold">
                           <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                           <span>LIVE MONITOR</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-[0.15em] font-bold">
                                    <th className="py-5 px-6">Personnel</th>
                                    <th className="py-5 px-6">Sector</th>
                                    <th className="py-5 px-6">Initialization</th>
                                    <th className="py-5 px-6">Termination</th>
                                    <th className="py-5 px-6 text-right">Cycle Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {attendance.map((record) => (
                                    <motion.tr 
                                       layout
                                       key={record._id} 
                                       className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="py-5 px-6">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center mr-4 group-hover:border-blue-500/30 transition-all">
                                                   <span className="text-lg font-bold text-blue-500">{record.staffId?.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                   <div className="font-bold text-white leading-tight">{record.staffId?.name}</div>
                                                   <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{record.staffId?.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                           <span className="text-xs font-bold text-slate-300 uppercase bg-slate-800/50 px-3 py-1 rounded-lg border border-white/5">
                                              {record.shiftType}
                                           </span>
                                        </td>
                                        <td className="py-5 px-6 font-mono text-green-400 text-sm">
                                           {new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </td>
                                        <td className="py-5 px-6 font-mono text-slate-500 text-sm">
                                           {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'ACTIVE...'}
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                           <span className="text-lg font-bold text-white font-mono">
                                              {record.hoursWorked ? `${record.hoursWorked} h` : '--'}
                                           </span>
                                        </td>
                                    </motion.tr>
                                ))}
                                {attendance.length === 0 && (
                                    <tr>
                                       <td colSpan="5" className="py-20 text-center">
                                          <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                          <p className="text-slate-500 font-medium">No personnel detected in the current relay cycle.</p>
                                       </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-slate-900/30 border-t border-white/5 text-center">
                        <button className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all">Download Operational Payload (.PDF)</button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Attendance;
