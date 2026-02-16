const multer = require('multer');
const path = require('path');

// Local storage configuration (works without Cloudinary)
const storage = multer.diskStorage({
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

// Mock Cloudinary functions for now
const mockCloudinary = {
  config: () => {},
  uploader: {
    destroy: async () => ({ result: 'ok' })
  }
};

module.exports = {
  cloudinary: mockCloudinary,
  storage,
  upload,
  deleteFromCloudinary: async () => true,
};
