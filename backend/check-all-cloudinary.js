require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

console.log('=== Checking All Cloudinary Resources ===');

// List ALL resources (not just internship-portal)
cloudinary.api.resources({
  type: 'upload',
  max_results: 100
}, (error, result) => {
  if (error) {
    console.log('❌ Error fetching Cloudinary resources:', error.message);
  } else {
    console.log(`✅ Cloudinary Resources Found: ${result.resources.length}`);
    
    if (result.resources.length > 0) {
      console.log('\n📄 All Files in Cloudinary:');
      result.resources.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.public_id}`);
        console.log(`   📁 Folder: ${resource.folder || 'root'}`);
        console.log(`   📄 Format: ${resource.format}`);
        console.log(`   📊 Size: ${resource.bytes} bytes`);
        console.log(`   🌐 URL: ${resource.secure_url}`);
        console.log(`   📅 Created: ${resource.created_at}`);
        console.log('');
      });
    } else {
      console.log('📭 No files found in Cloudinary');
    }
    
    // Check recent uploads (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUploads = result.resources.filter(r => new Date(r.created_at) > oneDayAgo);
    
    if (recentUploads.length > 0) {
      console.log(`\n🆕 Recent Uploads (last 24h): ${recentUploads.length}`);
      recentUploads.forEach(resource => {
        console.log(`   📄 ${resource.public_id} (${resource.format})`);
      });
    }
  }
});
