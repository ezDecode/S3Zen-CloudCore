# CloudCore

![CloudCore Banner](https://img.shields.io/badge/CloudCore-AWS%20S3%20File%20Manager-9333ea?style=for-the-badge&logo=amazon-s3&logoColor=white)

> **Free, Open-Source AWS S3 File Manager — No Backend Required**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS SDK](https://img.shields.io/badge/AWS_SDK-v3-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/sdk-for-javascript/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**CloudCore** is a modern, browser-based AWS S3 file manager that lets you manage your S3 buckets directly from your browser. No backend server required — just connect with your AWS credentials and start managing files instantly.

🌐 **Live Demo**: [cloudcore.creativesky.me](https://cloudcore.creativesky.me)

---

## ✨ Features

### 📁 File Management
- **Drag & Drop Upload** — Upload files and folders with simple drag-and-drop
- **Multi-file Operations** — Select, download, rename, and delete multiple files at once
- **Folder Navigation** — Browse your S3 bucket with an intuitive file explorer interface
- **File Preview** — Preview images, videos, audio, PDFs, markdown, and code files directly in-browser
- **Quick Search** — Instantly filter files by name with debounced search
- **Image Compression** — Automatic image optimization on upload

### 🔗 Sharing & Collaboration
- **Presigned URL Sharing** — Generate secure, time-limited shareable links for any file
- **URL Shortening** — Automatically shorten long presigned URLs for easy sharing
- **Configurable Expiration** — Set link expiry from 1 hour to 7 days
- **LinkButton Component** — Interactive hover tooltip showing both short and S3 URLs with copy actions

### 📱 Cross-Device Sync
- **Cloud-Synced History** — Upload history syncs across all your devices
- **Instant Access** — See your uploads anywhere you log in
- **Local Cache** — Fast initial load with localStorage caching
- **Manual Sync** — One-click sync button to refresh from cloud

### ⭐ Organization
- **Favorites/Pins** — Pin frequently accessed files and folders for quick access
- **Storage Statistics** — View total storage usage with file type breakdown
- **Multiple View Modes** — Switch between grid and list views
- **Sorting Options** — Sort by name, size, or date (ascending/descending)

### 🔒 Security & Reliability
- **Client-Side Encryption** — AWS credentials encrypted with AES-GCM in browser memory
- **No Server Storage** — Your credentials never leave your browser
- **Session Management** — Automatic session timeout with secure credential cleanup
- **Input Validation** — Path traversal prevention and XSS protection
- **Retry Logic** — Automatic retry with exponential backoff for S3 operations
- **Concurrency Limiting** — Memory-safe image processing with parallelism controls

### 🎨 User Experience
- **Neo-Brutalism Design** — Bold, modern interface with smooth animations
- **Progressive Web App** — Install as a mobile/desktop app
- **SEO Optimized** — Full meta tags, Open Graph, and structured data
- **Keyboard Shortcuts** — Power-user friendly navigation

---

## 🖼️ Screenshots

<div align="center">
  <img src="docs/screenshot-explorer.png" alt="File Explorer" width="800" />
  <p><em>Modern file explorer with drag-and-drop support</em></p>
</div>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [React 19](https://react.dev/) | UI Framework with Hooks |
| [Vite 7](https://vitejs.dev/) | Build Tool & Dev Server |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-First Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [AWS SDK v3](https://aws.amazon.com/sdk-for-javascript/) | S3 & STS Client |
| [Hugeicons](https://hugeicons.com/) | Icon Library |

### Backend (Optional - for URL Shortening)
| Technology | Purpose |
|------------|---------|
| [Node.js](https://nodejs.org/) | Runtime |
| [Express](https://expressjs.com/) | Web Framework |
| [SQLite3](https://www.sqlite.org/) | Database |
| [nanoid](https://github.com/ai/nanoid) | Short Code Generation |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- AWS S3 bucket with appropriate IAM permissions

### Quick Start (Frontend Only)

1. **Clone the repository**
   ```bash
   git clone https://github.com/ezDecode/S3Zen-CloudCore.git
   cd S3Zen-CloudCore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

5. **Connect your AWS credentials** — Enter your Access Key, Secret Key, Region, and Bucket name

### Production Build

```bash
npm run build
npm run preview
```

### Backend Setup (Optional - for URL Shortening)

The backend provides URL shortening for shared presigned URLs:

```bash
cd backend
npm install
cp .env.example .env
npm start
```

See [backend/README.md](backend/README.md) for detailed backend documentation.

---

## 🔐 AWS IAM Policy

CloudCore requires the following minimum IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "sts:GetCallerIdentity",
      "Resource": "*"
    }
  ]
}
```

See [docs/aws-iam-policy.json](docs/aws-iam-policy.json) for a complete policy template.

---

## 📂 Project Structure

```
CloudCore/
├── src/
│   ├── components/
│   │   ├── auth/              # Landing page & authentication
│   │   ├── file-explorer/     # Main file browser component
│   │   │   ├── hooks/         # Custom hooks (navigation, operations, drag-drop)
│   │   │   └── components/    # Sub-components (nav, action bar, upload panel)
│   │   ├── modals/            # Share, rename, delete, preview modals
│   │   ├── preview/           # File preview components (image, video, PDF, etc.)
│   │   ├── common/            # Shared components (favorites, storage stats)
│   │   └── ui/                # Base UI components (button, drawer, etc.)
│   ├── hooks/                 # Global hooks (auth, favorites, storage stats)
│   ├── services/
│   │   ├── aws/               # S3 service with all bucket operations
│   │   ├── previewService.js  # Presigned URL caching for previews
│   │   └── urlShortener.js    # Backend URL shortener client
│   ├── utils/                 # Validation, crypto, formatting utilities
│   └── App.jsx                # Root component
├── backend/                   # Optional URL shortener backend
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── utils/             # ID generation, URL validation
│   │   └── server.js          # Express server
│   └── README.md              # Backend documentation
├── public/                    # Static assets, PWA manifest
├── docs/                      # Documentation & IAM policies
└── README.md                  # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add comments for complex logic
- Update documentation for new features
- Test across different browsers

---

## 🗺️ Roadmap

- [ ] Multi-bucket support
- [ ] File/folder move operations
- [ ] Batch rename with patterns
- [ ] S3 versioning support
- [ ] File encryption at rest
- [ ] Collaborative workspaces

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [AWS SDK for JavaScript](https://aws.amazon.com/sdk-for-javascript/) for S3 integration
- [Hugeicons](https://hugeicons.com/) for the beautiful icon set
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- All contributors and users of CloudCore

---

<div align="center">

**Built with ❤️ by [@ezDecode](https://github.com/ezDecode)**

[Report Bug](https://github.com/ezDecode/S3Zen-CloudCore/issues) · [Request Feature](https://github.com/ezDecode/S3Zen-CloudCore/issues)

</div>
