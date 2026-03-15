const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  pumpId: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
  vendor: { type: String },
  status: { type: String, enum: ['Completed', 'Pending', 'In Progress'], default: 'Pending' },
  attachments: [String]
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
