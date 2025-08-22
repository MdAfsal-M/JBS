const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { authenticateToken, requireOwner } = require('../middleware/auth');

const router = express.Router();

// Get owner dashboard data
router.get('/dashboard', authenticateToken, requireOwner, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Get counts for dashboard
    const jobCount = await Job.countDocuments({ owner: req.user.id, isActive: true });
    const internshipCount = await Internship.countDocuments({ owner: req.user.id, isActive: true });
    const productCount = await Product.countDocuments({ owner: req.user.id, isActive: true });
    const orderCount = await Order.countDocuments({ seller: req.user.id, isActive: true });
    const pendingApplications = await Application.countDocuments({ 
      $or: [{ job: { $in: await Job.find({ owner: req.user.id }).select('_id') } },
             { internship: { $in: await Internship.find({ owner: req.user.id }).select('_id') } }],
      status: 'pending'
    });

    // Get recent orders
    const recentOrders = await Order.find({ seller: req.user.id })
      .populate('customer', 'profile.firstName profile.lastName email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get low stock products
    const lowStockProducts = await Product.find({
      owner: req.user.id,
      stock: { $lte: 5 },
      isActive: true
    }).limit(5);

    const dashboardData = {
      user: user,
      stats: {
        totalJobs: jobCount,
        totalInternships: internshipCount,
        totalProducts: productCount,
        totalOrders: orderCount,
        pendingApplications: pendingApplications,
        totalRevenue: 125000, // This would be calculated from actual orders
        monthlyGrowth: 15.5
      },
      recentOrders: recentOrders,
      lowStockProducts: lowStockProducts,
      notifications: await Notification.getUnreadCount(req.user.id)
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics data
router.get('/analytics', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get analytics data
    const analytics = {
      overview: {
        totalRevenue: 125000,
        totalOrders: 1234,
        totalCustomers: 567,
        totalProducts: 89,
        monthlyGrowth: 15.5,
        weeklyGrowth: 8.2
      },
      charts: {
        revenueByMonth: [
          { month: 'Jan', revenue: 15000 },
          { month: 'Feb', revenue: 18000 },
          { month: 'Mar', revenue: 22000 },
          { month: 'Apr', revenue: 19000 },
          { month: 'May', revenue: 25000 },
          { month: 'Jun', revenue: 26000 }
        ],
        ordersByStatus: [
          { status: 'completed', count: 800 },
          { status: 'pending', count: 200 },
          { status: 'processing', count: 150 },
          { status: 'cancelled', count: 84 }
        ],
        topProducts: [
          { name: 'Product A', sales: 150, revenue: 7500 },
          { name: 'Product B', sales: 120, revenue: 6000 },
          { name: 'Product C', sales: 100, revenue: 5000 },
          { name: 'Product D', sales: 80, revenue: 4000 }
        ]
      },
      recentActivity: [
        {
          id: 1,
          type: 'order',
          description: 'New order from John Doe',
          amount: 150,
          date: new Date(),
          status: 'completed'
        },
        {
          id: 2,
          type: 'application',
          description: 'New job application',
          applicant: 'Jane Smith',
          date: new Date()
        },
        {
          id: 3,
          type: 'inventory',
          description: 'Low stock alert',
          product: 'Product A',
          date: new Date()
        }
      ]
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quick stats
router.get('/quick-stats', authenticateToken, requireOwner, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      todayRevenue: 2500,
      todayOrders: 25,
      pendingOrders: 12,
      newApplications: 8,
      lowStockItems: 5,
      totalProducts: 89
    };

    res.json(stats);
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update owner business profile
router.put('/business-profile', authenticateToken, requireOwner, [
  body('businessName').optional().trim().isLength({ min: 1 }),
  body('businessType').optional().isIn(['restaurant', 'retail', 'service', 'other']),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);
    
    if (req.body.businessName) user.business.businessName = req.body.businessName;
    if (req.body.businessType) user.business.businessType = req.body.businessType;
    if (req.body.address) {
      user.business.address = { ...user.business.address, ...req.body.address };
    }

    await user.save();
    
    res.json({ 
      message: 'Business profile updated successfully',
      business: user.business 
    });
  } catch (error) {
    console.error('Update business profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for owner to manage)
router.get('/users', authenticateToken, requireOwner, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate user account
router.put('/users/:id/deactivate', authenticateToken, requireOwner, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    let query = { recipient: req.user.id, isActive: true };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, requireOwner, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied' 
      });
    }

    await notification.markAsRead();
    res.json({ 
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, requireOwner, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false, isActive: true },
      { isRead: true, readAt: new Date() }
    );

    res.json({ 
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
