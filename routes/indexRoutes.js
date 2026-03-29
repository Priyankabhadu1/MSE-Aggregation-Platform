const express = require('express');
const router = express.Router();

// Home page - redirect based on login status
router.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/mse/dashboard');
    }
  }
  res.redirect('/auth/login');
});

module.exports = router;