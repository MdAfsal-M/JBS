const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Custom validation for MongoDB ObjectId
const isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

// Custom validation for phone numbers
const isValidPhoneNumber = (value) => {
  // Basic phone number validation (can be customized based on requirements)
  return /^[\+]?[1-9][\d]{0,15}$/.test(value);
};

// Custom validation for price ranges
const isValidPriceRange = (min, max) => {
  return min >= 0 && max >= min;
};

// Custom validation for date ranges
const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Sanitize search query
const sanitizeSearchQuery = (query) => {
  if (typeof query !== 'string') return '';
  return query.trim().replace(/[<>]/g, '');
};

// Validate pagination parameters
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    return false;
  }
  
  return { page: pageNum, limit: limitNum };
};

module.exports = {
  handleValidationErrors,
  isValidObjectId,
  isValidPhoneNumber,
  isValidPriceRange,
  isValidDateRange,
  sanitizeSearchQuery,
  validatePagination
};
