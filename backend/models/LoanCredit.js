const mongoose = require('mongoose');

const LoanCreditSchema = new mongoose.Schema({
  partyName: { type: String, required: true },
  phoneNumber: { type: String },
  type: { type: String, enum: ['Loan Given', 'Credit Taken', 'Advance'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Partial', 'Cleared'], default: 'Pending' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LoanCredit', LoanCreditSchema);
