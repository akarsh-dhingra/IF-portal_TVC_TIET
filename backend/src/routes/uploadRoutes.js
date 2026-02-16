const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const Student = require('../models/Student');
const Company = require('../models/Company');
const { protect } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure local multer storage (temporary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      cb(null, 'uploads/temp/');
    } else if (file.fieldname === 'logo') {
      cb(null, 'uploads/temp/');
    } else {
      cb(null, 'uploads/temp/');
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    cb(null, `${file.fieldname}-${timestamp}-${random}${path.extname(file.originalname)}`);
  },
});

// File filter for resumes
const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
  }
};

// File filter for logos
const logoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for logos'), false);
  }
};

// Upload configurations
const uploadResume = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: resumeFilter,
});

const uploadLogo = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: logoFilter,
});

// Ensure temp directory exists
const tempDir = 'uploads/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Upload resume for student
router.post('/resume', protect, uploadResume.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded' });
    }

    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(403).json({ message: 'Only students can upload resumes' });
    }

    // Upload to Cloudinary with resource_type: "raw" for PDF
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        resource_type: "raw",          // 🔴 REQUIRED for PDF
        folder: "internship-portal",   // 📁 folder name
        public_id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      }
    );

    console.log("Cloudinary Upload Success:", result.secure_url);

    // Delete local temp file after upload
    fs.unlinkSync(req.file.path);

    // Update student record with Cloudinary URL
    student.resumeUrl = result.secure_url;
    await student.save();

    res.status(200).json({
      message: 'Resume uploaded successfully',
      resumeUrl: student.resumeUrl,
      publicId: result.public_id,
      isCloudinary: true
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up temp file if upload failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error uploading resume to Cloudinary',
      error: error.message 
    });
  }
});

// Upload logo for company
router.post('/logo', protect, uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No logo file uploaded' });
    }

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only companies can upload logos' });
    }

    // Upload to Cloudinary for images (no resource_type needed for images)
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "internship-portal",   // 📁 folder name
        public_id: `logo-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        format: 'webp' // Convert to webp for better performance
      }
    );

    console.log("Cloudinary Logo Upload Success:", result.secure_url);

    // Delete local temp file after upload
    fs.unlinkSync(req.file.path);

    // Update company record with Cloudinary URL
    company.logo = result.secure_url;
    await company.save();

    res.status(200).json({
      message: 'Logo uploaded successfully',
      logoUrl: company.logo,
      publicId: result.public_id,
      isCloudinary: true
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    
    // Clean up temp file if upload failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error uploading logo to Cloudinary',
      error: error.message 
    });
  }
});

// Delete resume
router.delete('/resume', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(403).json({ message: 'Only students can delete resumes' });
    }

    if (!student.resumeUrl) {
      return res.status(400).json({ message: 'No resume to delete' });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (student.resumeUrl.includes('cloudinary')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = student.resumeUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `internship-portal/${fileName.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        console.log('Deleted from Cloudinary:', publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    // Update student record
    student.resumeUrl = '';
    await student.save();

    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Resume deletion error:', error);
    res.status(500).json({ message: 'Error deleting resume' });
  }
});

// Delete logo
router.delete('/logo', protect, async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return res.status(403).json({ message: 'Only companies can delete logos' });
    }

    if (!company.logo) {
      return res.status(400).json({ message: 'No logo to delete' });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (company.logo.includes('cloudinary')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = company.logo.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `internship-portal/${fileName.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log('Deleted from Cloudinary:', publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
      }
    }

    // Update company record
    company.logo = '';
    await company.save();

    res.status(200).json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Logo deletion error:', error);
    res.status(500).json({ message: 'Error deleting logo' });
  }
});

module.exports = router;
