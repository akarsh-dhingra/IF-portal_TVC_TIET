const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Company = require('../models/Company');
const Role = require('../models/Role');
const Application = require('../models/Application');
const { cloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Helper to get company ID for the logged in user
const getCompanyId = async (userId) => {
  const company = await Company.findOne({ userId });
  if (!company) console.warn('[DEBUG] No company found for userId:', userId);
  return company ? company._id : null;
};


// ================= JOBS =================

const createJob = asyncHandler(async (req, res) => {
  console.log('[DEBUG] createJob HIT:', req.body);
  const companyId = await getCompanyId(req.user.id);

  if (!companyId) {
    console.warn('[DEBUG] Company profile NOT FOUND for user:', req.user.id);
    res.status(404);
    throw new Error('Company profile not found');
  }

  const { title, description, stipend, eligibility, currency } = req.body;

  try {
    const role = await Role.create({
      companyId,
      title,
      description,
      stipend,
      eligibility,
      currency: currency || 'INR'
    });
    console.log('[DEBUG] Role created successfully:', role._id);
    res.status(201).json(role);
  } catch (error) {
    console.error('[DEBUG] Role creation FAILED:', error.message);
    res.status(400);
    throw error;
  }
});


const getJobs = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req.user.id);
  if (!companyId) return res.json([]);
  const roles = await Role.find({ companyId });
  res.json(roles);
});

const updateJob = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    res.status(404);
    throw new Error('Job not found');
  }

  const companyId = await getCompanyId(req.user.id);
  if (role.companyId.toString() !== companyId.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  Object.assign(role, req.body);
  await role.save();
  res.json(role);
});

const deleteJob = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    res.status(404);
    throw new Error('Job not found');
  }

  const companyId = await getCompanyId(req.user.id);
  if (role.companyId.toString() !== companyId.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await role.deleteOne();
  res.json({ message: 'Job removed' });
});

// ================= APPLICANTS =================

const getApplicants = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req.user.id);
  if (!companyId) return res.json({ success: true, data: [] });

  const applications = await Application.find({ companyId })
    .populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'name email' }
    })
    .populate('roleId');

  res.json({ success: true, data: applications });
});



const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('roleId');
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  const companyId = await getCompanyId(req.user.id);
  if (application.roleId.companyId.toString() !== companyId.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  application.status = req.body.status.toUpperCase();
  await application.save();
  res.json({ success: true, data: application });
});

// ================= PROFILE =================

const getProfile = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ userId: req.user.id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }
  res.json({ success: true, data: company });
});

const updateProfile = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ userId: req.user.id });
  if (!company) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  // Handle flat to nested mapping for address
  if (req.body.address) {
    company.address = { ...company.address, ...req.body.address };
  } else if (req.body.location || req.body.city) {
    company.address = { ...company.address, city: req.body.location || req.body.city };
  }

  // Handle name aliases
  company.name = req.body.name || company.name;
  company.description = req.body.description || req.body.about || company.description;
  company.website = req.body.website || company.website;
  company.contactEmail = req.body.contactEmail || req.body.email || company.contactEmail;
  company.contactPhone = req.body.contactPhone || req.body.phone || company.contactPhone;

  await company.save();
  res.json({ success: true, data: company });
});

// ================= LOGO UPLOAD =================

const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No logo file received'
    });
  }

  try {
    let company = await Company.findOne({ userId: req.user.id });

    if (!company) {
      company = await Company.create({
        userId: req.user.id,
        name: 'My Company',
        description: 'Company profile',
        website: 'https://example.com'
      });
    }

    // Delete old logo if exists
    if (company.logo && company.logo.includes('cloudinary')) {
      // Extract public_id from Cloudinary URL
      const urlParts = company.logo.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = `internship-portal/${fileName.split('.')[0]}`;
      await deleteFromCloudinary(publicId, 'image');
    }

    // Upload new logo to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'internship-portal',
      format: 'webp',
      use_filename: true,
      unique_filename: true,
    });

    // Cleanup local temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    company.logo = result.secure_url;
    await company.save();

    res.status(200).json({
      success: true,
      logoUrl: company.logo,
      filePath: company.logo
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    // Cleanup local temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
});

const deleteLogo = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ userId: req.user.id });
  if (!company || !company.logo) {
    res.status(400);
    throw new Error('No logo to delete');
  }

  if (company.logo.includes('cloudinary')) {
    const urlParts = company.logo.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const publicId = `internship-portal/${fileName.split('.')[0]}`;
    await deleteFromCloudinary(publicId, 'image');
  }

  company.logo = '';
  await company.save();

  res.json({ success: true });
});

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const companyId = await getCompanyId(req.user.id);
  if (!companyId) {
    return res.status(404).json({ message: 'Company not found' });
  }

  // 1. Stats
  const activeRolesCount = await Role.countDocuments({ companyId });
  const totalApplications = await Application.countDocuments({ companyId });
  const pendingApplications = await Application.countDocuments({ companyId, status: 'PENDING' });
  const acceptedApplications = await Application.countDocuments({ companyId, status: 'ACCEPTED' });

  // 2. Role Performance (Top roles by applications)
  const applications = await Application.find({ companyId }).populate('roleId', 'title');
  const roleMap = {};
  applications.forEach(app => {
    const title = app.roleId?.title || 'Unknown Role';
    roleMap[title] = (roleMap[title] || 0) + 1;
  });

  const rolePerformance = Object.keys(roleMap).map(role => ({
    role,
    applications: roleMap[role]
  })).sort((a, b) => b.applications - a.applications).slice(0, 5);

  // 3. Applications over time (Last 4 weeks)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const applicationsOverTime = await Application.aggregate([
    { $match: { companyId, createdAt: { $gte: fourWeeksAgo } } },
    {
      $group: {
        _id: { $ceil: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60 * 24 * 7] } },
        count: { $sum: 1 },
        accepted: { $sum: { $cond: [{ $eq: ["$status", "ACCEPTED"] }, 1, 0] } }
      }
    },
    { $sort: { "_id": -1 } }
  ]);

  // Map to "Week 4", "Week 3", etc. where Week 4 is the most recent
  const weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  const applicationsData = [1, 2, 3, 4].map(w => {
    const found = applicationsOverTime.find(item => item._id === (5 - w));
    return {
      week: weekLabels[w - 1],
      applications: found ? found.count : 0,
      accepted: found ? found.accepted : 0
    };
  });

  res.json({
    success: true,
    data: {
      stats: [
        { label: "Active Roles", value: activeRolesCount },
        { label: "Total Applications", value: totalApplications },
        { label: "Pending Review", value: pendingApplications },
        { label: "Accepted", value: acceptedApplications },
      ],
      rolePerformance,
      applicationsData
    }
  });
});



module.exports = {
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
};
