require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./src/models/Student');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

async function findResumes() {
  try {
    console.log('=== Searching for Submitted Resumes ===');
    
    const students = await Student.find({ resumeUrl: { $exists: true, $ne: '' } })
      .select('name email resumeUrl createdAt userId')
      .sort({ createdAt: -1 });
    
    if (students.length === 0) {
      console.log('📭 No submitted resumes found');
    } else {
      console.log(`📄 Found ${students.length} students with resumes:`);
      
      students.forEach((student, index) => {
        console.log(`\n${index + 1}. Student Name: ${student.name || 'Not set'}`);
        console.log(`   📧 Email: ${student.email || 'Not set'}`);
        console.log(`   🆔 User ID: ${student.userId || 'Not set'}`);
        console.log(`   📄 Resume: ${student.resumeUrl}`);
        console.log(`   📅 Submitted: ${student.createdAt}`);
        
        // Check if Cloudinary or local
        if (student.resumeUrl.includes('cloudinary')) {
          console.log(`   ☁️  Storage: Cloudinary ✅`);
        } else {
          console.log(`   💾 Storage: Local (uploads folder)`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error finding resumes:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

findResumes();
