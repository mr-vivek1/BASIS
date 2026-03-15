const mongoose = require('mongoose');

const DailySalesSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  pumpId: { type: String, required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG'], required: true },
  openingStock: { type: Number, required: true },
  closingStock: { type: Number, required: true },
  salesLitres: { type: Number, required: true },
  pricePerLitre: { type: Number, required: true },
  totalRevenue: { type: Number, required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('DailySales', DailySalesSchema);
