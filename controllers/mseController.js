const Order = require('../models/Order');
const Selection = require('../models/Selection');
const Rating = require('../models/Rating');

// MSE Dashboard
const dashboard = async (req, res) => {
  const selections = await Selection.find({ mseId: req.session.user.id }).populate('orderId');
  const ratings = await Rating.find({ mseId: req.session.user.id }).populate('orderId');
  res.render('mse/dashboard', { selections, ratings });
};

// View open orders
const openOrders = async (req, res) => {
  const orders = await Order.find({ status: 'open', deadline: { $gt: new Date() } });
  res.render('mse/orders/open', { orders });
};

// Select a portion of an order
const selectPortion = async (req, res) => {
  const { orderId, selectedQuantity } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'open' || new Date() > order.deadline) {
      return res.redirect('/mse/orders/open?error=Order not available');
    }

    const existing = await Selection.findOne({ orderId, mseId: req.session.user.id });
    if (existing) return res.redirect('/mse/orders/open?error=You already placed a selection for this order');

    const selection = new Selection({
      orderId,
      mseId: req.session.user.id,
      selectedQuantity,
      status: 'pending'
    });
    await selection.save();
    res.redirect('/mse/selections/my');
  } catch (err) {
    console.error(err);
    res.redirect('/mse/orders/open?error=Failed to select');
  }
};

// My selections
const mySelections = async (req, res) => {
  const selections = await Selection.find({ mseId: req.session.user.id }).populate('orderId');
  res.render('mse/selections/my', { selections });
};

// Mark selection as completed
const completeSelection = async (req, res) => {
  const { id } = req.params;
  const selection = await Selection.findOne({ _id: id, mseId: req.session.user.id });
  if (!selection || selection.status !== 'approved') {
    return res.redirect('/mse/selections/my?error=Only approved selections can be completed');
  }
  selection.status = 'completed';
  selection.completedAt = new Date();
  await selection.save();
  res.redirect('/mse/selections/my');
};

// View my ratings
const myRatings = async (req, res) => {
  const ratings = await Rating.find({ mseId: req.session.user.id }).populate('orderId');
  res.render('mse/ratings', { ratings });
};

module.exports = {
  dashboard,
  openOrders,
  selectPortion,
  mySelections,
  completeSelection,
  myRatings
};