const express = require('express');
const router = express.Router();
const FuelPrice = require('../models/FuelPrice');
const auth = require('../middleware/auth');

// @route   GET api/prices/current
// @desc    Get current fuel prices
router.get('/current', auth, async (req, res) => {
  try {
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
// @desc    Update fuel price
router.post('/', auth, async (req, res) => {
  const { fuelType, pricePerLitre } = req.body;
  try {
    const newPrice = new FuelPrice({
      fuelType,
      pricePerLitre,
      updatedBy: req.user.id
    });
    await newPrice.save();
    res.json(newPrice);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
