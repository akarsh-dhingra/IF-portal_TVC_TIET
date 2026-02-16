const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary (will work when credentials are provided)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
});

// Fallback to local storage if Cloudinary is not configured
const storage = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here'
  ? new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'internship-portal',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        public_id: (req, file) => {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 15);
          return `${file.fieldname}-${timestamp}-${random}`;
        },
      },
    })
  : multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === 'resume') {
          cb(null, 'uploads/resumes/');
        } else if (file.fieldname === 'logo') {
          cb(null, 'uploads/logos/');
        } else {
          cb(null, 'uploads/');
        }
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        cb(null, `${file.fieldname}-${timestamp}-${random}${path.extname(file.originalname)}`);
      },
    });

// Upload configuration
const upload = {
  // Resume upload for students
  resume: multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept PDF, DOC, DOCX for resumes
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'), false);
      }
    },
  }),
  // Logo upload for companies
  logo: multer({
    storage: storage,
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images for logos
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for logos'), false);
      }
    },
  }),
};

// Helper function to delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here') {
      await cloudinary.uploader.destroy(publicId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  storage,
  upload,
  deleteFromCloudinary,
};
