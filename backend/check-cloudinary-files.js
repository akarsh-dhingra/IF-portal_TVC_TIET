require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

console.log('=== Checking Cloudinary for Documents ===');

// List all files in internship-portal folder
cloudinary.api.resources({
  type: 'upload',
  prefix: 'internship-portal/',
  max_results: 50
}, (error, result) => {
  if (error) {
    console.log('❌ Error fetching Cloudinary resources:', error.message);
  } else {
    console.log('✅ Cloudinary Resources Found:');
    console.log(`📊 Total Resources: ${result.resources.length}`);
    
    if (result.resources.length > 0) {
      console.log('\n📄 Files in internship-portal folder:');
      result.resources.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.public_id} (${resource.format}) - ${resource.bytes} bytes`);
        console.log(`   URL: ${resource.secure_url}`);
        console.log(`   Created: ${resource.created_at}`);
        console.log('');
      });
    } else {
      console.log('📭 No files found in internship-portal folder');
      console.log('💡 New uploads will appear here after you upload them');
    }
  }
});
