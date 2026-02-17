
//backend/src/routes/companyRoutes.js

const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getApplicants,
  updateApplicationStatus,
  getProfile,
  updateProfile,
  uploadLogo,
  deleteLogo,
  getDashboardAnalytics
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/tempUpload');

// All routes protected and for companies only
router.use(protect);
router.use(authorize('COMPANY'));

// Dashboard Analytics
router.get('/dashboard', getDashboardAnalytics);

// Company Profile
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Company Logo
router.post(
  '/logo',
  (req, res, next) => {
    upload.single('logo')(req, res, function (err) {
      if (err) {
        console.error('🔥 Multer Error:', err.message);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  },
  uploadLogo
);

router.delete('/logo', deleteLogo);

// Job/Internship Roles
router.route('/jobs')
  .post(createJob)
  .get(getJobs);

router.route('/jobs/:id')
  .put(updateJob)
  .delete(deleteJob);

// Applicants
router.get('/applicants', getApplicants);
router.put('/applicant/:id/status', updateApplicationStatus);

module.exports = router;
