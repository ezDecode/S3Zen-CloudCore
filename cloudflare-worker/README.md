# CloudCore URL Shortener - Cloudflare Worker

## Overview
Serverless URL shortening service for CloudCore using Cloudflare Workers + KV storage.

**Custom Domain:** `go.cloudcore.app/s/<id>`

## Features
✅ Short URL generation with secure Base62 IDs  
✅ Cloudflare KV storage with TTL support  
✅ 302 redirects for maximum compatibility  
✅ API key authentication  
✅ CORS protection  
✅ URL validation & open-redirect prevention  
✅ Visit tracking (optional)  
✅ Configurable expiry (max 30 days)

---

## Setup Instructions

### 1. Prerequisites
- Cloudflare account
- Custom domain configured in Cloudflare
- Node.js and npm installed
- Wrangler CLI installed: `npm install -g wrangler`

### 2. Create KV Namespace

```bash
# Login to Cloudflare
wrangler login

# Create KV namespace for production
wrangler kv:namespace create "SHORTLINKS"

# Create KV namespace for preview/dev
wrangler kv:namespace create "SHORTLINKS" --preview
```

Copy the namespace IDs from the output and update `wrangler.toml`:

```toml
kv_namespaces = [
  { binding = "SHORTLINKS", id = "your-production-namespace-id", preview_id = "your-preview-namespace-id" }
]
```

### 3. Generate and Set API Key

Generate a secure API key:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Set the API key as a secret (recommended):
```bash
wrangler secret put API_KEY
# Enter your generated API key when prompted
```

**Important:** Save this API key securely - you'll need it in your CloudCore frontend configuration.

### 4. Configure Custom Domain

#### Option A: Using Cloudflare Dashboard
1. Go to Workers & Pages > Your Worker
2. Navigate to Triggers tab
3. Add Custom Domain: `go.cloudcore.app`
4. Cloudflare will automatically provision SSL

#### Option B: Using wrangler.toml
Uncomment and update in `wrangler.toml`:
```toml
routes = [
  { pattern = "go.cloudcore.app/*", custom_domain = true }
]
```

### 5. Update CORS Configuration

Edit `url-shortener.js` and add your production domains:

```javascript
ALLOWED_ORIGINS: [
  'http://localhost:5173',      // Development
  'https://cloudcore.app',      // Production
  'https://www.cloudcore.app',  // Production www
  // Add other domains as needed
],
```

### 6. Deploy Worker

```bash
# Navigate to worker directory
cd cloudflare-worker

# Deploy to Cloudflare
wrangler deploy

# Test deployment
curl https://go.cloudcore.app/s/test
```

### 7. Test the Worker

#### Test redirect endpoint:
```bash
# This should return 404 (expected - link doesn't exist yet)
curl -I https://go.cloudcore.app/s/testid123
```

#### Test create endpoint:
```bash
curl -X POST https://go.cloudcore.app/api/create \
  -H "Content-Type: application/json" \
  -H "X-CloudCore-API-Key: YOUR_API_KEY" \
  -d '{
    "longUrl": "https://example.com/very/long/url",
    "expirySeconds": 3600
  }'
```

Expected response:
```json
{
  "success": true,
  "shortUrl": "https://go.cloudcore.app/s/aB3dEf9H",
  "shortId": "aB3dEf9H",
  "longUrl": "https://example.com/very/long/url",
  "expiresAt": 1700000000000,
  "expiresIn": 3600
}
```

---

## API Documentation

### POST /api/create
Create a new short URL.

**Headers:**
- `Content-Type: application/json`
- `X-CloudCore-API-Key: YOUR_API_KEY`

**Request Body:**
```json
{
  "longUrl": "https://s3.amazonaws.com/bucket/file?very-long-presigned-url",
  "expirySeconds": 3600
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "shortUrl": "https://go.cloudcore.app/s/aB3dEf9H",
  "shortId": "aB3dEf9H",
  "longUrl": "https://s3.amazonaws.com/...",
  "expiresAt": 1700000000000,
  "expiresIn": 3600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing API key
- `400 Bad Request` - Invalid URL or parameters
- `403 Forbidden` - Origin not allowed

### GET /s/:id
Redirect to the original long URL.

**Response:**
- `302 Found` - Redirects to long URL
- `404 Not Found` - Short URL doesn't exist or expired

### GET /api/stats/:id (Optional)
Get statistics for a short URL.

**Response (200 OK):**
```json
{
  "shortId": "aB3dEf9H",
  "createdAt": 1700000000000,
  "expiresAt": 1700003600000,
  "visits": 42,
  "lastVisit": 1700002000000
}
```

---

## Configuration

### Security Settings

Edit `url-shortener.js` CONFIG object:

```javascript
const CONFIG = {
  API_KEY_HEADER: 'X-CloudCore-API-Key',
  MAX_URL_LENGTH: 2048,
  DEFAULT_EXPIRY: 604800,  // 7 days
  MAX_EXPIRY: 2592000,     // 30 days
  SHORT_ID_LENGTH: 8,
  ALLOWED_SCHEMES: ['https://', 'http://'],
  BLOCKED_DOMAINS: [],     // Add malicious domains here
};
```

### KV Storage Limits
- **Free tier:** 100,000 reads/day, 1,000 writes/day, 1GB storage
- **Workers Paid:** 10M reads/day, unlimited writes, 1GB storage
- Links are automatically purged after TTL expires

---

## Monitoring & Analytics

### View Worker Analytics
```bash
wrangler tail
```

Or in Cloudflare Dashboard:
- Workers & Pages > Your Worker > Metrics

### View KV Storage Usage
```bash
wrangler kv:key list --binding=SHORTLINKS
```

### Check Worker Logs
Real-time logs:
```bash
wrangler tail --format pretty
```

---

## Updating the Worker

After making changes to `url-shortener.js`:

```bash
# Deploy update
wrangler deploy

# Rollback if needed
wrangler rollback
```

---

## Troubleshooting

### "Error 1101: Worker threw exception"
- Check Worker logs: `wrangler tail`
- Verify KV namespace binding in wrangler.toml
- Ensure API_KEY secret is set

### "Unauthorized" when creating short URLs
- Verify API key is correct
- Check request has `X-CloudCore-API-Key` header
- Confirm API key secret is set: `wrangler secret list`

### "Forbidden origin"
- Add your domain to ALLOWED_ORIGINS in url-shortener.js
- Redeploy worker after changes

### Custom domain not working
- Verify domain is added to Cloudflare
- Check DNS records are proxied (orange cloud)
- SSL certificate may take a few minutes to provision

---

## Production Checklist

Before going live:

- [ ] KV namespace created and bound
- [ ] API key generated and set as secret
- [ ] Custom domain configured (`go.cloudcore.app`)
- [ ] ALLOWED_ORIGINS updated with production domains
- [ ] Worker tested with real S3 presigned URLs
- [ ] SSL certificate active
- [ ] Monitoring/analytics enabled
- [ ] Rate limiting configured (if needed)
- [ ] Backup API key stored securely

---

## Cost Estimates

**Cloudflare Workers Free Tier:**
- 100,000 requests/day
- 10ms CPU time per request
- Sufficient for most small to medium projects

**Cloudflare Workers Paid ($5/month):**
- 10 million requests/month
- Additional requests: $0.50 per million
- KV: 1GB included, $0.50/GB after

**Estimated cost for CloudCore:**
- Most users: **Free tier sufficient**
- Heavy usage (100k+ links/month): **~$5-10/month**

---

## Security Best Practices

1. **Never commit API keys** - Always use secrets
2. **Rotate API keys regularly** - Update both worker and frontend
3. **Monitor for abuse** - Check analytics for unusual patterns
4. **Limit expiry** - Max 30 days to prevent storage bloat
5. **Validate origins** - Only allow trusted domains
6. **Block malicious domains** - Update BLOCKED_DOMAINS list
7. **Use HTTPS only in production** - Enforce in ALLOWED_SCHEMES

---

## Next Steps

After deploying the worker, update your CloudCore frontend:
1. Set worker URL in environment variables
2. Set API key in environment variables
3. Update ShareModal to use URL shortener
4. Test end-to-end flow

See `../src/services/urlShortener.js` for frontend integration.
