const express = require('express');
const router = express.Router();
const LoanCredit = require('../models/LoanCredit');
const auth = require('../middleware/auth');

// @route   GET api/loans
// @desc    Get all loan/credit records
router.get('/', auth, async (req, res) => {
  try {
    const records = await LoanCredit.find().sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans
// @desc    Add new loan/credit entry
router.post('/', auth, async (req, res) => {
  const { partyName, type, amount, dueDate, notes } = req.body;
  try {
    const newRecord = new LoanCredit({
      partyName,
      type,
      amount,
      dueDate,
      balance: amount,
      notes
    });
    await newRecord.save();
    res.json(newRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/loans/:id/payment
// @desc    Record a payment
router.put('/:id/payment', auth, async (req, res) => {
  const { paymentAmount } = req.body;
  try {
    const record = await LoanCredit.findById(req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });

    record.amountPaid += parseFloat(paymentAmount);
    record.balance = record.amount - record.amountPaid;
    
    if (record.balance <= 0) {
      record.status = 'Cleared';
      record.balance = 0;
    } else if (record.amountPaid > 0) {
      record.status = 'Partial';
    }

    await record.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
