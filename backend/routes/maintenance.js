const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/auth');

// @route   GET api/maintenance
// @desc    Get all maintenance records
router.get('/', auth, async (req, res) => {
  try {
    const records = await Maintenance.find().sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/maintenance
// @desc    Log new maintenance work
router.post('/', auth, async (req, res) => {
  const { pumpId, description, cost, vendor, status } = req.body;
  try {
    const newRecord = new Maintenance({
      pumpId,
      description,
      cost,
      vendor,
      status
    });
    const record = await newRecord.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/maintenance/:id
// @desc    Update maintenance record status
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
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
