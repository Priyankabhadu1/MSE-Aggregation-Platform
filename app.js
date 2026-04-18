require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('express-flash');
const methodOverride = require('method-override');
const path = require('path');

// Import all routes
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mseRoutes = require('./routes/mseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ──── View engine ────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ──── Middleware ────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));          // for PUT/DELETE in forms
app.use(express.static(path.join(__dirname, 'public'))); // CSS, images etc.

// ──── Session (using connect-mongo with your existing DB) ────
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/mse_platform',
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// ──── Flash messages ────
app.use(flash());

// ──── Make user & flash messages available in all views ────
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// ──── Routes ────
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/mse', mseRoutes);

// ──── Health check (for Docker / Jenkins) ────
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// ──── 404 handler ────
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

// ──── Connect to MongoDB & start server ────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mse_platform1234')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;