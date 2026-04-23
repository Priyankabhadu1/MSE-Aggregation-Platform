const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect('/auth/login');
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
};

const mseApproved = async (req, res, next) => {
  if (req.session.user.role !== 'mse') return next();
  const User = require('../models/User');
  const user = await User.findById(req.session.user.id);
  if (!user.isApproved) {
    return res.status(403).send('Your account is pending admin approval. Please wait.');
  }
  next();
};

module.exports = { roleCheck, mseApproved };