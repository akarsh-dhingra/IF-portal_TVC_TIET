const fs = require('fs');
const path = require('path');

// Manually load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const { cloudinary } = require('./src/config/cloudinary');
const mongoose = require('mongoose');
// const request = require('supertest'); // Removed dependency
// Since we don't have supertest set up easily with auth, we will reuse the controllers directly or use a mock.
// Actually, using the models directly is easier for state verification, 
// but checking the *URL* accessibility requires fetch.

const Student = require('./src/models/Student');
const Company = require('./src/models/Company');
const Role = require('./src/models/Role');
const Application = require('./src/models/Application');
const User = require('./src/models/User'); // Assuming User model exists

// Mock Express Request/Response
const mockReqRes = (body = {}, file = null, user = {}, params = {}) => {
    const req = {
        body,
        file,
        user,
        params,
        headers: {}
    };
    const res = {
        statusCode: 200,
        json: function (data) { this.data = data; return this; },
        status: function (code) { this.statusCode = code; return this; },
        send: function (data) { this.data = data; return this; }
    };
    return { req, res };
};

async function verifyFlow() {
    console.log('--- STARTING FULL FLOW VERIFICATION ---');

    // 1. Connect DB
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI missing in .env');
        return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ DB Connected');

    try {
        // --- SETUP TEST DATA ---
        const testSuffix = Date.now();
        const studentUser = { _id: new mongoose.Types.ObjectId(), name: 'Test Student', email: `student${testSuffix}@test.com`, password: 'password123', role: 'STUDENT' };
        const companyUser = { _id: new mongoose.Types.ObjectId(), name: 'Test Company', email: `company${testSuffix}@test.com`, password: 'password123', role: 'COMPANY' };

        // Ensure studentUser.id is set (for mockReqRes)
        studentUser.id = studentUser._id;
        companyUser.id = companyUser._id;

        // Create Users in DB
        await User.create(studentUser);
        await User.create(companyUser);

        console.log(`Test Student ID: ${studentUser.id}`);
        console.log(`Test Company ID: ${companyUser.id}`);

        // --- TEST 1: RESUME UPLOAD ---
        console.log('\n--- TEST 1: RESUME UPLOAD ---');
        const { uploadResume } = require('./src/controllers/studentController');
        const dummyPdfPath = path.join(__dirname, 'test-resume.pdf');
        // Minimal valid PDF content
        fs.writeFileSync(dummyPdfPath, '%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n223\n%%EOF');

        // Create temp multer file object
        const resumeFile = {
            path: dummyPdfPath,
            originalname: 'test-resume.pdf',
            mimetype: 'application/pdf',
            size: fs.statSync(dummyPdfPath).size
        };

        const { req: uploadReq, res: uploadRes } = mockReqRes({}, resumeFile, studentUser);

        await uploadResume(uploadReq, uploadRes);

        if (uploadRes.statusCode === 200 || uploadRes.statusCode === 201) {
            console.log('✅ Resume Upload Success');
            console.log('Resume URL:', uploadRes.data.resume);

            // Verify URL accessibility
            const fetch = require('node-fetch'); // Needs node 18+ or install
            // Or use native fetch if node 18+
            try {
                const response = await fetch(uploadRes.data.resume);
                console.log(`Resume URL Access: ${response.status} ${response.statusText}`);
                console.log(`Content-Type: ${response.headers.get('content-type')}`);

                if (response.status === 200) {
                    console.log('✅ Resume is accessible');
                } else {
                    console.error('❌ Resume is NOT accessible');
                }
            } catch (e) {
                console.log('Could not fetch URL (might need node-fetch installed):', e.message);
            }

        } else {
            console.error('❌ Resume Upload Failed:', uploadRes.data);
        }

        // --- TEST 2: COMPANY PROFILE & JOB ---
        console.log('\n--- TEST 2: COMPANY LISTING ---');
        // Ensure company profile exists
        await Company.create({
            userId: companyUser.id,
            name: `Test Company ${testSuffix}`,
            description: 'A great test company',
            website: 'https://test.com',
            logo: 'https://via.placeholder.com/150'
        });

        const { getCompanies } = require('./src/controllers/studentController');
        const { req: companiesReq, res: companiesRes } = mockReqRes({}, null, studentUser);
        await getCompanies(companiesReq, companiesRes);

        if (companiesRes.data && companiesRes.data.length > 0) {
            const found = companiesRes.data.find(c => c.userId.toString() === companyUser.id.toString());
            if (found) {
                console.log('✅ Registered company is showing on student page');
            } else {
                console.error('❌ Registered company NOT found in list');
            }
        } else {
            console.error('❌ No companies returned');
        }

        // --- TEST 3: JOB APPLICATION ---
        console.log('\n--- TEST 3: JOB APPLICATION ---');
        // Create Role
        const companyProfile = await Company.findOne({ userId: companyUser.id });
        const role = await Role.create({
            companyId: companyProfile._id,
            title: 'Software Intern',
            description: 'Write code',
            stipend: '50000',
            eligibility: 'B.Tech',
            // status: 'OPEN' // Not in schema, removing to be safe
        });
        console.log('Created Role:', role._id);

        // Apply
        const { applyJob } = require('./src/controllers/studentController');
        const { req: applyReq, res: applyRes } = mockReqRes({
            roleId: role._id,
            useExistingResume: true // Should use the one uploaded in Test 1
        }, null, studentUser);

        const studentForApp = await Student.findOne({ userId: studentUser.id });
        console.log('Student found for app:', studentForApp ? studentForApp._id : 'NULL');

        await applyJob(applyReq, applyRes);
        console.log('Application Created with Student ID:', applyRes.data && applyRes.data.data ? applyRes.data.data.studentId : 'UNKNOWN');

        if (applyRes.statusCode === 201) {
            console.log('✅ Application Success');
        } else {
            console.error('❌ Application Failed:', applyRes.data || applyRes.error);
        }

        // --- TEST 4: COMPANY VIEW APPLICANTS ---
        console.log('\n--- TEST 4: COMPANY VIEW APPLICANTS ---');
        const { getApplicants } = require('./src/controllers/companyController');
        const { req: applicantsReq, res: applicantsRes } = mockReqRes({}, null, companyUser);

        await getApplicants(applicantsReq, applicantsRes);

        if (applicantsRes.data && applicantsRes.data.data) {
            const applicants = applicantsRes.data.data;
            console.log('Applicants Data Length:', applicants.length);
            const firstApp = applicants[0];
            console.log('App ID:', firstApp._id);
            console.log('App StudentId Type:', typeof firstApp.studentId);
            console.log('App StudentId Value:', firstApp.studentId);
            if (firstApp.studentId && typeof firstApp.studentId === 'object') {
                console.log('App StudentId.userId:', firstApp.studentId.userId);
            }

            const myApplicant = applicants.find(a => {
                if (!a.studentId) {
                    console.log('Warning: applicant with missing studentId:', a._id);
                    return false;
                }
                if (!a.studentId.userId) {
                    console.log('Warning: applicant with missing studentId.userId:', a._id);
                    return false;
                }
                return a.studentId.userId._id.toString() === studentUser.id.toString();
            });

            if (myApplicant) {
                console.log('✅ Company CAN see the application');
                console.log('Resume URL in Application:', myApplicant.resumeUrl);

                if (myApplicant.resumeUrl) {
                    console.log('✅ Resume URL is present for company');
                } else {
                    console.error('❌ Resume URL is MISSING');
                }
            } else {
                console.error('❌ Application NOT showing for company');
            }
        } else {
            console.error('❌ Failed to fetch applicants');
        }


    } catch (err) {
        console.error('Verification Script Error:', err);
    } finally {
        if (fs.existsSync(path.join(__dirname, 'test-resume.pdf'))) {
            fs.unlinkSync(path.join(__dirname, 'test-resume.pdf'));
        }
        await mongoose.connection.close();
        console.log('\n--- VERIFICATION FINISHED ---');
    }
}

verifyFlow();
