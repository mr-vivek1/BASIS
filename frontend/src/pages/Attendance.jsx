import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState([]);
    const [todayRecord, setTodayRecord] = useState(null);
    const [shiftType, setShiftType] = useState('Morning');

    const fetchAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/attendance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendance(res.data);
            
            // Find today's record for current user
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
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/attendance/checkin`, { shiftType }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendance();
        } catch (err) {
            alert(err.response?.data?.msg || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/attendance/checkout/${todayRecord._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAttendance();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Staff Attendance</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Check-in/out Action */}
                <div className="card h-fit">
                    <h3 className="font-bold mb-4">Daily Clock-In</h3>
                    {!todayRecord ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Select Shift</label>
                                <select 
                                    className="input-field w-full"
                                    value={shiftType}
                                    onChange={(e) => setShiftType(e.target.value)}
                                >
                                    <option>Morning</option>
                                    <option>Evening</option>
                                    <option>Night</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleCheckIn}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-xl"
                            >
                                CHECK IN
                            </button>
                            <p className="text-center text-xs text-gray-400">Time will be recorded as: {new Date().toLocaleTimeString()}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg text-center">
                                <p className="text-green-500 font-bold">Checked In: {new Date(todayRecord.checkIn).toLocaleTimeString()}</p>
                                <p className="text-xs text-gray-400 mt-1">Shift: {todayRecord.shiftType}</p>
                            </div>
                            {!todayRecord.checkOut ? (
                                <button 
                                    onClick={handleCheckOut}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-xl"
                                >
                                    CHECK OUT
                                </button>
                            ) : (
                                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-center">
                                    <p className="text-blue-500 font-bold">Checked Out: {new Date(todayRecord.checkOut).toLocaleTimeString()}</p>
                                    <p className="text-xs text-blue-400 mt-1">Hours Worked: {todayRecord.hoursWorked} hrs</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Status Table */}
                <div className="card lg:col-span-2">
                    <h3 className="font-bold mb-4">Today's Attendance List</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-800">
                                    <th className="py-2 px-2">Staff Name</th>
                                    <th className="py-2 px-2">Shift</th>
                                    <th className="py-2 px-2">Check In</th>
                                    <th className="py-2 px-2">Check Out</th>
                                    <th className="py-2 px-2">Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => (
                                    <tr key={record._id} className="border-b border-gray-800/50">
                                        <td className="py-3 px-2">
                                            <div className="font-medium">{record.staffId?.name}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{record.staffId?.role}</div>
                                        </td>
                                        <td className="py-3 px-2">{record.shiftType}</td>
                                        <td className="py-3 px-2 text-green-400">{new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                        <td className="py-3 px-2 text-red-400">{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</td>
                                        <td className="py-3 px-2 font-bold">{record.hoursWorked || '0.00'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
