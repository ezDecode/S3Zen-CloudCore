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

## Bucket Management API

The Bucket Management API allows authenticated users to manage their AWS S3 bucket configurations securely. All credentials are encrypted server-side using AES-256-GCM before storage.

### Authentication

All bucket management endpoints require a valid Supabase JWT token in the Authorization header:

```
Authorization: Bearer <supabase-access-token>
```

### Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "status": 401
  }
}
```

**Common Error Codes**:
- `MISSING_TOKEN` (401): No Authorization header provided
- `TOKEN_EXPIRED` (401): JWT has expired
- `INVALID_TOKEN` (401): JWT is malformed or invalid
- `SESSION_REVOKED` (401): Session has been invalidated
- `EMAIL_NOT_VERIFIED` (403): Email verification required
- `FORBIDDEN` (403): User doesn't own the resource
- `NOT_FOUND` (404): Resource doesn't exist
- `VALIDATION_ERROR` (400): Request validation failed

---

### 1. Create Bucket Configuration

Add a new bucket configuration with encrypted credentials.

**Endpoint**: `POST /api/buckets`

**Authentication**: Required (verified email)

**Request Body**:
```json
{
  "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "sessionToken": "optional-session-token",
  "region": "us-east-1",
  "bucketName": "my-s3-bucket",
  "displayName": "My Production Bucket",
  "isDefault": true
}
```

**Field Descriptions**:
- `accessKeyId` (string, required): AWS Access Key ID
- `secretAccessKey` (string, required): AWS Secret Access Key
- `sessionToken` (string, optional): STS session token for temporary credentials
- `region` (string, required): AWS region (e.g., us-east-1, eu-west-1)
- `bucketName` (string, required): S3 bucket name
- `displayName` (string, required): User-friendly name for the bucket
- `isDefault` (boolean, optional): Set as default bucket (default: false)

**Response** (201 Created):
```json
{
  "success": true,
  "bucket": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "displayName": "My Production Bucket",
    "bucketName": "my-s3-bucket",
    "region": "us-east-1",
    "isDefault": true,
    "createdAt": "2024-12-03T10:30:00.000Z",
    "updatedAt": "2024-12-03T10:30:00.000Z"
  }
}
```

**Error Responses**:

400 Bad Request (validation failed):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid bucket name format",
    "status": 400
  }
}
```

400 Bad Request (bucket access failed):
```json
{
  "error": {
    "code": "BUCKET_ACCESS_DENIED",
    "message": "Cannot access bucket. Check credentials and bucket permissions.",
    "status": 400
  }
}
```

409 Conflict (duplicate bucket):
```json
{
  "error": {
    "code": "DUPLICATE_BUCKET",
    "message": "A bucket configuration with this name already exists",
    "status": 409
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/api/buckets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1",
    "bucketName": "my-bucket",
    "displayName": "My Bucket",
    "isDefault": true
  }'
```

---

### 2. List Bucket Configurations

Get all bucket configurations for the authenticated user. Returns metadata only (no credentials).

**Endpoint**: `GET /api/buckets`

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "buckets": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "displayName": "Production Bucket",
      "bucketName": "my-prod-bucket",
      "region": "us-east-1",
      "isDefault": true,
      "createdAt": "2024-12-03T10:30:00.000Z",
      "updatedAt": "2024-12-03T10:30:00.000Z"
    },
    {
      "id": "987fcdeb-51a2-34c5-b678-426614174001",
      "displayName": "Development Bucket",
      "bucketName": "my-dev-bucket",
      "region": "eu-west-1",
      "isDefault": false,
      "createdAt": "2024-12-02T14:20:00.000Z",
      "updatedAt": "2024-12-02T14:20:00.000Z"
    }
  ]
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/buckets \
  -H "Authorization: Bearer <token>"
```

---

### 3. Get Bucket Credentials

Retrieve decrypted credentials for a specific bucket. Only the bucket owner can access credentials.

**Endpoint**: `GET /api/buckets/:id/credentials`

**Authentication**: Required (must be bucket owner)

**URL Parameters**:
- `id` (UUID, required): Bucket configuration ID

**Response** (200 OK):
```json
{
  "success": true,
  "credentials": {
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "sessionToken": null,
    "region": "us-east-1",
    "bucketName": "my-s3-bucket"
  }
}
```

**Error Responses**:

403 Forbidden:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource",
    "status": 403
  }
}
```

404 Not Found:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Bucket configuration not found",
    "status": 404
  }
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/buckets/123e4567-e89b-12d3-a456-426614174000/credentials \
  -H "Authorization: Bearer <token>"
```

---

### 4. Update Bucket Configuration

Update an existing bucket configuration. Credentials can be updated if provided.

**Endpoint**: `PUT /api/buckets/:id`

**Authentication**: Required (must be bucket owner)

**URL Parameters**:
- `id` (UUID, required): Bucket configuration ID

**Request Body** (all fields optional):
```json
{
  "displayName": "New Display Name",
  "region": "eu-west-1",
  "accessKeyId": "AKIANEWKEYEXAMPLE",
  "secretAccessKey": "newSecretKeyExample",
  "isDefault": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "bucket": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "displayName": "New Display Name",
    "bucketName": "my-s3-bucket",
    "region": "eu-west-1",
    "isDefault": true,
    "createdAt": "2024-12-03T10:30:00.000Z",
    "updatedAt": "2024-12-03T11:45:00.000Z"
  }
}
```

**Notes**:
- `bucketName` cannot be changed (delete and recreate instead)
- Setting `isDefault: true` automatically unsets other defaults

**Example**:
```bash
curl -X PUT http://localhost:3001/api/buckets/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "displayName": "Updated Name",
    "isDefault": true
  }'
```

---

### 5. Delete Bucket Configuration

Delete a bucket configuration. If the deleted bucket was the default, another bucket will be automatically assigned as default.

**Endpoint**: `DELETE /api/buckets/:id`

**Authentication**: Required (must be bucket owner)

**URL Parameters**:
- `id` (UUID, required): Bucket configuration ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Bucket configuration deleted",
  "newDefault": {
    "id": "987fcdeb-51a2-34c5-b678-426614174001",
    "displayName": "Development Bucket"
  }
}
```

**Notes**:
- If deleted bucket was the default, response includes `newDefault` with the newly assigned default bucket
- If no other buckets exist, `newDefault` will be `null`

**Example**:
```bash
curl -X DELETE http://localhost:3001/api/buckets/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### 6. Validate Bucket Access

Test bucket access with provided credentials without saving them.

**Endpoint**: `POST /api/buckets/validate`

**Authentication**: Required

**Request Body**:
```json
{
  "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
  "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "sessionToken": "optional-session-token",
  "region": "us-east-1",
  "bucketName": "my-s3-bucket"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Bucket access validated successfully",
  "bucketInfo": {
    "name": "my-s3-bucket",
    "region": "us-east-1",
    "location": "us-east-1"
  }
}
```

**Error Responses**:

400 Bad Request (access denied):
```json
{
  "error": {
    "code": "ACCESS_DENIED",
    "message": "Access denied. Check your credentials and bucket permissions.",
    "status": 400
  }
}
```

400 Bad Request (bucket not found):
```json
{
  "error": {
    "code": "BUCKET_NOT_FOUND",
    "message": "Bucket does not exist or you don't have access to it.",
    "status": 400
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/api/buckets/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
    "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1",
    "bucketName": "my-bucket"
  }'
```

---

### 7. Get Default Bucket

Get the user's default bucket configuration with decrypted credentials.

**Endpoint**: `GET /api/buckets/default`

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "bucket": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "displayName": "My Default Bucket",
    "bucketName": "my-s3-bucket",
    "region": "us-east-1",
    "credentials": {
      "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
      "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
      "sessionToken": null
    }
  }
}
```

**Response** (200 OK, no buckets):
```json
{
  "success": true,
  "bucket": null,
  "message": "No bucket configurations found. Please add a bucket."
}
```

**Example**:
```bash
curl -X GET http://localhost:3001/api/buckets/default \
  -H "Authorization: Bearer <token>"
```

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

### Authentication Errors

If you're getting 401 errors:
1. Check that the token is included in the Authorization header
2. Verify the token hasn't expired (default: 1 hour)
3. Ensure the token is from the correct Supabase project
4. Check if the session has been revoked

### Bucket Access Issues

If bucket validation fails:
1. Verify AWS credentials are correct
2. Check bucket exists and is in the specified region
3. Ensure IAM policy allows HeadBucket and ListBucket operations
4. Check for bucket policies that might deny access

---

## Support

For issues and questions:
- GitHub Issues: [repository-url]
- Documentation: [docs-url]
- Security: See SECURITY.md

---

Last Updated: December 3, 2024

