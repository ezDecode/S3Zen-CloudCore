# URL Shortener Integration Guide

## Quick Start

Follow these steps to integrate the URL shortener into CloudCore:

### 1. Deploy the Cloudflare Worker

Navigate to the worker directory and follow the deployment guide:

```bash
cd cloudflare-worker
```

Follow all steps in `cloudflare-worker/README.md`:
- Create KV namespace
- Generate and set API key
- Configure custom domain
- Deploy worker

### 2. Configure CloudCore Frontend

After deploying the worker, configure your CloudCore frontend:

#### Option A: Using Environment Variables (Recommended for Production)

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your worker configuration:
   ```bash
   VITE_SHORTENER_URL=https://go.cloudcore.app
   VITE_SHORTENER_API_KEY=your-api-key-from-cloudflare
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

#### Option B: Direct Configuration (For Testing)

Temporarily hardcode values in `src/services/urlShortener.js`:

```javascript
const SHORTENER_CONFIG = {
  workerUrl: 'https://go.cloudcore.app',
  apiKey: 'your-api-key',
  timeout: 10000,
};
```

⚠️ **Warning:** Don't commit API keys to version control!

### 3. Test the Integration

1. Start CloudCore: `npm run dev`
2. Login to your AWS account
3. Navigate to a file
4. Click "Share" action
5. You should see "Use Short URL" toggle
6. Generate a link with shortening enabled
7. Verify you get a short URL like `https://go.cloudcore.app/s/aB3dEf9H`
8. Test the short URL in a browser - it should redirect to your S3 file

### 4. Troubleshooting

#### "URL Shortener is not configured"
- Check that `VITE_SHORTENER_URL` is set in `.env`
- Check that `VITE_SHORTENER_API_KEY` is set in `.env`
- Restart dev server after changing `.env`

#### "Unauthorized" error
- Verify API key matches the one set in Cloudflare Worker
- Check API key in Cloudflare: `wrangler secret list`
- Ensure no extra whitespace in API key

#### Toggle doesn't appear
- Shortener is not configured (expected behavior)
- Check browser console for errors
- Verify `isShortenerAvailable()` returns true

#### Short URL doesn't work
- Test worker directly: `curl https://go.cloudcore.app/s/test`
- Check Cloudflare Worker logs: `wrangler tail`
- Verify custom domain is configured correctly

---

## Architecture Overview

```
┌─────────────────┐
│  CloudCore UI   │
│  (React/Vite)   │
└────────┬────────┘
         │
         │ 1. User clicks "Share"
         │
         ▼
┌─────────────────────────┐
│   generateShareableLink │
│   (S3 Service)          │
└────────┬────────────────┘
         │
         │ 2. Generate presigned URL
         │    (e.g., https://s3.amazonaws.com/bucket/file?X-Amz-...)
         │
         ▼
┌─────────────────────────┐
│   createShortUrl        │
│   (URL Shortener)       │
└────────┬────────────────┘
         │
         │ 3. POST /api/create
         │    { longUrl, expirySeconds }
         │
         ▼
┌─────────────────────────┐
│  Cloudflare Worker      │
│  + KV Storage           │
└────────┬────────────────┘
         │
         │ 4. Return short URL
         │    { shortUrl: "https://go.cloudcore.app/s/aB3dEf9H" }
         │
         ▼
┌─────────────────────────┐
│   ShareModal            │
│   (Display short URL)   │
└─────────────────────────┘

         User shares: https://go.cloudcore.app/s/aB3dEf9H
         
         ↓
         
┌─────────────────────────┐
│   Recipient visits      │
│   short URL             │
└────────┬────────────────┘
         │
         │ GET /s/aB3dEf9H
         │
         ▼
┌─────────────────────────┐
│  Cloudflare Worker      │
│  (Lookup in KV)         │
└────────┬────────────────┘
         │
         │ 302 Redirect to presigned URL
         │
         ▼
┌─────────────────────────┐
│   AWS S3 Download       │
└─────────────────────────┘
```

---

## Feature Behavior

### When Shortener is NOT Configured
- Toggle switch is hidden
- ShareModal works normally with presigned URLs
- No degradation of functionality

### When Shortener IS Configured
- Toggle switch appears in ShareModal
- Default: Shortening enabled
- User can toggle to use long URLs if needed
- Falls back to long URL if shortening fails

### Security Features
- ✅ API key authentication
- ✅ CORS protection
- ✅ URL validation (prevents open redirect)
- ✅ Domain allowlist
- ✅ Rate limiting (via Cloudflare)
- ✅ Automatic expiry (matches S3 presigned URL expiry)

---

## Production Deployment Checklist

### Cloudflare Worker
- [ ] KV namespace created and bound
- [ ] Strong API key generated (32+ characters)
- [ ] API key set as Cloudflare secret (not in code)
- [ ] Custom domain configured (`go.cloudcore.app`)
- [ ] SSL certificate active
- [ ] CORS origins updated for production
- [ ] Worker deployed and tested

### CloudCore Frontend
- [ ] `.env` file created (not committed!)
- [ ] `VITE_SHORTENER_URL` set to production worker URL
- [ ] `VITE_SHORTENER_API_KEY` set (matches Cloudflare)
- [ ] `.env` added to `.gitignore`
- [ ] Environment variables set in hosting platform (Vercel/Netlify/etc)
- [ ] Build tested with shortener enabled
- [ ] End-to-end flow tested in production

### Monitoring
- [ ] Cloudflare analytics enabled
- [ ] Worker usage monitored
- [ ] KV storage usage tracked
- [ ] Error logging configured

---

## Cost Estimation

**Free Tier (most users):**
- Cloudflare Workers: 100,000 requests/day
- KV Storage: 1GB
- Cost: **$0/month** ✅

**Paid Plan (heavy usage):**
- Cloudflare Workers Paid: $5/month
- 10M requests/month included
- Additional: $0.50 per million requests
- Estimated for 1M short links/month: **~$5-8/month**

---

## Maintenance

### Rotating API Keys

1. Generate new API key:
   ```bash
   openssl rand -base64 32
   ```

2. Update Cloudflare Worker:
   ```bash
   wrangler secret put API_KEY
   ```

3. Update CloudCore `.env`:
   ```bash
   VITE_SHORTENER_API_KEY=new-api-key
   ```

4. Restart application

### Monitoring Usage

View KV storage:
```bash
wrangler kv:key list --binding=SHORTLINKS
```

View worker metrics:
```bash
wrangler tail
```

Or use Cloudflare Dashboard → Workers & Pages → Your Worker → Metrics

### Clearing Old Links

KV entries automatically expire based on TTL. No manual cleanup needed!

---

## Advanced Configuration

### Custom Short ID Length

Edit `cloudflare-worker/url-shortener.js`:

```javascript
SHORT_ID_LENGTH: 8,  // Change to 6 for shorter, 10 for longer
```

### Custom Expiry Limits

```javascript
DEFAULT_EXPIRY: 604800,  // 7 days
MAX_EXPIRY: 2592000,     // 30 days
```

### Blocked Domains

```javascript
BLOCKED_DOMAINS: [
  'malicious-site.com',
  'spam-domain.com',
],
```

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Cloudflare Worker logs: `wrangler tail`
3. Test worker endpoints directly with `curl`
4. Verify environment variables are set
5. Check CORS configuration in worker

---

## Disabling URL Shortener

To disable the shortener feature:

1. Remove or comment out environment variables in `.env`:
   ```bash
   # VITE_SHORTENER_URL=
   # VITE_SHORTENER_API_KEY=
   ```

2. Restart application

The ShareModal will automatically hide the toggle and work normally with presigned URLs only.
