# AGENT PROMPT: Building CloudDeck-Like S3 File Manager

## Your Mission
You are tasked with building a **premium, modern AWS S3 file manager web application** similar to CloudDeck. This is a **client-side only application** that allows users to manage their S3 buckets directly from the browser using their own AWS credentials.

## Core Concept
- **No Backend**: 100% client-side application with direct browser-to-S3 communication
- **Bring Your Own Keys**: Users provide their AWS credentials (Access Key ID, Secret Access Key, Region, Bucket Name)
- **Modern UI/UX**: Premium design with glassmorphism, animations, and excellent user experience
- **Full S3 Management**: Upload, download, delete, rename, share files and folders

---

## Technical Stack Requirements

### Frontend Framework
```json
{
  "framework": "React 19+",
  "buildTool": "Vite 7.0+",
  "language": "JavaScript (ES6+)",
  "routing": "React Router DOM 7+"
}
```

### AWS Integration
```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.842.0",
    "@aws-sdk/lib-storage": "^3.842.0",
    "@aws-sdk/s3-request-presigner": "^3.842.0"
  }
}
```

### Styling & Animation
```json
{
  "styling": "Tailwind CSS 3.4+",
  "animations": {
    "framerMotion": "^12.23.0",
    "reactAwesomeReveal": "^4.3.1",
    "gsap": "^3.13.0",
    "lottie": "^2.4.1"
  },
  "notifications": "sonner ^2.0.6"
}
```

### Design System
```css
/* Color Palette */
--color-primary-bg: #f5f5f5;
--color-text-primary: #000000;
--color-neutral-white: #ffffff;

/* Use glassmorphism effects */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## Architecture & File Structure

### Required Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Hero/
│   │   │   └── Hero.jsx              # Landing page
│   │   ├── AuthModal/
│   │   │   └── AuthModal.jsx         # Credential input
│   │   ├── FileExplorer/
│   │   │   ├── FileExplorer.jsx      # Main file manager
│   │   │   ├── FileList.jsx          # File/folder list
│   │   │   ├── FileItem.jsx          # Individual file/folder
│   │   │   ├── FileIcon.jsx          # File type icons
│   │   │   ├── Breadcrumb.jsx        # Path navigation
│   │   │   ├── ShareModal.jsx        # Share link generator
│   │   │   ├── NewFolderModal.jsx    # Create folder
│   │   │   ├── RenameModal.jsx       # Rename files
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── ImagePreview.jsx
│   │   │   ├── MediaPreview.jsx
│   │   │   └── UploadItem.jsx
│   │   ├── SetupGuide/
│   │   │   └── SetupGuide.jsx        # AWS setup instructions
│   │   ├── common/                    # Reusable UI components
│   │   └── ui/                        # UI primitives
│   ├── services/
│   │   └── aws/
│   │       └── s3Service.js          # ALL S3 operations
│   ├── utils/
│   │   ├── authUtils.js              # Credential storage
│   │   └── formatters.js             # File size, date formatting
│   ├── hooks/
│   │   └── useSessionTimeout.js      # Auto-disconnect
│   ├── App.jsx                        # Main app component
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Global styles + design tokens
├── package.json
└── vite.config.js
```

---

## Core Features Implementation Guide

### 1. Authentication Flow (AuthModal)

**Component: `AuthModal.jsx`**

#### Required Form Fields:
```javascript
const [credentials, setCredentials] = useState({
  region: '',           // e.g., 'us-east-1'
  accessKeyId: '',      // AWS Access Key ID
  secretAccessKey: '',  // AWS Secret Access Key
  bucketName: ''        // S3 Bucket name
});
```

#### Validation Logic:
```javascript
const validateCredentials = async (creds) => {
  // 1. Initialize S3Client with credentials
  const s3Client = new S3Client({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey
    }
  });

  // 2. Test connection with HeadBucket command
  const command = new HeadBucketCommand({ 
    Bucket: creds.bucketName 
  });
  
  try {
    await s3Client.send(command);
    // Success - credentials are valid
    return { success: true };
  } catch (error) {
    // Provide helpful error messages
    if (error.name === 'NoSuchBucket') {
      return { success: false, message: 'Bucket not found' };
    }
    if (error.name === 'Forbidden') {
      return { success: false, message: 'Invalid credentials or insufficient permissions' };
    }
    return { success: false, message: error.message };
  }
};
```

#### Store Credentials:
```javascript
// On successful validation
localStorage.setItem('awsCredentials', JSON.stringify(credentials));
```

---

### 2. S3 Service (`services/aws/s3Service.js`)

This file contains ALL S3 operations. Implement these functions:

#### Initialize S3 Client
```javascript
let s3Client = null;

export const initializeS3Client = (credentials) => {
  s3Client = new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey
    }
  });
};
```

#### List Objects (Files & Folders)
```javascript
export const listObjects = async (bucket, prefix = '', continuationToken = null) => {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    Delimiter: '/',  // This separates folders
    ContinuationToken: continuationToken
  });

  const response = await s3Client.send(command);
  
  return {
    folders: response.CommonPrefixes || [],  // Folders
    files: response.Contents || [],           // Files
    isTruncated: response.IsTruncated,
    nextToken: response.NextContinuationToken
  };
};
```

#### Upload File (Small)
```javascript
export const uploadFile = async (bucket, key, file, onProgress) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: file.type
  });

  await s3Client.send(command);
  return { success: true };
};
```

#### Upload Large File (with Progress)
```javascript
import { Upload } from '@aws-sdk/lib-storage';

export const uploadLargeFile = async (bucket, key, file, onProgress) => {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: file.type
    },
    queueSize: 4,        // Concurrent uploads
    partSize: 5 * 1024 * 1024  // 5MB chunks
  });

  upload.on('httpUploadProgress', (progress) => {
    const percentage = Math.round(
      (progress.loaded / progress.total) * 100
    );
    onProgress(percentage);
  });

  await upload.done();
  return { success: true };
};
```

#### Download File
```javascript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const downloadFile = async (bucket, key) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const url = await getSignedUrl(s3Client, command, { 
    expiresIn: 60  // 60 seconds
  });

  // Trigger download
  window.location.href = url;
  return { success: true, url };
};
```

#### Delete Objects (Batch)
```javascript
export const deleteObjects = async (bucket, keys) => {
  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: keys.map(key => ({ Key: key }))
    }
  });

  await s3Client.send(command);
  return { success: true };
};
```

#### Create Folder
```javascript
export const createFolder = async (bucket, folderPath) => {
  // S3 doesn't have folders - create empty object with '/' suffix
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: folderPath.endsWith('/') ? folderPath : `${folderPath}/`,
    Body: ''
  });

  await s3Client.send(command);
  return { success: true };
};
```

#### Generate Shareable Link
```javascript
export const generateShareableLink = async (bucket, key, expiresIn = 86400) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  const url = await getSignedUrl(s3Client, command, { 
    expiresIn  // Default 24 hours (86400 seconds)
  });

  return { success: true, url };
};
```

---

### 3. File Explorer Component

#### Main State Management:
```javascript
const [files, setFiles] = useState([]);
const [folders, setFolders] = useState([]);
const [currentPath, setCurrentPath] = useState('');
const [selectedItems, setSelectedItems] = useState(new Set());
const [uploading, setUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState({});
const [loading, setLoading] = useState(false);
```

#### Load Files on Path Change:
```javascript
useEffect(() => {
  const loadFiles = async () => {
    setLoading(true);
    const credentials = getStoredCredentials();
    
    const { folders, files } = await listObjects(
      credentials.bucketName,
      currentPath
    );
    
    setFolders(folders);
    setFiles(files);
    setLoading(false);
  };

  loadFiles();
}, [currentPath]);
```

#### Handle File Upload (Drag & Drop):
```javascript
const handleDrop = async (e) => {
  e.preventDefault();
  const droppedFiles = Array.from(e.dataTransfer.files);
  
  setUploading(true);
  
  for (const file of droppedFiles) {
    const key = currentPath + file.name;
    const isLarge = file.size > 5 * 1024 * 1024;  // > 5MB
    
    const progressHandler = (percentage) => {
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: percentage
      }));
    };
    
    if (isLarge) {
      await uploadLargeFile(bucket, key, file, progressHandler);
    } else {
      await uploadFile(bucket, key, file, progressHandler);
    }
  }
  
  setUploading(false);
  // Refresh file list
  loadFiles();
};
```

#### Navigation (Breadcrumb):
```javascript
const navigateToFolder = (folderKey) => {
  setCurrentPath(folderKey);
  setSelectedItems(new Set());
};

const navigateUp = () => {
  const parts = currentPath.split('/').filter(Boolean);
  parts.pop();
  setCurrentPath(parts.length > 0 ? parts.join('/') + '/' : '');
};
```

---

### 4. Hero Landing Page

#### Component Structure:
```jsx
const Hero = ({ onConnectWallet }) => {
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center">
      <div className="max-w-[900px] mx-auto text-center">
        <Slide direction="up" triggerOnce>
          <Fade triggerOnce>
            <h1 className="text-[72px] font-[900] text-text-primary mb-8">
              Your S3 <span className="animated-gradient-text italic">Buckets</span>.
              <br />
              Zero <span className="animated-gradient-text italic">Console</span> Hassle!
            </h1>
          </Fade>
        </Slide>
        
        <Slide direction="up" delay={500} triggerOnce>
          <p className="text-[28px] text-text-primary mb-12">
            Bring your own keys, connect once, and manage files 
            directly from the browser—no setup, no servers.
          </p>
        </Slide>
        
        <Slide direction="up" delay={1000} triggerOnce>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={onConnectWallet}
              className="bg-text-primary text-neutral-white text-[24px] 
                         px-12 py-6 rounded-[32px] hover:bg-[#333333]"
            >
              Add your bucket
            </button>
            <Link to="/setup-guide">
              <button className="bg-transparent text-text-primary text-[24px] 
                                 px-12 py-6 rounded-[32px] border-2 border-text-primary">
                Setup Guide
              </button>
            </Link>
          </div>
        </Slide>
      </div>
    </div>
  );
};
```

---

### 5. App.jsx - Main App Logic

```jsx
function Main() {
  const [connected, setConnected] = useState(!!getStoredCredentials());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleConnectionChange = (credentials) => {
    if (credentials) {
      localStorage.setItem("awsCredentials", JSON.stringify(credentials));
      setConnected(true);
      setIsAuthModalOpen(false);
    }
  };

  const handleDisconnect = () => {
    clearStoredCredentials();
    setConnected(false);
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/setup-guide" element={<SetupGuide />} />
      <Route path="/" element={
        !connected ? (
          <>
            <Hero onConnectWallet={() => setIsAuthModalOpen(true)} />
            <AuthModal 
              isOpen={isAuthModalOpen} 
              onClose={() => setIsAuthModalOpen(false)} 
              onConnect={handleConnectionChange} 
            />
          </>
        ) : (
          <FileExplorer onDisconnect={handleDisconnect} />
        )
      } />
    </Routes>
  );
}
```

---

## Design System Implementation

### 1. Create Design Tokens in `index.css`:

```css
:root {
  /* Colors */
  --color-primary-bg: #f5f5f5;
  --color-text-primary: #000000;
  --color-neutral-white: #ffffff;
  --color-neutral-borders: #cccccc;
  
  /* Typography */
  --font-size-h1: 64px;
  --font-size-h2: 40px;
  --font-size-body: 24px;
  
  /* Spacing */
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
  
  /* Border Radius */
  --border-radius-design: 12px;
  --border-radius-card: 24px;
}

/* Glassmorphism Effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animated Gradient Text */
.animated-gradient-text {
  background: linear-gradient(90deg, #6366f1, #ec4899, #06b6d4);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s linear infinite;
}

@keyframes gradient {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
```

### 2. Tailwind Configuration:

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'primary-bg': 'var(--color-primary-bg)',
        'text-primary': 'var(--color-text-primary)',
        'neutral-white': 'var(--color-neutral-white)',
        'neutral-borders': 'var(--color-neutral-borders)',
      },
      borderRadius: {
        'design': 'var(--border-radius-design)',
        'card': 'var(--border-radius-card)',
      }
    }
  },
  plugins: []
};
```

---

## AWS S3 Setup Requirements

### 1. IAM Policy for S3 Access:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-BUCKET-NAME/*",
        "arn:aws:s3:::YOUR-BUCKET-NAME"
      ]
    }
  ]
}
```

### 2. CORS Configuration for S3 Bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## Critical Implementation Notes

### ✅ DO's:
1. **Always validate credentials** before storing them (use HeadBucket command)
2. **Use chunked uploads** for files > 5MB with progress tracking
3. **Implement error handling** for all S3 operations with user-friendly messages
4. **Store credentials in localStorage** with session timeout for security
5. **Use presigned URLs** for downloads and sharing (time-limited)
6. **Implement drag-and-drop** for file uploads
7. **Show progress indicators** for all async operations
8. **Use toast notifications** (sonner) for success/error feedback
9. **Make it responsive** - test on mobile, tablet, desktop
10. **Add animations** for smooth UX (Framer Motion, React Awesome Reveal)

### ❌ DON'Ts:
1. **Never hardcode credentials** in the code
2. **Don't store credentials on any backend** - this is client-side only
3. **Don't use '*' in CORS AllowedOrigins** for production
4. **Don't forget to clear S3 client** on disconnect
5. **Don't block UI** during uploads/downloads (use async operations)
6. **Don't skip error handling** - S3 can fail in many ways
7. **Don't forget to handle large directories** (pagination with ContinuationToken)

---

## Testing Checklist

Before considering the app complete, test:

- [ ] **Authentication**
  - [ ] Valid credentials connect successfully
  - [ ] Invalid credentials show error
  - [ ] CORS errors display helpful message
  - [ ] Credentials persist across page reloads
  - [ ] Disconnect clears credentials

- [ ] **File Operations**
  - [ ] Upload single file works
  - [ ] Upload multiple files works
  - [ ] Upload large file (>100MB) with progress
  - [ ] Download file works
  - [ ] Delete single file works
  - [ ] Delete multiple files works
  - [ ] Rename file works
  - [ ] Create folder works

- [ ] **Navigation**
  - [ ] Navigate into folders
  - [ ] Navigate back (breadcrumb)
  - [ ] Search filters files
  - [ ] Refresh reloads current directory

- [ ] **Sharing**
  - [ ] Generate shareable link
  - [ ] Copy link to clipboard
  - [ ] Link expires after set time

- [ ] **UI/UX**
  - [ ] Responsive on mobile, tablet, desktop
  - [ ] Animations smooth and professional
  - [ ] Error messages clear and helpful
  - [ ] Loading states during operations
  - [ ] Toast notifications work

---

## Deployment Steps

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to static hosting:**
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag `dist` folder to Netlify
   - **AWS S3 + CloudFront**: Upload `dist` to S3, configure CloudFront

3. **Update CORS configuration:**
   - Add production domain to S3 bucket CORS AllowedOrigins
   - Remove localhost from production CORS

4. **Test in production:**
   - Verify HTTPS is working
   - Test all features end-to-end
   - Check browser console for errors

---

## Example User Flow

1. **User visits app** → Sees Hero page
2. **Clicks "Add your bucket"** → AuthModal opens
3. **Enters credentials** → Validates via HeadBucket
4. **Success** → Credentials stored, FileExplorer loads
5. **Sees current files** → Can navigate folders, upload, download, delete
6. **Uploads file** → Progress shown, toast on completion
7. **Shares file** → Generates presigned URL, copies to clipboard
8. **Disconnects** → Returns to Hero page

---

## Success Criteria

Your implementation is successful if:
✅ Users can manage S3 buckets without AWS Console
✅ All file operations work (upload, download, delete, rename, share)
✅ UI is premium, modern, and delightful to use
✅ No backend server required - 100% client-side
✅ Works on mobile and desktop
✅ Handles errors gracefully with helpful messages
✅ Credentials are secure (localStorage with timeout)

---

## Additional Resources

- **AWS SDK JS v3 Docs**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
- **S3 Client**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/
- **Presigned URLs**: https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html
- **CORS Configuration**: https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html

---

**Remember**: The goal is to create a **beautiful, functional, client-side S3 manager** that makes working with S3 delightful. Focus on premium UI, smooth animations, and excellent error handling. Good luck! 🚀
