// require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    console.log('--- Cloudinary Configuration Check ---');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key Present:', !!process.env.CLOUDINARY_API_KEY);
    console.log('API Secret Present:', !!process.env.CLOUDINARY_API_SECRET);

    const testFileInfo = 'This is a test file for Cloudinary upload verification.';
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    fs.writeFileSync(testFilePath, testFileInfo);
    console.log('Created test file:', testFilePath);

    try {
        console.log('Attempting upload to Cloudinary...');
        const result = await cloudinary.uploader.upload(testFilePath, {
            resource_type: 'raw',
            folder: 'internship-portal-tests',
            public_id: `test-upload-${Date.now()}`
        });

        console.log('✅ Upload Success!');
        console.log('URL:', result.secure_url);
        console.log('Public ID:', result.public_id);

        console.log('Attempting to delete from Cloudinary...');
        await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
        console.log('✅ Deletion Success!');

    } catch (error) {
        console.error('❌ Upload/Delete Failed:', error);
    } finally {
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
            console.log('Cleaned up local test file.');
        }
    }
}

testUpload();
