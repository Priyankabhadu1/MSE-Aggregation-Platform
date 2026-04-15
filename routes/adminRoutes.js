const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const adminController = require('../controllers/adminController');

// All admin routes require login + admin role
router.use(isLoggedIn, roleCheck('admin'));

router.get('/dashboard', adminController.dashboard);
router.get('/orders/create', adminController.createOrderForm);
router.post('/orders', adminController.createOrder);
router.get('/orders', adminController.listOrders);
router.get('/selections/pending', adminController.pendingSelections);
router.put('/selections/:id/approve', adminController.approveSelection);
router.put('/selections/:id/reject', adminController.rejectSelection);
router.get('/mse/pending', adminController.pendingMSEs);
router.put('/mse/:id/approve', adminController.approveMSE);
router.get('/ratings/:selectionId', adminController.showRatingForm);
router.post('/ratings', adminController.submitRating);

module.exports = router;