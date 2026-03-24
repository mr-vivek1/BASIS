const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { readData, writeData } = require('../utils/persistentStore');

const isDBConnected = () => mongoose.connection.readyState === 1;
const getModel = () => require('../models/Maintenance');

// @route   GET api/maintenance
router.get('/', auth, async (req, res) => {
  if (!isDBConnected()) {
    const records = readData('maintenance');
    return res.json([...records].sort((a, b) => new Date(b.date) - new Date(a.date)));
  }
  try {
    const Maintenance = getModel();
    const records = await Maintenance.find().sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/maintenance
router.post('/', auth, async (req, res) => {
  const { pumpId, description, cost, vendor, status } = req.body;

  if (!isDBConnected()) {
    const records = readData('maintenance');
    const record = {
      _id: `file-maint-${Date.now()}`,
      date: new Date(),
      pumpId, description, cost: parseFloat(cost), vendor,
      status: status || 'Pending'
    };
    records.push(record);
    writeData('maintenance', records);
    return res.json(record);
  }

  try {
    const Maintenance = getModel();
    const newRecord = new Maintenance({ pumpId, description, cost, vendor, status });
    const record = await newRecord.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/maintenance/:id
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;

  if (!isDBConnected()) {
    const records = readData('maintenance');
    const record = records.find(r => r._id === req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });
    record.status = status;
    writeData('maintenance', records);
    return res.json(record);
  }

  try {
    const Maintenance = getModel();
    const record = await Maintenance.findById(req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });
    record.status = status;
    await record.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

