const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login?error=Please login first');
  }
  next();
};

module.exports = { isLoggedIn };