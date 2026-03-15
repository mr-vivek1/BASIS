const express = require('express');
const router = express.Router();
const DailySales = require('../models/DailySales');
const Maintenance = require('../models/Maintenance');
const LoanCredit = require('../models/LoanCredit');
const auth = require('../middleware/auth');

router.get('/today', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const sales = await DailySales.find({
            date: { $gte: today, $lt: tomorrow }
        });

        const totalRevenue = sales.reduce((sum, item) => sum + item.totalRevenue, 0);
        const totalLitres = sales.reduce((sum, item) => sum + item.salesLitres, 0);

        const pendingMaintenance = await Maintenance.countDocuments({ status: 'Pending' });
        
        const loans = await LoanCredit.find({ status: { $ne: 'Cleared' } });
        const outstandingLoans = loans.reduce((sum, item) => sum + item.balance, 0);

        // Weekly revenue for chart
        const pastWeek = new Date();
        pastWeek.setDate(pastWeek.getDate() - 7);
        const weeklySales = await DailySales.find({
            date: { $gte: pastWeek }
        });

        // Group by day
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

        res.json({
            totalRevenue,
            totalLitres,
            pendingMaintenance,
            outstandingLoans,
            chartData
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
