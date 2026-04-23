// new comment
// test commit 
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  description: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  deadline: { type: Date, required: true },
  pricePerUnit: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'allocating', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);