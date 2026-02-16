require('dotenv').config();
const { upload } = require('./src/config/cloudinary');
const multer = require('multer');

console.log('=== Testing Cloudinary Upload ===');

// Create a test upload middleware
const testUpload = upload.resume.single('resume');

// Simulate a request object
const mockReq = {
  file: {
    fieldname: 'resume',
    originalname: 'test.pdf',
    mimetype: 'application/pdf',
    buffer: Buffer.from('test content')
  }
};

// Simulate response object
const mockRes = {
  status: (code) => ({
    json: (data) => console.log(`Response ${code}:`, data)
  })
};

// Test the upload
console.log('Testing Cloudinary upload...');

// Since we can't actually test the middleware without a real request,
// let's check if the storage is properly configured
const storage = upload.resume.storage;
console.log('Storage Type:', storage.constructor.name);

if (storage.constructor.name === 'CloudinaryStorage') {
  console.log('✅ CloudinaryStorage is configured correctly');
  console.log('📁 Files should upload to Cloudinary');
} else {
  console.log('❌ Storage is not CloudinaryStorage');
  console.log('📁 Files will upload locally');
}
