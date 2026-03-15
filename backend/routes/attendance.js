const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const auth = require('../middleware/auth');

// @route   GET api/attendance
// @desc    Get attendance for today or specific date
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
    const attendance = await Attendance.find(query).populate('staffId', 'name role');
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/attendance/checkin
// @desc    Staff check-in
router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already checked in today
    let record = await Attendance.findOne({ 
      staffId: req.user.id, 
      date: { $gte: today } 
    });

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
// @desc    Staff check-out
router.put('/checkout/:id', auth, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });

    record.checkOut = new Date();
    
    // Calculate hours worked
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
