# CloudDeck - AI Agent Starter Prompt

Copy and paste this entire prompt to any AI coding assistant (Claude, ChatGPT, Cursor, etc.) to build a CloudDeck-like application:

---

## THE TASK

Build a **premium AWS S3 file manager web application** called CloudDeck. This is a 100% client-side React app that lets users manage their S3 buckets directly from the browser using their own AWS credentials.

## COMPLETE DOCUMENTATION

I have provided you with complete technical documentation in two files:

1. **PRD.json** - Full product requirements, architecture, features, and specifications
2. **AGENT_PROMPT.md** - Step-by-step implementation guide with code examples

Please read both files carefully before starting.

## YOUR OBJECTIVES

### Phase 1: Project Setup
1. Create a new React project with Vite
2. Install ALL dependencies from PRD.json → tech_stack
3. Set up the exact file structure from AGENT_PROMPT.md
4. Configure Tailwind CSS with custom design tokens

### Phase 2: Core Infrastructure
1. Implement `services/aws/s3Service.js` with ALL functions from AGENT_PROMPT.md:
   - initializeS3Client
   - listObjects
   - uploadFile (small files)
   - uploadLargeFile (with progress)
   - downloadFile
   - deleteObjects
   - createFolder
   - generateShareableLink
2. Implement `utils/authUtils.js` for credential storage
3. Implement `utils/formatters.js` for file size/date formatting

### Phase 3: Components
Implement these components following AGENT_PROMPT.md specifications:

**Authentication:**
- `AuthModal.jsx` - AWS credential input and validation

**Landing:**
- `Hero.jsx` - Landing page with CTA buttons
- `SetupGuide.jsx` - AWS setup instructions

**File Management:**
- `FileExplorer.jsx` - Main file manager interface
- `FileList.jsx` - File/folder list display
- `FileItem.jsx` - Individual file/folder component
- `FileIcon.jsx` - File type icons
- `Breadcrumb.jsx` - Path navigation

**Modals:**
- `ShareModal.jsx` - Generate shareable links
- `NewFolderModal.jsx` - Create new folders
- `RenameModal.jsx` - Rename files/folders
- `DeleteConfirmModal.jsx` - Delete confirmation

**Previews:**
- `ImagePreview.jsx` - Image file preview
- `MediaPreview.jsx` - Video/audio preview

### Phase 4: Styling & Design
1. Implement index.css with:
   - CSS custom properties (design tokens)
   - Glassmorphism effects
   - Animations (fade, slide, scale, gradient)
   - Scrollbar customization
2. Configure Tailwind with CloudDeck theme
3. Add Framer Motion animations
4. Add React Awesome Reveal entrance animations

### Phase 5: Features
Implement all features from PRD.json → core_features:

**Must-Have Features:**
- ✅ AWS credential validation (HeadBucket)
- ✅ File upload (drag-and-drop + button)
- ✅ Large file upload with progress (chunked, >5MB)
- ✅ File download (presigned URLs)
- ✅ File/folder deletion (batch delete)
- ✅ File/folder rename
- ✅ Folder creation
- ✅ Folder navigation (breadcrumb)
- ✅ File search/filter
- ✅ Shareable link generation (presigned URLs)
- ✅ Session timeout with auto-disconnect
- ✅ Toast notifications (sonner)
- ✅ Image/video preview
- ✅ Responsive design (mobile, tablet, desktop)

## CRITICAL REQUIREMENTS

### Architecture (Non-Negotiable):
- **No backend server** - 100% client-side
- **React 19+ with Vite 7+**
- **AWS SDK v3** for all S3 operations
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router DOM** for navigation

### Code Quality:
- Follow exact file structure from AGENT_PROMPT.md
- Use provided S3 service code (copy-paste from AGENT_PROMPT.md)
- Implement all error handling scenarios
- Add loading states for all async operations
- Use toast notifications for user feedback

### Design (Premium UI/UX):
- Use design system from PRD.json → design_system
- Implement glassmorphism effects
- Add smooth animations (Framer Motion)
- Responsive on all devices
- Modern, premium aesthetic

### Security:
- Validate credentials with HeadBucket before storing
- Store credentials in localStorage
- Implement session timeout
- Use presigned URLs (time-limited)
- Never hardcode credentials

### AWS Integration:
- Use chunked uploads for files > 5MB
- Implement progress tracking
- Handle CORS errors gracefully
- Support pagination for large directories

## IMPLEMENTATION ORDER

Follow this exact order:

1. **Setup**: Init project, install deps, create file structure
2. **S3 Service**: Implement all S3 operations (AGENT_PROMPT.md → S3 Service)
3. **Auth**: Build AuthModal with validation
4. **Hero**: Build landing page
5. **FileExplorer**: Build main file manager
6. **File Operations**: Upload, download, delete, rename
7. **Modals**: Share, NewFolder, Rename, Delete
8. **Design**: Apply CSS, animations, glassmorphism
9. **Polish**: Responsive design, error handling, loading states
10. **Test**: Run testing checklist from AGENT_PROMPT.md

## VALIDATION CHECKLIST

Before saying you're done, verify:

- [ ] Can connect with valid AWS credentials
- [ ] Invalid credentials show error message
- [ ] Can upload files (single and multiple)
- [ ] Can upload large files (>100MB) with progress
- [ ] Can download files
- [ ] Can delete files (single and batch)
- [ ] Can rename files/folders
- [ ] Can create folders
- [ ] Can navigate folders (breadcrumb)
- [ ] Can search/filter files
- [ ] Can generate shareable links
- [ ] Images preview in modal
- [ ] Videos play in modal
- [ ] Toast notifications work
- [ ] Loading states during operations
- [ ] Error handling for all operations
- [ ] Responsive on mobile, tablet, desktop
- [ ] Premium UI with glassmorphism
- [ ] Smooth animations
- [ ] Session timeout works
- [ ] Disconnect clears credentials

## AWS SETUP REQUIRED

User needs to set up AWS before using the app:

1. **Create S3 Bucket** in AWS Console
2. **Create IAM User** with this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::BUCKET-NAME/*", "arn:aws:s3:::BUCKET-NAME"]
  }]
}
```
3. **Configure CORS** on bucket:
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
  "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
  "ExposeHeaders": ["ETag"]
}]
```
4. **Generate Access Keys** for IAM user
5. **Use credentials** in CloudDeck AuthModal

## REFERENCE FILES

You have two reference files:

**PRD.json** contains:
- Complete product specification
- All features and requirements
- Technical architecture
- Design system
- User workflows
- Deployment requirements

**AGENT_PROMPT.md** contains:
- Step-by-step implementation guide
- Complete code examples
- Function signatures
- Component templates
- CSS and styling
- Testing checklist

**Use both together** - PRD.json for WHAT to build, AGENT_PROMPT.md for HOW to build it.

## SUCCESS CRITERIA

The project is successful when:
✅ Users can manage S3 buckets without AWS Console
✅ All file operations work smoothly
✅ UI is premium, modern, and beautiful
✅ No backend server needed
✅ Works on all devices
✅ Errors are handled gracefully
✅ Credentials are secure

## YOUR FIRST STEP

Start by:
1. Reading PRD.json completely
2. Reading AGENT_PROMPT.md completely
3. Creating project structure
4. Installing dependencies
5. Asking me if anything is unclear

Then proceed with implementation following AGENT_PROMPT.md step by step.

## IMPORTANT NOTES

- **Follow the specs exactly** - don't improvise architecture
- **Use the provided code** - S3 service code in AGENT_PROMPT.md is battle-tested
- **Don't skip error handling** - every S3 operation can fail
- **Premium design is mandatory** - glassmorphism, animations, smooth UX
- **Test everything** - use the checklist in AGENT_PROMPT.md

Ready? Let's build CloudDeck! 🚀

---

**After you acknowledge understanding, I'll provide you with PRD.json and AGENT_PROMPT.md contents.**
