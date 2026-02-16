require('dotenv').config();
const { upload } = require('./src/config/cloudinary');

console.log('=== Debugging Upload Configuration ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Check Condition:', process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here');

// Check what storage is being used
const isUsingCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';
console.log('Using Cloudinary:', isUsingCloudinary ? '✅ Yes' : '❌ No, using local storage');

// Check the upload object
console.log('Upload Object Keys:', Object.keys(upload));
console.log('Resume Upload:', upload.resume ? '✅ Exists' : '❌ Missing');
console.log('Logo Upload:', upload.logo ? '✅ Exists' : '❌ Missing');

// Check if CloudinaryStorage is working
if (isUsingCloudinary) {
  console.log('✅ CloudinaryStorage should be used');
  console.log('📁 Files should go to: internship-portal folder');
} else {
  console.log('❌ Local storage is being used');
  console.log('📁 Files will go to: uploads/ folder');
}
