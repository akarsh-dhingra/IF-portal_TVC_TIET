require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

console.log('=== Checking Recent PDF Uploads ===');

// List ALL resources and filter for PDFs
cloudinary.api.resources({
  type: 'upload',
  max_results: 200
}, (error, result) => {
  if (error) {
    console.log('❌ Error fetching Cloudinary resources:', error.message);
  } else {
    console.log(`📊 Total Resources: ${result.resources.length}`);
    
    // Filter for PDF files
    const pdfFiles = result.resources.filter(r => r.format === 'pdf');
    console.log(`📄 PDF Files Found: ${pdfFiles.length}`);
    
    // Filter for recent uploads (last 2 hours)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentUploads = result.resources.filter(r => new Date(r.created_at) > twoHoursAgo);
    
    console.log(`🆕 Recent Uploads (last 2h): ${recentUploads.length}`);
    
    if (recentUploads.length > 0) {
      console.log('\n📄 Recent Uploads:');
      recentUploads.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.public_id}`);
        console.log(`   📄 Format: ${resource.format}`);
        console.log(`   📊 Size: ${resource.bytes} bytes`);
        console.log(`   📅 Created: ${resource.created_at}`);
        console.log(`   🌐 URL: ${resource.secure_url}`);
        console.log('');
      });
    }
    
    if (pdfFiles.length > 0) {
      console.log('\n📄 All PDF Files:');
      pdfFiles.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.public_id}`);
        console.log(`   📊 Size: ${resource.bytes} bytes`);
        console.log(`   📅 Created: ${resource.created_at}`);
        console.log(`   🌐 URL: ${resource.secure_url}`);
        console.log('');
      });
    }
  }
});
