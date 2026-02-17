const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  getAllRoles,
  applyJob,
  getApplications,
  getProfile,
  updateProfile,
  uploadResume
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/tempUpload');

// Apply protect middleware to all routes
router.use(protect);

// Public resume upload route (only requires authentication, not STUDENT role)
router.post('/resume', upload.single('resume'), uploadResume);

// All other routes require STUDENT role
router.use(authorize('STUDENT'));

router.get('/companies', getCompanies);
router.get('/company/:id', getCompany);
router.get('/roles', getAllRoles);
//router.post('/apply', (req, res, next) => { req.uploadDir = 'uploads/application'; next(); }, upload.single('resume'), applyJob);
router.post('/apply', applyJob);
router.get('/applications', getApplications);
router.get('/profile', getProfile);
router.put('/profile', upload.single('resume'), updateProfile); // Optional resume update in profile?

module.exports = router;
