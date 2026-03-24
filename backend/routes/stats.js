const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { readData } = require('../utils/persistentStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

router.get('/today', auth, async (req, res) => {
  if (!isDBConnected()) {
    const sales = readData('sales');
    const maintenance = readData('maintenance');
    const loans = readData('loans');

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(s => new Date(s.date).toISOString().split('T')[0] === todayStr);
    
    const totalRevenue = todaysSales.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalLitres = todaysSales.reduce((sum, item) => sum + item.salesLitres, 0);
    const pendingMaintenance = maintenance.filter(m => m.status === 'Pending').length;
    const outstandingLoans = loans.filter(l => l.status !== 'Cleared').reduce((sum, item) => sum + item.balance, 0);

    // Fuel breakdown
    const fuelBreakdown = ['Petrol', 'Diesel', 'CNG'].map(type => {
      const typeSales = todaysSales.filter(s => s.fuelType === type);
      return {
        type,
        revenue: typeSales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
        volume: typeSales.reduce((sum, s) => sum + (s.salesLitres || 0), 0)
      };
    });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRevenue = sales
        .filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr)
        .reduce((sum, item) => sum + item.totalRevenue, 0);
      chartData.push({ name: d.toLocaleDateString([], { weekday: 'short' }), revenue: dayRevenue });
    }

    return res.json({ 
        totalRevenue, 
        totalLitres, 
        pendingMaintenance, 
        outstandingLoans, 
        chartData,
        fuelBreakdown 
    });
  }

  try {
    const DailySales = require('../models/DailySales');
    const Maintenance = require('../models/Maintenance');
    const LoanCredit = require('../models/LoanCredit');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sales = await DailySales.find({ date: { $gte: today, $lt: tomorrow } });
    const totalRevenue = sales.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalLitres = sales.reduce((sum, item) => sum + item.salesLitres, 0);
    const pendingMaintenance = await Maintenance.countDocuments({ status: 'Pending' });
    const loans = await LoanCredit.find({ status: { $ne: 'Cleared' } });
    const outstandingLoans = loans.reduce((sum, item) => sum + item.balance, 0);

    const fuelBreakdown = ['Petrol', 'Diesel', 'CNG'].map(type => {
      const typeSales = sales.filter(s => s.fuelType === type);
      return {
        type,
        revenue: typeSales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
        volume: typeSales.reduce((sum, s) => sum + (s.salesLitres || 0), 0)
      };
    });

    const pastWeek = new Date();
    pastWeek.setDate(pastWeek.getDate() - 7);
    const weeklySales = await DailySales.find({ date: { $gte: pastWeek } });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRevenue = weeklySales
        .filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr)
        .reduce((sum, item) => sum + item.totalRevenue, 0);
      chartData.push({ name: d.toLocaleDateString([], { weekday: 'short' }), revenue: dayRevenue });
    }

    res.json({ totalRevenue, totalLitres, pendingMaintenance, outstandingLoans, chartData, fuelBreakdown });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;


