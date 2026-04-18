const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  mseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timelinessScore: { type: Number, min: 1, max: 5, required: true },
  qualityScore: { type: Number, min: 1, max: 5, required: true },
  communicationScore: { type: Number, min: 1, max: 5 },
  overallRating: { type: Number, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

ratingSchema.pre('save', function(next) {
  let scores = [this.timelinessScore, this.qualityScore];
  if (this.communicationScore) scores.push(this.communicationScore);
  this.overallRating = scores.reduce((a,b) => a+b, 0) / scores.length;
  next();
});

module.exports = mongoose.model('Rating', ratingSchema);