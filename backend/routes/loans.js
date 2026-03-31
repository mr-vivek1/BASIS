const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { readData, writeData } = require('../utils/persistentStore');
const { sendSMS } = require('../utils/smsService');


const isDBConnected = () => mongoose.connection.readyState === 1;
const getModel = () => require('../models/LoanCredit');

// @route   GET api/loans
router.get('/', auth, async (req, res) => {
  if (!isDBConnected()) {
    const loans = readData('loans');
    return res.json([...loans].sort((a, b) => new Date(b.date) - new Date(a.date)));
  }
  try {
    const LoanCredit = getModel();
    const records = await LoanCredit.find().sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/loans
router.post('/', auth, async (req, res) => {
  const { partyName, phoneNumber, type, amount, dueDate, notes } = req.body;

  if (!isDBConnected()) {
    const loans = readData('loans');
    const record = {
      _id: `file-loan-${Date.now()}`,
      date: new Date(),
      partyName, phoneNumber, type,
      amount: parseFloat(amount),
      dueDate: dueDate || null,
      balance: parseFloat(amount),
      amountPaid: 0,
      status: 'Pending',
      notes
    };
    loans.push(record);
    writeData('loans', loans);
    
    if (phoneNumber) {
      sendSMS(phoneNumber, `NSS Petrol Bunk: New ${type} recorded for ₹${amount}. Balance: ₹${amount}. Date: ${new Date().toLocaleDateString()}`);
    }
    
    return res.json(record);
  }

  try {
    const LoanCredit = getModel();
    const newRecord = new LoanCredit({
      partyName, phoneNumber, type, amount, dueDate, balance: amount, notes
    });
    await newRecord.save();
    
    if (phoneNumber) {
      sendSMS(phoneNumber, `NSS Petrol Bunk: New ${type} recorded for ₹${amount}. Balance: ₹${amount}. Due: ${dueDate || 'N/A'}`);
    }
    
    res.json(newRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// @route   PUT api/loans/:id/payment
router.put('/:id/payment', auth, async (req, res) => {
  const { paymentAmount } = req.body;

  if (!isDBConnected()) {
    const loans = readData('loans');
    const record = loans.find(r => r._id === req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });
    record.amountPaid += parseFloat(paymentAmount);
    record.balance = record.amount - record.amountPaid;
    if (record.balance <= 0) { record.status = 'Cleared'; record.balance = 0; }
    else if (record.amountPaid > 0) { record.status = 'Partial'; }
    writeData('loans', loans);
    return res.json(record);
  }

  try {
    const LoanCredit = getModel();
    const record = await LoanCredit.findById(req.params.id);
    if (!record) return res.status(404).json({ msg: 'Record not found' });
    record.amountPaid += parseFloat(paymentAmount);
    record.balance = record.amount - record.amountPaid;
    if (record.balance <= 0) { record.status = 'Cleared'; record.balance = 0; }
    else if (record.amountPaid > 0) { record.status = 'Partial'; }
    await record.save();
    
    if (record.phoneNumber) {
      sendSMS(record.phoneNumber, `NSS Petrol Bunk: Received payment of ₹${paymentAmount}. Current balance: ₹${record.balance}. Thank you!`);
    }
    
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

module.exports = router;

