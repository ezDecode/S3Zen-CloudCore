# CloudCore

![CloudCore Banner](https://img.shields.io/badge/CloudCore-Premium%20S3%20Manager-667eea?style=for-the-badge&logo=amazon-s3&logoColor=white)

> **Your S3 Buckets. Zero Console Hassle!**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS SDK](https://img.shields.io/badge/AWS_SDK-v3-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/sdk-for-javascript/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**CloudCore** is a modern, premium web application for managing files in AWS S3 buckets. It offers a beautiful, user-friendly alternative to the AWS Console, allowing you to upload, download, organize, and share files with zero backend infrastructure required.

---

## ✨ Key Features

*   **🚀 Zero Backend**: 100% client-side application. Connect directly to S3 from your browser.
*   **🔒 Secure by Design**: Your AWS credentials are encrypted and stored locally in your browser. They never leave your device except to talk to AWS.
*   **⚡ Lightning Fast**: optimized for performance with chunked uploads for large files and smart caching.
*   **🎨 Premium UI/UX**: A stunning interface built with Glassmorphism principles, smooth animations, and a focus on usability.
*   **📂 Full File Management**:
    *   **Upload**: Drag & drop support, multi-file uploads, and folder uploads.
    *   **Organize**: Create folders, rename files, and delete items with ease.
    *   **Preview**: Built-in preview for images, videos, audio, and code files.
    *   **Share**: Generate time-limited presigned URLs to share files securely.
*   **🔍 Smart Search**: Real-time filtering and search within your buckets.

---

## 🛠️ Tech Stack

*   **Frontend Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS Variables
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://greensock.com/gsap/)
*   **AWS Integration**: [AWS SDK for JavaScript v3](https://aws.amazon.com/sdk-for-javascript/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   An active [AWS Account](https://aws.amazon.com/)
*   An S3 Bucket created in your AWS account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ezDecode/S3Zen-CloudCore.git
    cd CloudCore
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`

---

## ☁️ AWS Configuration Guide

To use CloudCore, you need to configure your AWS S3 bucket to allow browser access. Follow these steps:

### 1. Create an IAM User & Policy

Create an IAM user with programmatic access and attach the following policy (replace `YOUR_BUCKET_NAME` with your actual bucket name):

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

### 2. Configure CORS (Cross-Origin Resource Sharing)

Go to your S3 Bucket > Permissions > Cross-origin resource sharing (CORS) and paste this configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
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
> **Note:** For security in production, replace `*` in `AllowedOrigins` with your actual domain.

---

## 📂 Project Structure

```
CloudCore/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication related components (Hero, AuthModal)
│   │   ├── file-explorer/ # Main file management interface
│   │   └── modals/        # Shared modals (Share, Delete, etc.)
│   ├── hooks/             # Custom React hooks (useSessionTimeout, etc.)
│   ├── services/          # AWS S3 service integration
│   ├── utils/             # Helper functions
│   ├── App.jsx            # Main application component
│   └── index.css          # Global styles and design tokens
├── public/                # Static assets
├── index.html             # HTML entry point
├── package.json           # Project dependencies
└── vite.config.js         # Vite configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ezDecode">@ezDecode</a></p>
</div>
