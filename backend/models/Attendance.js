const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shiftType: { type: String, enum: ['Morning', 'Evening', 'Night'] },
  checkIn: { type: Date },
  checkOut: { type: Date },
  hoursWorked: { type: Number },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
