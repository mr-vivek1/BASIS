const mongoose = require('mongoose');

const FuelPriceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG'], required: true },
  pricePerLitre: { type: Number, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FuelPrice', FuelPriceSchema);
