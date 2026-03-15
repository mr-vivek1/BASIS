import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/sales`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSales();
      setFormData({ ...formData, openingStock: '', closingStock: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Fuel Sales & Stock</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="card">
          <h3 className="font-bold mb-4">Add Daily Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400">Pump ID</label>
              <select 
                className="input-field w-full mt-1"
                value={formData.pumpId}
                onChange={(e) => setFormData({...formData, pumpId: e.target.value})}
              >
                <option>Pump-1</option>
                <option>Pump-2</option>
                <option>Pump-3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Fuel Type</label>
              <select 
                className="input-field w-full mt-1"
                value={formData.fuelType}
                onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>CNG</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400">Opening (L)</label>
                <input 
                  type="number" 
                  className="input-field w-full mt-1 text-black" 
                  value={formData.openingStock}
                  onChange={(e) => setFormData({...formData, openingStock: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Closing (L)</label>
                <input 
                  type="number" 
                  className="input-field w-full mt-1 text-black" 
                  value={formData.closingStock}
                  onChange={(e) => setFormData({...formData, closingStock: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400">Price per Litre</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-field w-full mt-1 text-black" 
                value={formData.pricePerLitre}
                onChange={(e) => setFormData({...formData, pricePerLitre: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2">
              Save Entry
            </button>
          </form>
        </div>

        {/* Summary Table */}
        <div className="card lg:col-span-2 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Entry Log</h3>
            <input 
              type="date" 
              className="input-field text-sm" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="py-2 px-2">Pump</th>
                <th className="py-2 px-2">Fuel</th>
                <th className="py-2 px-2">Sold (L)</th>
                <th className="py-2 px-2">Price</th>
                <th className="py-2 px-2">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b border-gray-800/50">
                  <td className="py-3 px-2">{sale.pumpId}</td>
                  <td className="py-3 px-2">{sale.fuelType}</td>
                  <td className="py-3 px-2">{sale.salesLitres}</td>
                  <td className="py-3 px-2">₹{sale.pricePerLitre}</td>
                  <td className="py-3 px-2 font-bold text-green-400">₹{sale.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">No records found for this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
