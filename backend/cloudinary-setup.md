# Cloudinary Setup Guide

## 🚀 Setting up Cloudinary for Resume and Logo Uploads

### Step 1: Create Cloudinary Account
1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. After login, go to Dashboard
2. Click on your account name → "Account Settings"
3. Find these values:
   - **Cloud name**: Your cloud name (e.g., "abc123")
   - **API Key**: Your API key
   - **API Secret**: Your API secret

### Step 3: Update .env File
Replace the placeholder values in your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### Step 4: Features Available

#### 📄 Resume Upload (Students)
- **Endpoint**: `POST /api/upload/resume`
- **File Types**: PDF, DOC, DOCX
- **Max Size**: 5MB
- **Storage**: Cloudinary folder "internship-portal"

#### 🖼️ Logo Upload (Companies)
- **Endpoint**: `POST /api/upload/logo`
- **File Types**: JPG, PNG, GIF
- **Max Size**: 2MB
- **Storage**: Cloudinary folder "internship-portal"

#### 🗑️ Delete Operations
- **Delete Resume**: `DELETE /api/upload/resume`
- **Delete Logo**: `DELETE /api/upload/logo`

### Step 5: Frontend Integration Examples

#### Upload Resume (React)
```javascript
const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await fetch('/api/upload/resume', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return response.json();
};
```

#### Upload Logo (React)
```javascript
const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  
  const response = await fetch('/api/upload/logo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return response.json();
};
```

### Step 6: Deployment Benefits

✅ **Scalable**: Handles unlimited files  
✅ **CDN**: Fast delivery globally  
✅ **Secure**: HTTPS by default  
✅ **Optimized**: Auto-compression and format conversion  
✅ **Backup**: Cloudinary handles storage and backup  
✅ **No Server Storage**: Saves your server space  

### Step 7: Testing
1. Start your server: `npm start`
2. Test with Postman or frontend
3. Check Cloudinary Dashboard → Media Library
4. Files should appear in "internship-portal" folder

### 🎯 Ready for Deployment!
Once you've updated your `.env` file with real Cloudinary credentials, your application will:
- Store all resumes and logos on Cloudinary
- Work perfectly when deployed to Vercel, Netlify, or any platform
- Serve files via Cloudinary's CDN for optimal performance

**Your files will be accessible from anywhere in the world!** 🌍
