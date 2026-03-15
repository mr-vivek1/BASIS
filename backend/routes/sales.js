const express = require('express');
const router = express.Router();
const DailySales = require('../models/DailySales');
const auth = require('../middleware/auth');

// @route   GET api/sales
// @desc    Get sales by date
router.get('/', auth, async (req, res) => {
  const { date } = req.query;
  try {
    let query = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const sales = await DailySales.find(query).populate('recordedBy', 'name');
    res.json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/sales
// @desc    Add new sales entry
router.post('/', auth, async (req, res) => {
  const { pumpId, fuelType, openingStock, closingStock, pricePerLitre } = req.body;
  
  try {
    const salesLitres = openingStock - closingStock;
    const totalRevenue = salesLitres * pricePerLitre;

    const newSales = new DailySales({
      pumpId,
      fuelType,
      openingStock,
      closingStock,
      salesLitres,
      pricePerLitre,
      totalRevenue,
      recordedBy: req.user.id
    });

    const sales = await newSales.save();
    res.json(sales);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
