require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('=== Testing Cloudinary v2 Upload ===');

// Test Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Cloudinary v2 configured');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

// Test connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.log('❌ Cloudinary connection failed:', error.message);
  } else {
    console.log('✅ Cloudinary v2 connected successfully!');
    console.log('Ready for PDF uploads with resource_type: "raw"');
  }
});
