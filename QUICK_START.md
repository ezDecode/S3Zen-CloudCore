# CloudDeck - Quick Start Guide for Developers

## 📋 What You Have

You now have **two essential documents** for building CloudDeck-like applications:

### 1. **PRD.json** - Product Requirements Document
- **Location**: `d:\Projects\CloudDeck\PRD.json`
- **Purpose**: Complete technical specification
- **Contains**:
  - Product overview and value proposition
  - Complete technical architecture
  - Detailed feature specifications
  - AWS S3 integration guide
  - Design system documentation
  - User workflows
  - Security considerations
  - Deployment requirements

### 2. **AGENT_PROMPT.md** - Implementation Guide
- **Location**: `d:\Projects\CloudDeck\AGENT_PROMPT.md`
- **Purpose**: Step-by-step implementation instructions
- **Contains**:
  - Exact code examples for all features
  - File structure requirements
  - Complete S3 service implementation
  - Component templates
  - Design system CSS
  - Testing checklist
  - Deployment steps

---

## 🚀 How to Use These Documents

### For AI Agents (Claude, ChatGPT, etc.)

**Starting a new project:**
```
I want to build an S3 file manager like CloudDeck. 

Please read the following documents:
1. PRD.json (attach or paste contents)
2. AGENT_PROMPT.md (attach or paste contents)

Then help me build this application step by step, starting with 
project setup and following the architecture specified in these documents.
```

**For specific features:**
```
I need to implement [FEATURE_NAME] from CloudDeck.

Reference:
- PRD.json → core_features → [feature_section]
- AGENT_PROMPT.md → [implementation_section]

Please implement this feature following the specifications.
```

### For Human Developers

1. **Read PRD.json first** to understand:
   - What CloudDeck does
   - How it's architected
   - What technologies it uses
   - All features and their requirements

2. **Use AGENT_PROMPT.md during implementation** for:
   - Exact code to write
   - File structure to follow
   - Function signatures and logic
   - Design system implementation

---

## 📁 Key Sections Reference

### From PRD.json

| Section | Use Case |
|---------|----------|
| `product` | Understanding the app's purpose |
| `tech_stack` | Setting up dependencies |
| `design_system` | Implementing UI/UX |
| `core_features` | Feature specifications |
| `aws_s3_integration` | AWS SDK implementation |
| `user_workflows` | Understanding user journeys |
| `deployment_requirements` | Going to production |

### From AGENT_PROMPT.md

| Section | Use Case |
|---------|----------|
| Technical Stack Requirements | package.json setup |
| Architecture & File Structure | Project organization |
| Core Features Implementation | Copy-paste code examples |
| S3 Service | Complete s3Service.js |
| Design System Implementation | CSS and Tailwind config |
| AWS Setup Requirements | IAM policies, CORS config |
| Testing Checklist | QA before launch |

---

## 🎯 Common Use Cases

### 1. Building from Scratch

**Step 1**: Initialize project
```bash
npm create vite@latest my-s3-manager -- --template react
cd my-s3-manager
```

**Step 2**: Install dependencies (from PRD.json → tech_stack)
```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage @aws-sdk/s3-request-presigner
npm install react-router-dom framer-motion react-awesome-reveal gsap sonner
npm install -D tailwindcss postcss autoprefixer
```

**Step 3**: Follow AGENT_PROMPT.md → Architecture & File Structure to create folders

**Step 4**: Implement features using code examples from AGENT_PROMPT.md

---

### 2. Cloning CloudDeck Functionality

**Reference these sections:**

**For Authentication:**
- PRD.json → `core_features.authentication_flow`
- AGENT_PROMPT.md → `1. Authentication Flow (AuthModal)`

**For File Operations:**
- PRD.json → `core_features.file_explorer.file_operations`
- AGENT_PROMPT.md → `2. S3 Service`

**For UI/Design:**
- PRD.json → `design_system`
- AGENT_PROMPT.md → `Design System Implementation`

---

### 3. Extending CloudDeck

**Want to add new features?**

1. Study similar features in PRD.json → `core_features`
2. Check implementation patterns in AGENT_PROMPT.md
3. Follow the same architecture and coding style
4. Add to PRD.json → `future_enhancements` for documentation

**Examples:**
- Multi-bucket support
- File versioning
- Advanced search
- Bulk operations

---

## 💡 Best Practices

### When Using with AI Agents

✅ **DO:**
- Provide both PRD.json AND AGENT_PROMPT.md for complete context
- Reference specific sections when asking questions
- Ask agent to follow the exact architecture specified
- Request code that matches the design system

❌ **DON'T:**
- Give only partial information (both docs needed)
- Let agent deviate from specified architecture
- Skip the design system requirements
- Ignore error handling patterns

### When Implementing Manually

✅ **DO:**
- Follow the exact file structure from AGENT_PROMPT.md
- Copy-paste the S3 service functions (they're battle-tested)
- Use the CSS design tokens from index.css
- Implement all error handling scenarios

❌ **DON'T:**
- Create different file structures (dependencies matter)
- Rewrite S3 service from scratch (use provided code)
- Skip the glassmorphism and animations (that's the premium feel)
- Forget CORS configuration (app won't work without it)

---

## 🔧 Quick Commands

### Development
```bash
npm install          # Install dependencies
npm run dev         # Start dev server (http://localhost:5173)
npm run build       # Build for production
npm run preview     # Preview production build
```

### AWS Setup (Manual)
1. Create S3 bucket in AWS Console
2. Create IAM user with policy from AGENT_PROMPT.md
3. Configure CORS using JSON from AGENT_PROMPT.md
4. Generate Access Keys
5. Use credentials in CloudDeck AuthModal

---

## 📚 Document Sections Map

### Complete Feature Implementation Path

For any feature, follow this path:

1. **Understand**: PRD.json → `core_features.[feature_name]`
2. **Design**: PRD.json → `design_system`
3. **Code**: AGENT_PROMPT.md → Implementation section
4. **Test**: AGENT_PROMPT.md → Testing Checklist
5. **Deploy**: PRD.json → `deployment_requirements`

---

## 🎨 Design System Quick Reference

From PRD.json and AGENT_PROMPT.md:

**Colors:**
- Background: `#f5f5f5`
- Text: `#000000`
- White: `#ffffff`
- Borders: `#cccccc`

**Typography:**
- H1: 64px, weight 900
- H2: 40px, weight 600
- Body: 24px, weight 400
- Font: PolySans → Inter → system-ui

**Effects:**
- Glassmorphism: `rgba(255,255,255,0.05) + blur(10px)`
- Border Radius: 12px (design), 24px (cards), 32px (buttons)
- Animations: Framer Motion, React Awesome Reveal

---

## 🚨 Critical Implementation Notes

### Must-Haves (from AGENT_PROMPT.md)

1. ✅ Validate credentials with HeadBucket before storing
2. ✅ Use chunked uploads for files > 5MB
3. ✅ Implement error handling for all S3 ops
4. ✅ Store credentials in localStorage with timeout
5. ✅ Use presigned URLs for downloads/sharing
6. ✅ Drag-and-drop file upload
7. ✅ Progress indicators for async operations
8. ✅ Toast notifications (sonner)
9. ✅ Responsive design (mobile, tablet, desktop)
10. ✅ Premium animations (Framer Motion)

### Never Do (from AGENT_PROMPT.md)

1. ❌ Hardcode credentials in code
2. ❌ Use backend server (client-side only!)
3. ❌ Use '*' in CORS AllowedOrigins (production)
4. ❌ Block UI during uploads
5. ❌ Skip error handling
6. ❌ Forget pagination for large directories

---

## 📞 Example AI Prompts

### Complete Project Setup
```
I have two documents: PRD.json and AGENT_PROMPT.md for a CloudDeck 
S3 file manager application.

Please help me:
1. Set up the project structure exactly as specified
2. Install all required dependencies
3. Create the core components following the architecture
4. Implement the S3 service with all functions

Start with project initialization and file structure.
```

### Specific Feature
```
From CloudDeck documentation:
- Feature: File Upload with Progress Tracking
- Reference: AGENT_PROMPT.md → "Upload File (Small)" and "Upload Large File"
- Reference: PRD.json → core_features.file_explorer.file_operations.upload

Please implement this feature with:
1. Drag-and-drop support
2. Progress tracking
3. Chunked uploads for large files
4. Error handling
Follow the exact code patterns from AGENT_PROMPT.md.
```

### Design Implementation
```
Using CloudDeck design system:
- PRD.json → design_system
- AGENT_PROMPT.md → Design System Implementation

Please:
1. Set up CSS with all design tokens
2. Configure Tailwind with custom colors
3. Implement glassmorphism effects
4. Add gradient text animations
Show me the complete index.css and tailwind.config.js.
```

---

## 🎯 Success Metrics

Your implementation is ready when:

- ✅ All features from PRD.json core_features work
- ✅ Design matches PRD.json design_system specs
- ✅ All checklist items in AGENT_PROMPT.md pass
- ✅ No backend required (100% client-side)
- ✅ Credentials validate before storage
- ✅ Large file uploads work with progress
- ✅ UI is premium and delightful
- ✅ Mobile responsive
- ✅ Error handling is user-friendly

---

## 📖 Additional Notes

### PRD.json is your SOURCE OF TRUTH for:
- What features exist
- How they should work
- What technologies to use
- Architecture decisions

### AGENT_PROMPT.md is your IMPLEMENTATION GUIDE for:
- Exact code to write
- Function signatures
- Component structure
- Design system CSS

### Use BOTH together for:
- Complete understanding (PRD.json)
- Exact implementation (AGENT_PROMPT.md)

---

**Good luck building your CloudDeck-like application! 🚀**

For questions, reference the specific section in PRD.json or AGENT_PROMPT.md and ask for clarification.
