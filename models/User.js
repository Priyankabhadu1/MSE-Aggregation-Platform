const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true
  },
  password: {
  type: String
  },
  googleId: {
  type: String
  },
  avatar: {
  type: String,
  default: ''
  },
  createdAt: {
  type: Date,
  default: Date.now
  }
});

const bcrypt = require('bcryptjs');

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};
module.exports = mongoose.model('User', userSchema);