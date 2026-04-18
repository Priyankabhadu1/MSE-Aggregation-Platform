const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  mseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  selectedQuantity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  completedAt: { type: Date },
  adminApprovedAt: { type: Date }
});

module.exports = mongoose.model('Selection', selectionSchema);