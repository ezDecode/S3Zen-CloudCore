# CloudCore Deployment Guide

Complete guide for deploying CloudCore to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [AWS Amplify Deployment](#aws-amplify-deployment)
- [Docker Deployment](#docker-deployment)
- [Traditional Server Deployment](#traditional-server-deployment)

## Prerequisites

- Node.js 18+ installed
- Git repository
- AWS Account with S3 bucket
- Domain name (optional)

## Environment Variables

### Frontend (.env.local)

```env
# Backend URL
VITE_BACKEND_URL=https://your-backend-url.com

# Optional: Admin API key for URL shortener stats
VITE_ADMIN_API_KEY=your-admin-api-key
```

### Backend (.env)

```env
# Server Configuration
PORT=3000
BASE_URL=https://your-backend-url.com

# Security
ALLOWED_ORIGINS=https://your-frontend-url.com
API_KEY=your-secure-random-key
NODE_ENV=production

# Database
DB_PATH=./data/shortlinks.db
```

## Vercel Deployment

### Frontend

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `VITE_BACKEND_URL`

### Backend

1. **Create `vercel.json` in backend folder**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.js"
       }
     ]
   }
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Configure Environment Variables** in Vercel Dashboard

## Netlify Deployment

### Frontend

1. **Create `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

3. **Or Connect GitHub Repository**
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Select your repository
   - Configure build settings
   - Add environment variables

### Backend

Netlify Functions approach:

1. **Create `netlify/functions/api.js`**
   ```javascript
   const serverless = require('serverless-http');
   const express = require('express');
   // Import your backend app
   const app = require('../../backend/src/server');

   module.exports.handler = serverless(app);
   ```

2. **Update `netlify.toml`**
   ```toml
   [functions]
     directory = "netlify/functions"
   ```

## AWS Amplify Deployment

### Frontend

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Add Hosting**
   ```bash
   amplify add hosting
   ```

4. **Deploy**
   ```bash
   amplify publish
   ```

### Backend

Deploy backend separately on:
- AWS Lambda + API Gateway
- AWS Elastic Beanstalk
- AWS ECS/Fargate

## Docker Deployment

### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - VITE_BACKEND_URL=http://backend:3000
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - BASE_URL=https://your-domain.com
      - ALLOWED_ORIGINS=https://your-domain.com
    volumes:
      - ./backend/data:/app/data
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Traditional Server Deployment

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Nginx installed
- Node.js 18+ installed
- PM2 for process management

### Setup Steps

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone and Build**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/cloudcore.git
   cd cloudcore

   # Build frontend
   npm install
   npm run build

   # Setup backend
   cd backend
   npm install --production
   ```

3. **Configure PM2**
   ```bash
   # Create ecosystem.config.js
   cat > ecosystem.config.js << 'EOF'
   module.exports = {
     apps: [{
       name: 'cloudcore-backend',
       script: './src/server.js',
       cwd: './backend',
       instances: 2,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   EOF

   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/cloudcore
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/cloudcore/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/cloudcore /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Post-Deployment

### Health Checks

```bash
# Frontend
curl https://your-domain.com

# Backend
curl https://your-domain.com/health
```

### Monitoring

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)
- Enable analytics (optional)

### Backup

```bash
# Backup database
cp backend/data/shortlinks.db backend/data/shortlinks.db.backup

# Automated backup script
0 2 * * * /path/to/backup-script.sh
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild frontend
npm install
npm run build

# Restart backend
cd backend
npm install --production
pm2 restart cloudcore-backend
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` in backend .env
   - Verify frontend `VITE_BACKEND_URL`

2. **Database Locked**
   - Ensure only one backend instance
   - Check file permissions

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version

### Logs

```bash
# PM2 logs
pm2 logs cloudcore-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Docker logs
docker-compose logs -f
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular security updates
- [ ] Database backups automated
- [ ] Monitoring configured

---

For additional help, see [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.
