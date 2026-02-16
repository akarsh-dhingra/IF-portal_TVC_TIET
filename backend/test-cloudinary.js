require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

console.log('=== Cloudinary Configuration Check ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');

// Test Cloudinary connection
cloudinary.api.ping((error, result) => {
  if (error) {
    console.log('❌ Cloudinary Connection Error:', error.message);
  } else {
    console.log('✅ Cloudinary Connected Successfully!');
    console.log('Account Info:', result);
  }
});
