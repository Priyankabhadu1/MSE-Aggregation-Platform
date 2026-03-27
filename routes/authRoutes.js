const express = require('express');
const router = express.Router();
const { showLogin, login, showRegister, register, logout } = require('../controllers/authController');

router.get('/login', showLogin);
router.post('/login', login);
router.get('/register', showRegister);
router.post('/register', register);
router.get('/logout', logout);

module.exports = router;