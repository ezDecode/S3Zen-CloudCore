# CloudCore

![CloudCore Banner](https://img.shields.io/badge/CloudCore-Premium%20S3%20Manager-667eea?style=for-the-badge&logo=amazon-s3&logoColor=white)

> **Your S3 Buckets. Zero Console Hassle!**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS SDK](https://img.shields.io/badge/AWS_SDK-v3-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/sdk-for-javascript/)
[![License](https://img.shields.io/badge/License-MIT_green?style=flat-square)](LICENSE)

**CloudCore** is a modern web application for managing files in AWS S3 buckets. It offers a user-friendly alternative to the AWS Console with drag-and-drop uploads, file previews, and secure credential management.

---

## ✨ Features

- **🚀 Zero Backend**: 100% client-side application connecting directly to S3 from your browser
- **🔒 Secure**: AWS credentials are encrypted and stored locally - never sent to any server
- **📂 File Management**:
  - Upload files with drag & drop support
  - Create, rename, and delete folders
  - Download files and folders
  - Generate presigned URLs for secure sharing
- **🔍 Search & Navigate**: Real-time search and breadcrumb navigation
- **🎨 Modern UI**: Clean interface with smooth animations powered by Framer Motion

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) with JSX
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AWS Integration**: [AWS SDK for JavaScript v3](https://aws.amazon.com/sdk-for-javascript/)
- **Icons**: [Lucide React](https://lucide.dev/) & [HugeIcons React](https://hugeicons.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Date Formatting**: [date-fns](https://date-fns.org/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- An active [AWS Account](https://aws.amazon.com/)
- An S3 Bucket created in your AWS account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ezDecode/S3Zen-CloudCore.git
   cd S3Zen-CloudCore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

---

## ☁️ AWS Configuration

To use CloudCore, configure your AWS S3 bucket for browser access:

### 1. Create an IAM User & Policy

Create an IAM user with programmatic access and attach this policy (replace `YOUR_BUCKET_NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudCoreAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME",
        "arn:aws:s3:::YOUR_BUCKET_NAME/*"
      ]
    }
  ]
}
```

### 2. Configure CORS

Go to your S3 Bucket > Permissions > CORS and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-server-side-encryption",
      "x-amz-request-id",
      "x-amz-id-2"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

> **Security Note**: Replace the origins with your actual domain in production.

---

## 📂 Project Structure

```
CloudCore/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication (Hero, AuthModal)
│   │   ├── common/            # Shared components (Toast, SkeletonLoader)
│   │   ├── file-explorer/     # Main file management interface
│   │   └── modals/            # Modals (Share, Delete, CreateFolder, Rename)
│   ├── hooks/                 # Custom hooks (useAuth, useModals, useSessionTimeout)
│   ├── services/              # AWS S3 service integration
│   ├── utils/                 # Helper functions
│   ├── App.jsx                # Main application component
│   └── index.css              # Global styles
├── public/                    # Static assets
├── index.html                 # HTML entry point
├── package.json               # Dependencies
└── vite.config.js             # Vite configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [@ezDecode](https://github.com/ezDecode)
