const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authenticateToken, requireOwner } = require('../middleware/auth');

const router = express.Router();

// Get all products for owner
router.get('/', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category, 
      brand, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      stockStatus
    } = req.query;

    const skip = (page - 1) * limit;
    let query = { owner: req.user.id, isActive: true };

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (stockStatus) {
      if (stockStatus === 'out-of-stock') query.stock = 0;
      else if (stockStatus === 'low-stock') query.stock = { $lte: 5, $gt: 0 };
      else if (stockStatus === 'in-stock') query.stock = { $gt: 5 };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/', authenticateToken, requireOwner, [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Name is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('brand').optional().trim(),
  body('subcategory').optional().trim(),
  body('originalPrice').optional().isFloat({ min: 0 }),
  body('currency').optional().isIn(['INR', 'USD', 'EUR']),
  body('minStock').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active', 'inactive', 'draft', 'out-of-stock']),
  body('listingStatus').optional().isIn(['active', 'inactive', 'pending']),
  body('fulfillmentType').optional().isIn(['self', 'amazon', 'third-party'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const productData = {
      ...req.body,
      owner: req.user.id
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', authenticateToken, requireOwner, [
  body('name').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('brand').optional().trim(),
  body('subcategory').optional().trim(),
  body('originalPrice').optional().isFloat({ min: 0 }),
  body('currency').optional().isIn(['INR', 'USD', 'EUR']),
  body('minStock').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['active', 'inactive', 'draft', 'out-of-stock']),
  body('listingStatus').optional().isIn(['active', 'inactive', 'pending']),
  body('fulfillmentType').optional().isIn(['self', 'amazon', 'third-party'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireOwner, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product stock
router.put('/:id/stock', authenticateToken, requireOwner, [
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('minStock').optional().isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = req.body.stock;
    if (req.body.minStock !== undefined) {
      product.minStock = req.body.minStock;
    }

    await product.save();

    res.json({
      message: 'Product stock updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product analytics
router.get('/:id/analytics', authenticateToken, requireOwner, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, owner: req.user.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get orders for this product
    const orders = await Order.find({
      'items.product': req.params.id,
      seller: req.user.id
    }).populate('customer', 'profile.firstName profile.lastName');

    const totalSales = orders.reduce((sum, order) => {
      const item = order.items.find(item => item.product.toString() === req.params.id);
      return sum + (item ? item.quantity : 0);
    }, 0);

    const totalRevenue = orders.reduce((sum, order) => {
      const item = order.items.find(item => item.product.toString() === req.params.id);
      return sum + (item ? item.total : 0);
    }, 0);

    const analytics = {
      totalViews: product.views,
      totalSales: totalSales,
      totalRevenue: totalRevenue,
      averageRating: product.ratings.average,
      ratingCount: product.ratings.count,
      stockStatus: product.stockStatus,
      isOnSale: product.isOnSale,
      discountPercentage: product.discountPercentage,
      recentOrders: orders.slice(0, 5)
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock products
router.get('/low-stock/list', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({
      owner: req.user.id,
      stock: { $lte: 5 },
      isActive: true
    })
    .sort({ stock: 1 })
    .limit(parseInt(limit));

    res.json(products);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update products
router.put('/bulk/update', authenticateToken, requireOwner, [
  body('productIds').isArray().withMessage('Product IDs array is required'),
  body('updates').isObject().withMessage('Updates object is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { productIds, updates } = req.body;

    const result = await Product.updateMany(
      { _id: { $in: productIds }, owner: req.user.id },
      updates
    );

    res.json({
      message: `${result.modifiedCount} products updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
