const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const { roleCheck, mseApproved } = require('../middleware/roleCheck');
const mseController = require('../controllers/mseController');

router.use(isLoggedIn, roleCheck('mse'), mseApproved);

router.get('/dashboard', mseController.dashboard);
router.get('/orders/open', mseController.openOrders);
router.post('/selections', mseController.selectPortion);
router.get('/selections/my', mseController.mySelections);
router.put('/selections/:id/complete', mseController.completeSelection);
router.get('/ratings', mseController.myRatings);

module.exports = router;