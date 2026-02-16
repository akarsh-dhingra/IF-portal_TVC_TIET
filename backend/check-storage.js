require('dotenv').config();
const { upload } = require('./src/config/cloudinary');

console.log('=== Upload Configuration Check ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Check Condition:', process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here');

// Check what storage is being used
const isUsingCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';
console.log('Using Cloudinary:', isUsingCloudinary ? '✅ Yes' : '❌ No, using local storage');

if (isUsingCloudinary) {
  console.log('✅ New uploads will go to Cloudinary');
  console.log('📁 Cloudinary Folder: internship-portal');
  console.log('🌐 Cloud Name: dgwll3dwe');
} else {
  console.log('❌ New uploads will go to local storage');
  console.log('📁 Local Folder: uploads/');
}
