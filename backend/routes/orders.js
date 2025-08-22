const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { authenticateToken, requireOwner } = require('../middleware/auth');

const router = express.Router();

// Get all orders for owner
router.get('/', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      paymentStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { seller: req.user.id, isActive: true };

    // Apply filters
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('customer', 'profile.firstName profile.lastName email')
      .populate('items.product', 'name price images')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, seller: req.user.id })
      .populate('customer', 'profile.firstName profile.lastName email phone')
      .populate('items.product', 'name price images description');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, requireOwner, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
  body('trackingUpdate').optional().isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const order = await Order.findOne({ _id: req.params.id, seller: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.updateStatus(req.body.status, req.body.trackingUpdate);

    // Create notification for customer
    await Notification.createNotification({
      recipient: order.customer,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order ${order.orderId} status has been updated to ${req.body.status}`,
      data: {
        orderId: order.orderId,
        status: req.body.status
      }
    });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment status
router.put('/:id/payment-status', authenticateToken, requireOwner, [
  body('paymentStatus').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const order = await Order.findOne({ _id: req.params.id, seller: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = req.body.paymentStatus;
    await order.save();

    res.json({
      message: 'Payment status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add tracking information
router.put('/:id/tracking', authenticateToken, requireOwner, [
  body('trackingNumber').trim().isLength({ min: 1 }).withMessage('Tracking number is required'),
  body('carrier').trim().isLength({ min: 1 }).withMessage('Carrier is required'),
  body('status').trim().isLength({ min: 1 }).withMessage('Status is required'),
  body('description').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const order = await Order.findOne({ _id: req.params.id, seller: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.tracking.number = req.body.trackingNumber;
    order.tracking.carrier = req.body.carrier;
    order.tracking.status = req.body.status;
    
    order.tracking.updates.push({
      status: req.body.status,
      location: req.body.location || '',
      description: req.body.description || 'Tracking information updated',
      timestamp: new Date()
    });

    await order.save();

    res.json({
      message: 'Tracking information updated successfully',
      order
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order analytics
router.get('/analytics', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({
      seller: req.user.id,
      createdAt: { $gte: startDate },
      isActive: true
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const statusCounts = {};
    const paymentStatusCounts = {};

    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      paymentStatusCounts[order.paymentStatus] = (paymentStatusCounts[order.paymentStatus] || 0) + 1;
    });

    const analytics = {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
      statusBreakdown: statusCounts,
      paymentStatusBreakdown: paymentStatusCounts,
      recentOrders: orders.slice(0, 5)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics
router.get('/stats', authenticateToken, requireOwner, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      seller: req.user.id,
      createdAt: { $gte: today },
      isActive: true
    });

    const pendingOrders = await Order.countDocuments({
      seller: req.user.id,
      status: 'pending',
      isActive: true
    });

    const processingOrders = await Order.countDocuments({
      seller: req.user.id,
      status: 'processing',
      isActive: true
    });

    const shippedOrders = await Order.countDocuments({
      seller: req.user.id,
      status: 'shipped',
      isActive: true
    });

    const stats = {
      todayOrders,
      pendingOrders,
      processingOrders,
      shippedOrders
    };

    res.json(stats);
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order
router.put('/:id/cancel', authenticateToken, requireOwner, [
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, seller: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    order.notes.internal = req.body.reason || 'Order cancelled by seller';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Create notification for customer
    await Notification.createNotification({
      recipient: order.customer,
      type: 'order',
      title: 'Order Cancelled',
      message: `Your order ${order.orderId} has been cancelled`,
      data: {
        orderId: order.orderId,
        status: 'cancelled'
      }
    });

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
