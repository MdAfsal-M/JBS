const express = require('express');
const { uploadBusinessLicense, handleUploadError, processUploadedFile, serveUploadedFile } = require('../middleware/upload');
const { authenticateToken, requireOwner } = require('../middleware/auth');

const router = express.Router();

// Upload business license
router.post('/business-license', 
  authenticateToken, 
  requireOwner,
  uploadBusinessLicense,
  handleUploadError,
  processUploadedFile,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded',
          code: 'NO_FILE'
        });
      }

      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: req.file.url,
          cloudinary: req.file.cloudinary
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        message: 'Server error during file upload',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Serve uploaded files
router.get('/files/:filename', serveUploadedFile);

// Delete uploaded file
router.delete('/files/:filename', 
  authenticateToken, 
  requireOwner,
  async (req, res) => {
    try {
      const { filename } = req.params;
      const fs = require('fs');
      const path = require('path');
      
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: 'File deleted successfully'
        });
      } else {
        res.status(404).json({
          message: 'File not found',
          code: 'FILE_NOT_FOUND'
        });
      }
    } catch (error) {
      console.error('File deletion error:', error);
      res.status(500).json({
        message: 'Server error during file deletion',
        code: 'SERVER_ERROR'
      });
    }
  }
);

// Get upload status
router.get('/status', authenticateToken, (req, res) => {
  res.json({
    success: true,
    uploadConfig: {
      maxFileSize: '10MB',
      allowedTypes: ['JPEG', 'PNG', 'PDF'],
      maxFiles: 1
    }
  });
});

module.exports = router;
