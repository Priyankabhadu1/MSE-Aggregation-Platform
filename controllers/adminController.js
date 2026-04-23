const Order = require('../models/Order');
const Selection = require('../models/Selection');
const User = require('../models/User');
const Rating = require('../models/Rating');

// Dashboard
const dashboard = async (req, res) => {
  const orders = await Order.find().sort('-createdAt');
  const pendingSelections = await Selection.find({ status: 'pending' }).populate('orderId mseId');
  const pendingMSEs = await User.find({ role: 'mse', isApproved: false });
  const completedSelections = await Selection.find({ status: 'completed' }).populate('orderId mseId');
  res.render('admin/dashboard', { orders, pendingSelections, pendingMSEs, completedSelections });
};

// Create order form
const createOrderForm = (req, res) => {
  res.render('admin/orders/create');
};

// Create order
const createOrder = async (req, res) => {
  const { description, totalQuantity, deadline, pricePerUnit } = req.body;
  try {
    const order = new Order({
      description,
      totalQuantity,
      deadline,
      pricePerUnit,
      createdBy: req.session.user.id,
      status: 'open'
    });
    await order.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/orders/create?error=Failed to create order');
  }
};

// List all orders
const listOrders = async (req, res) => {
  const orders = await Order.find().populate('createdBy');
  res.render('admin/orders/list', { orders });
};

// Pending selections approval page
const pendingSelections = async (req, res) => {
  const selections = await Selection.find({ status: 'pending' }).populate('orderId mseId');
  res.render('admin/selections/pending', { selections });
};

// Approve selection
const approveSelection = async (req, res) => {
  const { id } = req.params;
  try {
    const selection = await Selection.findById(id).populate('orderId');
    if (!selection) return res.redirect('/admin/selections/pending?error=Selection not found');

    // Check total approved quantity does not exceed order total
    const approvedSelections = await Selection.find({ orderId: selection.orderId._id, status: 'approved' });
    const totalApproved = approvedSelections.reduce((sum, s) => sum + s.selectedQuantity, 0);
    if (totalApproved + selection.selectedQuantity > selection.orderId.totalQuantity) {
      return res.redirect('/admin/selections/pending?error=Total approved quantity would exceed order limit');
    }

    selection.status = 'approved';
    selection.adminApprovedAt = new Date();
    await selection.save();
    res.redirect('/admin/selections/pending');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/selections/pending?error=Failed to approve');
  }
};

// Reject selection
const rejectSelection = async (req, res) => {
  const { id } = req.params;
  await Selection.findByIdAndUpdate(id, { status: 'rejected' });
  res.redirect('/admin/selections/pending');
};

// Pending MSEs approval page
const pendingMSEs = async (req, res) => {
  const mses = await User.find({ role: 'mse', isApproved: false });
  res.render('admin/mse/pending', { mses });
};

// Approve MSE registration
const approveMSE = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, { isApproved: true });
  res.redirect('/admin/mse/pending');
};

// Show rating form for a completed selection
const showRatingForm = async (req, res) => {
  const { selectionId } = req.params;
  const selection = await Selection.findById(selectionId).populate('orderId mseId');
  if (!selection || selection.status !== 'completed') {
    return res.redirect('/admin/dashboard?error=Invalid selection');
  }
  res.render('admin/ratings/create', { selection });
};

// Submit rating
const submitRating = async (req, res) => {
  const { selectionId, timelinessScore, qualityScore, communicationScore, comment } = req.body;
  try {
    const selection = await Selection.findById(selectionId);
    if (!selection) return res.redirect('/admin/dashboard?error=Selection not found');

    const existing = await Rating.findOne({ orderId: selection.orderId, mseId: selection.mseId });
    if (existing) return res.redirect('/admin/dashboard?error=Rating already given');

    const rating = new Rating({
      orderId: selection.orderId,
      mseId: selection.mseId,
      adminId: req.session.user.id,
      timelinessScore,
      qualityScore,
      communicationScore,
      comment
    });
    await rating.save();
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect('/admin/dashboard?error=Failed to submit rating');
  }
};

module.exports = {
  dashboard,
  createOrderForm,
  createOrder,
  listOrders,
  pendingSelections,
  approveSelection,
  rejectSelection,
  pendingMSEs,
  approveMSE,
  showRatingForm,
  submitRating
};