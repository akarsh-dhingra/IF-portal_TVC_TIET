require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

console.log('=== Checking internship-portal Folder ===');

// Search specifically in internship-portal folder
cloudinary.api.resources({
  type: 'upload',
  prefix: 'internship-portal/',
  max_results: 50
}, (error, result) => {
  if (error) {
    console.log('❌ Error fetching internship-portal resources:', error.message);
  } else {
    console.log(`📊 Files in internship-portal folder: ${result.resources.length}`);
    
    if (result.resources.length > 0) {
      console.log('\n📄 Files in internship-portal:');
      result.resources.forEach((resource, index) => {
        console.log(`${index + 1}. ${resource.public_id}`);
        console.log(`   📄 Format: ${resource.format}`);
        console.log(`   📊 Size: ${resource.bytes} bytes`);
        console.log(`   📅 Created: ${resource.created_at}`);
        console.log(`   🌐 URL: ${resource.secure_url}`);
        console.log('');
      });
    } else {
      console.log('📭 No files found in internship-portal folder');
      console.log('💡 Your uploads should appear here after testing');
    }
  }
});
