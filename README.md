# CloudCore URL Shortener

![CloudCore Banner](https://img.shields.io/badge/CloudCore-URL%20Shortener-667eea?style=for-the-badge&logo=link&logoColor=white)

> **Simple. Fast. No AWS Required.**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS SDK](https://img.shields.io/badge/AWS_SDK-v3-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/sdk-for-javascript/)
[![License](https://img.shields.io/badge/License-MIT_green?style=flat-square)](LICENSE)

**CloudCore** is a minimal URL shortener with a clean backend. No AWS, no S3, no authentication - just simple URL shortening with SQLite storage.

---

## ✨ Features

- **🔗 URL Shortening**: Convert long URLs into short, shareable links
- **🗄️ SQLite Storage**: Lightweight database, no external services needed
- **✅ URL Validation**: Rejects localhost and IP addresses
- **🚀 Fast Redirects**: 302 redirects to original URLs
- **🔒 No Auth Required**: Simple API, no user accounts or tokens
- **📦 Zero AWS**: No S3, no credentials, no cloud dependencies

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Database**: [SQLite3](https://www.sqlite.org/)
- **ID Generation**: [nanoid](https://github.com/ai/nanoid)

### Frontend (Optional)
- **Framework**: [React 19](https://react.dev/) with JSX
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ezDecode/S3Zen-CloudCore.git
   cd S3Zen-CloudCore/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default: PORT=3001)
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. Server runs at `http://localhost:3001`

### Quick Test

```bash
# Create a short URL
curl -X POST http://localhost:3001/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://github.com"}'

# Or run the test script
node test.js
```

---

## 📡 API Endpoints

### POST /shorten
Create a short URL

**Request:**
```json
{
  "longUrl": "https://example.com/very/long/path"
}
```

**Response:**
```json
{
  "shortUrl": "http://localhost:3001/s/abc123",
  "shortCode": "abc123"
}
```

### GET /s/:code
Redirect to original URL

**Example:** `http://localhost:3001/s/abc123` → redirects to original URL

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok"
}
```

---

## 📂 Project Structure

```
CloudCore/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── shortener.js   # URL shortening routes
│   │   ├── utils/
│   │   │   ├── idGen.js       # Short code generator
│   │   │   └── validateUrl.js # URL validation
│   │   ├── db/
│   │   │   └── shortlinks.db  # SQLite database (auto-created)
│   │   └── server.js          # Main server
│   ├── .env                   # Environment variables
│   ├── package.json           # Dependencies
│   ├── test.js                # Test script
│   └── README.md              # Backend documentation
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

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [@ezDecode](https://github.com/ezDecode)
