const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { readData, writeData } = require('../utils/persistentStore');

const isDBConnected = () => mongoose.connection.readyState === 1;
const getAttendanceModel = () => require('../models/Attendance');

// @route   GET api/attendance
router.get('/', auth, async (req, res) => {
  const { date } = req.query;

  if (!isDBConnected()) {
    let results = readData('attendance');
    if (date) {
      const dateStr = new Date(date).toISOString().split('T')[0];
      results = results.filter(r => new Date(r.date).toISOString().split('T')[0] === dateStr);
    }
    return res.json(results);
  }

  try {
    const Attendance = getAttendanceModel();
    let query = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const attendance = await Attendance.find(query).populate('staffId', 'name role');
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/attendance/checkin
router.post('/checkin', auth, async (req, res) => {
  if (!isDBConnected()) {
    const attendance = readData('attendance');
    const today = new Date().toISOString().split('T')[0];
    const existing = attendance.find(r =>
      r.staffId._id === req.user.id &&
      new Date(r.date).toISOString().split('T')[0] === today
    );
    if (existing) return res.status(400).json({ msg: 'Already checked in today' });

    const record = {
      _id: `file-att-${Date.now()}`,
      date: new Date(),
      staffId: { _id: req.user.id, name: 'Main Admin', role: 'admin' },
      shiftType: req.body.shiftType || 'Morning',
      checkIn: new Date(),
      checkOut: null,
      hoursWorked: null,
      notes: ''
    };
    attendance.push(record);
    writeData('attendance', attendance);
    return res.json(record);
  }

  try {
    const Attendance = getAttendanceModel();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let record = await Attendance.findOne({ staffId: req.user.id, date: { $gte: today } });
    if (record) return res.status(400).json({ msg: 'Already checked in today' });

    record = new Attendance({
      staffId: req.user.id,
      checkIn: new Date(),
      shiftType: req.body.shiftType || 'Morning'
    });

    await record.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/attendance/checkout/:id
router.put('/checkout/:id', auth, async (req, res) => {
  if (!isDBConnected()) {
    const attendance = readData('attendance');
    const record = attendance.find(r => r._id === req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });

    record.checkOut = new Date();
    const diff = new Date(record.checkOut) - new Date(record.checkIn);
    record.hoursWorked = (diff / (1000 * 60 * 60)).toFixed(2);
    writeData('attendance', attendance);
    return res.json(record);
  }

  try {
    const Attendance = getAttendanceModel();
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });

    record.checkOut = new Date();
    const diff = record.checkOut - record.checkIn;
    record.hoursWorked = (diff / (1000 * 60 * 60)).toFixed(2);

    await record.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

