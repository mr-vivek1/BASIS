const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { readData, writeData } = require('../utils/persistentStore');

const isDBConnected = () => mongoose.connection.readyState === 1;
const getModel = () => require('../models/DailySales');

// @route   GET api/sales
router.get('/', auth, async (req, res) => {
  const { date } = req.query;

  if (!isDBConnected()) {
    let results = readData('sales');
    if (date) {
      const dateStr = new Date(date).toISOString().split('T')[0];
      results = results.filter(r => new Date(r.date).toISOString().split('T')[0] === dateStr);
    }
    return res.json(results);
  }

  try {
    const DailySales = getModel();
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
router.post('/', auth, async (req, res) => {
  let { pumpId, fuelType, openingStock, closingStock, pricePerLitre } = req.body;
  
  // Coerce to numbers
  openingStock = parseFloat(openingStock);
  closingStock = parseFloat(closingStock);
  pricePerLitre = parseFloat(pricePerLitre);
  
  const salesLitres = openingStock - closingStock;
  const totalRevenue = salesLitres * pricePerLitre;

  if (!isDBConnected()) {
    const sales = readData('sales');
    const tanks = readData('tanks');
    
    // Find right tank by fuel type
    const tank = tanks.find(t => t.fuelType === fuelType);
    if (tank) {
        tank.currentVolume = Math.max(0, tank.currentVolume - salesLitres);
    }
    
    const record = {
      _id: `file-sale-${Date.now()}`,
      date: new Date(),
      pumpId, fuelType, openingStock, closingStock,
      salesLitres: parseFloat(salesLitres.toFixed(2)),
      pricePerLitre, 
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      recordedBy: { _id: req.user.id || 'admin-fallback', name: 'Main Admin' }
    };
    sales.push(record);
    writeData('sales', sales);
    writeData('tanks', tanks);
    return res.json(record);
  }

  try {
    const DailySales = getModel();
    const Tank = require('../models/Tank');
    
    const newSales = new DailySales({
      pumpId, fuelType, openingStock, closingStock,
      salesLitres, pricePerLitre, totalRevenue, recordedBy: req.user.id
    });
    
    const tank = await Tank.findOne({ fuelType });
    if (tank) {
        tank.currentVolume = Math.max(0, tank.currentVolume - salesLitres);
        await tank.save();
    }
    
    const savedSale = await newSales.save();
    res.json(savedSale);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
