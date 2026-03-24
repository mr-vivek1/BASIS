const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { readData, writeData } = require('../utils/persistentStore');

const isDBConnected = () => mongoose.connection.readyState === 1;

// @route   GET api/prices/current
router.get('/current', auth, async (req, res) => {
  if (!isDBConnected()) {
    const prices = readData('prices');
    if (prices.length === 0) {
      // Return default fuel prices when DB is down and no file exists
      return res.json([
        { _id: 'default-petrol', fuelType: 'Petrol', pricePerLitre: 106.10, date: new Date() },
        { _id: 'default-diesel', fuelType: 'Diesel', pricePerLitre: 92.27, date: new Date() },
        { _id: 'default-cng', fuelType: 'CNG', pricePerLitre: 76.59, date: new Date() }
      ]);
    }
    // Return latest price for each type
    const latest = ['Petrol', 'Diesel', 'CNG'].map(type => 
      prices.filter(p => p.fuelType === type).sort((a,b) => new Date(b.date) - new Date(a.date))[0]
    ).filter(p => p !== undefined);
    return res.json(latest);
  }

  try {
    const FuelPrice = require('../models/FuelPrice');
    const types = ['Petrol', 'Diesel', 'CNG'];
    const prices = await Promise.all(types.map(async (type) => {
      return await FuelPrice.findOne({ fuelType: type }).sort({ date: -1 });
    }));
    res.json(prices.filter(p => p !== null));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/prices
router.post('/', auth, async (req, res) => {
  const { fuelType, pricePerLitre } = req.body;

  if (!isDBConnected()) {
    const prices = readData('prices');
    const record = {
      _id: `file-price-${Date.now()}`,
      fuelType, pricePerLitre, date: new Date(),
      updatedBy: req.user.id
    };
    prices.push(record);
    writeData('prices', prices);
    return res.json(record);
  }

  try {
    const FuelPrice = require('../models/FuelPrice');
    const newPrice = new FuelPrice({ fuelType, pricePerLitre, updatedBy: req.user.id });
    await newPrice.save();
    res.json(newPrice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

