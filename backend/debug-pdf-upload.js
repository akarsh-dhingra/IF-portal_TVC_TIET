const { cloudinary } = require('./src/config/cloudinary');
const fs = require('fs');
const path = require('path');

async function debugUpload() {
    const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
    // Create a minimal valid PDF file (not just text) to ensure Cloudinary recognizes it
    // This is a minimal PDF header/footer.
    const pdfContent = `%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R/Resources<<>>>>endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
trailer<</Size 4/Root 1 0 R>>
startxref
223
%%EOF`;

    fs.writeFileSync(dummyPdfPath, pdfContent);

    const fileMock = {
        path: dummyPdfPath,
        originalname: 'dummy.pdf',
        mimetype: 'application/pdf',
        size: Buffer.byteLength(pdfContent)
    };

    console.log('--- Testing PDF Upload Logic ---');
    console.log(`Mock File: ${fileMock.originalname} (${fileMock.mimetype})`);

    try {
        const resourceType = fileMock.mimetype === 'application/pdf' ? 'image' : 'auto';
        console.log(`Selected resource_type: ${resourceType}`);

        const result = await cloudinary.uploader.upload(fileMock.path, {
            resource_type: resourceType,
            folder: "internship-portal-debug",
            use_filename: true,
            unique_filename: true,
        });

        console.log('✅ Upload Result:');
        console.log(`URL: ${result.secure_url}`);
        console.log(`Resource Type: ${result.resource_type}`);
        console.log(`Format: ${result.format}`);

        // Cleanup
        await cloudinary.uploader.destroy(result.public_id, { resource_type: resourceType });
        console.log('Cleaned up Cloudinary resource');

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        if (fs.existsSync(dummyPdfPath)) fs.unlinkSync(dummyPdfPath);
    }
}

debugUpload();
