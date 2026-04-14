const User = require('../models/User');
const bcrypt = require('bcryptjs');

const showLogin = (req, res) => {
  res.render('login', { error: req.query.error || null });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.redirect('/auth/login?error=Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/auth/login?error=Invalid credentials');

    if (user.role === 'mse' && !user.isApproved) {
      return res.redirect('/auth/login?error=Your account is pending admin approval');
    }

    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    res.redirect('/mse/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/auth/login?error=Server error');
  }
};

const showRegister = (req, res) => {
  res.render('register', { error: req.query.error || null });
};

const register = async (req, res) => {
  const { email, password, name, businessName, registrationId } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ email }, { registrationId }] });
    if (existing) return res.redirect('/auth/register?error=Email or Registration ID already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashed,
      role: 'mse',
      name,
      businessName,
      registrationId,
      isApproved: false
    });
    await user.save();
    res.redirect('/auth/login?msg=Registration successful. Wait for admin approval.');
  } catch (err) {
    console.error(err);
    res.redirect('/auth/register?error=Registration failed');
  }
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
};

module.exports = { showLogin, login, showRegister, register, logout };