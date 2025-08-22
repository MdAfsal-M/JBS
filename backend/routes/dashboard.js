const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Mock analytics data - replace with actual database queries
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
          type: 'user',
          description: 'New user registration',
          user: 'Jane Smith',
          date: new Date()
        },
        {
          id: 3,
          type: 'order',
          description: 'Order cancelled by customer',
          amount: 200,
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
router.get('/quick-stats', authenticateToken, async (req, res) => {
  try {
    const stats = {
      todayRevenue: 2500,
      todayOrders: 25,
      pendingOrders: 12,
      newCustomers: 8,
      lowStockItems: 5,
      totalProducts: 89
    };

    res.json(stats);
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = [
      {
        id: 1,
        type: 'order',
        title: 'New Order Received',
        message: 'You have received a new order #12345',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: 'Product A is running low on stock',
        timestamp: new Date(),
        read: false
      },
      {
        id: 3,
        type: 'user',
        title: 'New Customer',
        message: 'John Doe has registered as a new customer',
        timestamp: new Date(),
        read: true
      }
    ];

    res.json(notifications);
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    // In a real app, you'd update the notification in the database
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
