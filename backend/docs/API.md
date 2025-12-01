# CloudCore Backend API Documentation

## Overview

The CloudCore backend provides URL shortening services for S3 presigned URLs.

**Base URL**: `http://localhost:3000` (development)  
**Production**: Set via `BASE_URL` environment variable

## Authentication

### API Key (Production Only)

For origin-less requests (curl, mobile apps) in production, include an API key:

```
x-api-key: your-api-key-here
```

## Endpoints

### 1. Create Short URL

Create a shortened URL from a long URL (typically an S3 presigned URL).

**Endpoint**: `POST /shorten`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "url": "https://your-long-url-here.com/very/long/path?with=parameters"
}
```

**Field Descriptions**:
- `url` (string, required): The long URL to shorten. Must be a valid HTTP/HTTPS URL.

**Response** (200 OK):
```json
{
  "shortUrl": "http://localhost:3000/s/AbCd1234",
  "shortCode": "AbCd1234"
}
```

**Response Fields**:
- `shortUrl` (string): The complete shortened URL
- `shortCode` (string): The 8-character unique code

**Error Responses**:

400 Bad Request:
```json
{
  "error": "Invalid URL"
}
```

500 Internal Server Error:
```json
{
  "error": "Failed to create short URL"
}
```

**Example**:
```bash
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/url"}'
```

---

### 2. Redirect to Original URL

Redirect from a short code to the original URL.

**Endpoint**: `GET /s/:code`

**URL Parameters**:
- `code` (string, required): The 8-character short code

**Response** (302 Found):
- Redirects to the original URL

**Error Responses**:

404 Not Found:
```
Short URL not found
```

403 Forbidden:
```
URL no longer valid
```

500 Internal Server Error:
```
Server error
```

**Example**:
```bash
curl -L http://localhost:3000/s/AbCd1234
```

---

### 3. Health Check

Check if the service is running.

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

**Example**:
```bash
curl http://localhost:3000/health
```

---

## Rate Limiting

**Window**: 15 minutes  
**Limit**: 100 requests per IP address

**Response** (429 Too Many Requests):
```json
{
  "error": "Too many requests, please try again later"
}
```

**Headers**:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

---

## CORS Configuration

**Allowed Origins**: Configured via `ALLOWED_ORIGINS` environment variable

**Default** (development):
- `http://localhost:5173`
- `http://localhost:3000`

**Allowed Methods**: `GET`, `POST`

**Credentials**: Enabled

---

## Security Features

### URL Validation

All URLs are validated before shortening:
- Must use HTTP or HTTPS protocol
- Localhost/internal IPs blocked in production
- IPv6 localhost (::1) blocked
- Private IP ranges blocked
- URL encoding bypass prevention

### HTTPS Enforcement

In production, HTTP requests are automatically redirected to HTTPS.

### Security Headers

Provided by Helmet.js:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## Database

**Type**: SQLite  
**Location**: `./data/shortlinks.db` (configurable via `DB_PATH`)

**Schema**:
```sql
CREATE TABLE shortlinks (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## Environment Variables

### Required

None (all have defaults for development)

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `BASE_URL` | Base URL for short links | `http://localhost:3000` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173,http://localhost:3000` |
| `API_KEY` | API key for origin-less requests (production) | None |
| `NODE_ENV` | Environment (development/production) | `development` |
| `DB_PATH` | SQLite database file path | `./data/shortlinks.db` |

**Example .env**:
```env
PORT=3000
BASE_URL=https://short.example.com
ALLOWED_ORIGINS=https://app.example.com,https://www.example.com
API_KEY=your-secure-random-key-here
NODE_ENV=production
DB_PATH=/var/data/shortlinks.db
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 302 | Redirect (for short URL resolution) |
| 400 | Bad Request (invalid URL) |
| 403 | Forbidden (unsafe URL) |
| 404 | Not Found (short code doesn't exist) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

---

## Short Code Format

- **Length**: 8 characters
- **Character Set**: `0-9`, `A-Z`, `a-z` (62 possible characters)
- **Total Combinations**: 62^8 = 218,340,105,584,896 (218 trillion)
- **Collision Detection**: Built-in with retry logic

---

## Usage Examples

### JavaScript (Fetch API)

```javascript
async function shortenUrl(longUrl) {
  const response = await fetch('http://localhost:3000/shorten', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: longUrl }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to shorten URL');
  }
  
  const data = await response.json();
  return data.shortUrl;
}

// Usage
const shortUrl = await shortenUrl('https://example.com/very/long/url');
console.log(shortUrl); // http://localhost:3000/s/AbCd1234
```

### cURL

```bash
# Shorten a URL
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/long/url"}'

# Follow a short URL
curl -L http://localhost:3000/s/AbCd1234

# Health check
curl http://localhost:3000/health
```

### Python (requests)

```python
import requests

def shorten_url(long_url):
    response = requests.post(
        'http://localhost:3000/shorten',
        json={'url': long_url}
    )
    response.raise_for_status()
    return response.json()['shortUrl']

# Usage
short_url = shorten_url('https://example.com/very/long/url')
print(short_url)  # http://localhost:3000/s/AbCd1234
```

---

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  shortener:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - BASE_URL=https://short.example.com
      - ALLOWED_ORIGINS=https://app.example.com
      - API_KEY=${API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

### Systemd Service

```ini
[Unit]
Description=CloudCore URL Shortener
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/cloudcore/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
Environment="NODE_ENV=production"
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

---

## Monitoring

### Health Check Endpoint

Use `/health` for monitoring:

```bash
# Simple check
curl http://localhost:3000/health

# With monitoring tool
curl -f http://localhost:3000/health || exit 1
```

### Logs

The service logs to stdout/stderr:
- `✓` Success messages
- `❌` Error messages
- `⚠️` Warning messages
- `🔗` Redirect events
- `📝` Request logs

---

## Troubleshooting

### Database Locked

If you see "database is locked" errors:
1. Check for multiple instances running
2. Ensure proper file permissions
3. Consider using WAL mode for SQLite

### CORS Errors

If you see CORS errors:
1. Check `ALLOWED_ORIGINS` environment variable
2. Ensure origin is in the whitelist
3. For origin-less requests, provide API key in production

### Rate Limiting

If you're being rate limited:
1. Reduce request frequency
2. Implement client-side caching
3. Contact admin for rate limit increase

---

## Support

For issues and questions:
- GitHub Issues: [repository-url]
- Documentation: [docs-url]
- Security: See SECURITY.md

---

Last Updated: December 1, 2025
