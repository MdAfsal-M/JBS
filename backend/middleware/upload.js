const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only allow 1 file per request
  }
});

// Middleware for business license upload
const uploadBusinessLicense = upload.single('businessLicense');

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size too large. Maximum size is 10MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Only one file is allowed.',
        code: 'TOO_MANY_FILES'
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      code: 'UPLOAD_ERROR'
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
};

// Cloudinary configuration (if available)
const configureCloudinary = () => {
  try {
    const cloudinary = require('cloudinary').v2;
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    return cloudinary;
  } catch (error) {
    console.warn('Cloudinary not configured. File uploads will be stored locally.');
    return null;
  }
};

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'business_licenses') => {
  const cloudinary = configureCloudinary();
  
  if (!cloudinary) {
    return null;
  }
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    // Delete local file after upload
    fs.unlinkSync(filePath);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

// Middleware to process uploaded file
const processUploadedFile = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  try {
    // Try to upload to Cloudinary first
    const cloudinaryResult = await uploadToCloudinary(req.file.path);
    
    if (cloudinaryResult) {
      // File uploaded to Cloudinary
      req.file.cloudinary = cloudinaryResult;
      req.file.url = cloudinaryResult.url;
    } else {
      // Store file locally
      req.file.url = `/uploads/${req.file.filename}`;
    }
    
    next();
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({
      message: 'Error processing uploaded file',
      code: 'FILE_PROCESSING_ERROR'
    });
  }
};

// Middleware to serve uploaded files
const serveUploadedFile = (req, res) => {
  const filePath = path.join(__dirname, '..', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      message: 'File not found',
      code: 'FILE_NOT_FOUND'
    });
  }
};

// Clean up old files (run periodically)
const cleanupOldFiles = async (maxAge = 24 * 60 * 60 * 1000) => { // 24 hours
  const uploadDir = path.join(__dirname, '..', 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    return;
  }
  
  try {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
};

module.exports = {
  uploadBusinessLicense,
  handleUploadError,
  processUploadedFile,
  serveUploadedFile,
  cleanupOldFiles,
  upload
};
