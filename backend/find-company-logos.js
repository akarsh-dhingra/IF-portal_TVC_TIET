require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./src/models/Company');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

async function findCompanyLogos() {
  try {
    console.log('=== Searching for Company Logos ===');
    
    const companies = await Company.find({ logo: { $exists: true, $ne: '' } })
      .select('companyName email logo createdAt userId')
      .sort({ createdAt: -1 });
    
    if (companies.length === 0) {
      console.log('📭 No companies with logos found');
    } else {
      console.log(`🏢 Found ${companies.length} companies with logos:`);
      
      companies.forEach((company, index) => {
        console.log(`\n${index + 1}. ${company.companyName || 'Not set'}`);
        console.log(`   📧 Email: ${company.email || 'Not set'}`);
        console.log(`   🆔 User ID: ${company.userId || 'Not set'}`);
        console.log(`   🖼️  Logo: ${company.logo}`);
        console.log(`   📅 Created: ${company.createdAt}`);
        
        // Check if Cloudinary or local
        if (company.logo.includes('cloudinary')) {
          console.log(`   ☁️  Storage: Cloudinary ✅`);
        } else {
          console.log(`   💾 Storage: Local (uploads folder)`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error finding company logos:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

findCompanyLogos();
