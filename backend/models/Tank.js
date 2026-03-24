const mongoose = require('mongoose');

const TankSchema = new mongoose.Schema({
  tankName: { type: String, required: true, unique: true }, // e.g., Tank-1
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG'], required: true },
  capacity: { type: Number, required: true },
  currentVolume: { type: Number, required: true },
  lastRefilled: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Tank', TankSchema);
