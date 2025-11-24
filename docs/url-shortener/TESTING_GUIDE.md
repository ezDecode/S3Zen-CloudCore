# CloudCore URL Shortener - Testing Guide

## 🧪 Complete Testing Workflow

---

## Pre-Deployment Testing

### 1. Test Worker Locally (Optional)

```bash
cd cloudflare-worker

# Start local dev server
npm install
wrangler dev --local

# Test endpoints locally at http://localhost:8787
```

---

## Post-Deployment Testing

### 2. Test Worker Deployment

#### ✅ Test Create Endpoint

```bash
# Replace with your actual domain and API key
curl -X POST https://go.cloudcore.app/api/create \
  -H "Content-Type: application/json" \
  -H "X-CloudCore-API-Key: YOUR_API_KEY_HERE" \
  -d '{
    "longUrl": "https://example.com/test-url",
    "expirySeconds": 3600
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "shortUrl": "https://go.cloudcore.app/s/aB3dEf9H",
  "shortId": "aB3dEf9H",
  "longUrl": "https://example.com/test-url",
  "expiresAt": 1700000000000,
  "expiresIn": 3600
}
```

**Possible Errors:**
- `401 Unauthorized` → Check API key
- `403 Forbidden` → Origin not in ALLOWED_ORIGINS
- `400 Bad Request` → Invalid URL format
- `500 Internal Server Error` → Check Worker logs

#### ✅ Test Redirect Endpoint

```bash
# Use the shortId from previous response
curl -I https://go.cloudcore.app/s/aB3dEf9H
```

**Expected Response:**
```
HTTP/2 302
location: https://example.com/test-url
...
```

**Possible Errors:**
- `404 Not Found` → Short ID doesn't exist or expired
- `400 Bad Request` → Invalid short ID format

#### ✅ Test Stats Endpoint (Optional)

```bash
curl https://go.cloudcore.app/api/stats/aB3dEf9H
```

**Expected Response:**
```json
{
  "shortId": "aB3dEf9H",
  "createdAt": 1700000000000,
  "expiresAt": 1700003600000,
  "visits": 1,
  "lastVisit": 1700000100000
}
```

---

### 3. Test Frontend Integration

#### ✅ Verify Environment Variables

```bash
# Check .env file exists
cat .env

# Should contain:
VITE_SHORTENER_URL=https://go.cloudcore.app
VITE_SHORTENER_API_KEY=your-api-key
```

#### ✅ Start CloudCore

```bash
cd ..  # Back to CloudCore root
npm run dev
```

Open browser to `http://localhost:5173`

#### ✅ Test URL Shortener Service

Open browser console and run:

```javascript
// Import the service (in a real test, this is already imported)
const { isShortenerAvailable } = await import('/src/services/urlShortener.js');

// Check if configured
console.log('Shortener available:', isShortenerAvailable());
// Expected: true
```

#### ✅ Test ShareModal Integration

1. **Login to CloudCore**
   - Enter AWS credentials
   - Select bucket
   - Navigate to a file

2. **Open Share Modal**
   - Click "Share" button on any file
   - Modal should open

3. **Verify Toggle Appears**
   - Look for "Use Short URL" toggle
   - Should be visible and enabled by default
   - Toggle should work (purple when ON, gray when OFF)

4. **Generate Short URL**
   - Ensure toggle is ON
   - Select expiry (e.g., "1 hour")
   - Click "Generate Link"
   - Wait for generation

5. **Verify Short URL**
   - Should see URL like: `https://go.cloudcore.app/s/xxxxxxxx`
   - Should see "Short URL" badge (purple)
   - Footer text should mention "redirect"
   - Copy button should work

6. **Test Regeneration**
   - Click "Regenerate" button
   - Should generate a NEW short URL
   - Old URL still works (doesn't delete)

7. **Test Long URL Mode**
   - Click "Regenerate"
   - Turn toggle OFF before generating
   - Click "Generate Link"
   - Should see full S3 presigned URL (very long)
   - No "Short URL" badge
   - Copy button should still work

8. **Test Short URL in Browser**
   - Copy the short URL
   - Open in new browser tab/incognito
   - Should redirect to S3
   - File should download or display

---

## Error Testing

### Test Invalid API Key

```bash
curl -X POST https://go.cloudcore.app/api/create \
  -H "Content-Type: application/json" \
  -H "X-CloudCore-API-Key: WRONG_KEY" \
  -d '{"longUrl": "https://example.com", "expirySeconds": 3600}'
```

**Expected:** `401 Unauthorized`

### Test Invalid URL

```bash
curl -X POST https://go.cloudcore.app/api/create \
  -H "Content-Type: application/json" \
  -H "X-CloudCore-API-Key: YOUR_KEY" \
  -d '{"longUrl": "not-a-valid-url", "expirySeconds": 3600}'
```

**Expected:** `400 Bad Request` with error message

### Test Missing Headers

```bash
curl -X POST https://go.cloudcore.app/api/create \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://example.com", "expirySeconds": 3600}'
```

**Expected:** `401 Unauthorized`

### Test CORS from Unauthorized Origin

```bash
curl -X POST https://go.cloudcore.app/api/create \
  -H "Content-Type: application/json" \
  -H "X-CloudCore-API-Key: YOUR_KEY" \
  -H "Origin: https://malicious-site.com" \
  -d '{"longUrl": "https://example.com", "expirySeconds": 3600}'
```

**Expected:** `403 Forbidden`

### Test Non-Existent Short URL

```bash
curl -I https://go.cloudcore.app/s/NOTEXIST
```

**Expected:** `404 Not Found`

---

## Load Testing (Optional)

### Simple Load Test with curl

```bash
# Create 10 short URLs in sequence
for i in {1..10}; do
  curl -X POST https://go.cloudcore.app/api/create \
    -H "Content-Type: application/json" \
    -H "X-CloudCore-API-Key: YOUR_KEY" \
    -d "{\"longUrl\": \"https://example.com/test-$i\", \"expirySeconds\": 3600}"
  echo ""
done
```

### Load Test with Apache Bench (if installed)

```bash
# 100 requests, 10 concurrent (requires valid JSON file)
echo '{"longUrl":"https://example.com","expirySeconds":3600}' > test.json

ab -n 100 -c 10 -T 'application/json' \
  -H 'X-CloudCore-API-Key: YOUR_KEY' \
  -p test.json \
  https://go.cloudcore.app/api/create
```

---

## End-to-End Test Scenario

### Complete User Workflow Test

1. **Start Fresh**
   ```bash
   # Clear browser cache
   # Restart dev server
   npm run dev
   ```

2. **Login**
   - Open CloudCore
   - Enter AWS credentials
   - Access bucket successfully

3. **Upload Test File**
   - Upload a small test file (e.g., test.txt)
   - Verify upload completes

4. **Share with Short URL**
   - Click "Share" on test file
   - Verify toggle is ON
   - Select 1 hour expiry
   - Click "Generate Link"
   - Copy short URL

5. **Test Short URL**
   - Open incognito window
   - Paste short URL
   - Verify redirect works
   - File downloads correctly

6. **Check Visit Count**
   ```bash
   curl https://go.cloudcore.app/api/stats/YOUR_SHORT_ID
   # Should show visits: 1
   ```

7. **Share with Long URL**
   - Click "Share" again
   - Turn toggle OFF
   - Generate link
   - Verify long URL appears
   - Copy and test in incognito
   - Should still work

8. **Test Expiry**
   - Generate short URL with 10 second expiry
   - Wait 15 seconds
   - Try to access short URL
   - Should get 404 (expired)

---

## Browser Console Tests

### Check Service Configuration

```javascript
// Open browser console in CloudCore
const { isShortenerAvailable, getShortenerUrl } = 
  await import('/src/services/urlShortener.js');

console.log('Available?', isShortenerAvailable());
console.log('URL:', getShortenerUrl());
```

### Test Direct Service Call

```javascript
const { createShortUrl } = await import('/src/services/urlShortener.js');

const result = await createShortUrl(
  'https://example.com/test', 
  3600
);

console.log('Result:', result);
// Should show success: true and shortUrl
```

---

## Monitoring & Debugging

### Watch Worker Logs in Real-Time

```bash
cd cloudflare-worker
wrangler tail --format pretty
```

Then create short URLs and watch the logs flow!

### Check KV Storage

```bash
# List all keys
wrangler kv:key list --binding=SHORTLINKS

# Get specific key value
wrangler kv:key get "aB3dEf9H" --binding=SHORTLINKS
```

### Check Worker Status

```bash
# View worker info
wrangler whoami
wrangler deployments list
```

---

## Common Issues & Fixes

| Issue | Check | Fix |
|-------|-------|-----|
| Toggle doesn't appear | Console errors | Verify env vars set, restart server |
| "Unauthorized" error | API key | Check key matches Worker secret |
| Short URL 404 | Worker deployed | Run `wrangler deploy` |
| CORS error | Origin list | Add origin to ALLOWED_ORIGINS |
| Redirect loop | URL validation | Check URL format is valid |
| "Shortener not configured" | .env file | Create .env with both variables |

---

## Performance Testing

### Measure Redirect Speed

```bash
# Test redirect latency
time curl -I https://go.cloudcore.app/s/YOUR_ID

# Should be < 200ms typically
```

### Measure End-to-End Speed

```bash
# Full flow: create + redirect
time (
  SHORTURL=$(curl -s -X POST https://go.cloudcore.app/api/create \
    -H "Content-Type: application/json" \
    -H "X-CloudCore-API-Key: YOUR_KEY" \
    -d '{"longUrl":"https://example.com","expirySeconds":3600}' \
    | jq -r '.shortUrl')
  curl -I $SHORTURL
)
```

---

## Security Testing

### Test URL Validation

```bash
# Test various malicious URLs
URLS=(
  "javascript:alert(1)"
  "data:text/html,<script>alert(1)</script>"
  "ftp://example.com"
  "file:///etc/passwd"
)

for url in "${URLS[@]}"; do
  echo "Testing: $url"
  curl -X POST https://go.cloudcore.app/api/create \
    -H "Content-Type: application/json" \
    -H "X-CloudCore-API-Key: YOUR_KEY" \
    -d "{\"longUrl\":\"$url\",\"expirySeconds\":3600}"
  echo ""
done

# All should return 400 Bad Request
```

### Test Rate Limiting (Cloudflare's built-in)

```bash
# Try creating many URLs quickly
for i in {1..1000}; do
  curl -s -X POST https://go.cloudcore.app/api/create \
    -H "Content-Type: application/json" \
    -H "X-CloudCore-API-Key: YOUR_KEY" \
    -d "{\"longUrl\":\"https://example.com/$i\",\"expirySeconds\":3600}" &
done
wait

# Cloudflare should automatically rate limit if needed
```

---

## Test Checklist

### Pre-Production

- [ ] Worker deploys successfully
- [ ] KV namespace created and bound
- [ ] API key set as secret
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CORS origins updated
- [ ] Environment variables set in frontend
- [ ] .env file NOT committed to git

### Functionality

- [ ] Create endpoint works
- [ ] Redirect endpoint works
- [ ] Stats endpoint works (optional)
- [ ] Toggle appears in UI
- [ ] Short URLs generate correctly
- [ ] Long URLs still work (toggle OFF)
- [ ] Copy to clipboard works
- [ ] Regenerate button works
- [ ] Expiry times respected

### Security

- [ ] Invalid API key rejected
- [ ] Invalid URLs rejected
- [ ] Unauthorized origins blocked
- [ ] Malicious URLs blocked
- [ ] URLs expire correctly

### Performance

- [ ] Redirect < 200ms
- [ ] Create < 1000ms
- [ ] No console errors
- [ ] No memory leaks
- [ ] Works on slow connections

### Browser Compatibility

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Error Handling

- [ ] Graceful fallback if shortener fails
- [ ] Helpful error messages
- [ ] Toasts show appropriate feedback
- [ ] No crashes

---

## Automated Test Script

Save as `test-shortener.sh`:

```bash
#!/bin/bash

WORKER_URL="https://go.cloudcore.app"
API_KEY="YOUR_API_KEY"

echo "🧪 Testing CloudCore URL Shortener"
echo "===================================="

# Test 1: Create short URL
echo ""
echo "Test 1: Creating short URL..."
RESPONSE=$(curl -s -X POST "$WORKER_URL/api/create" \
  -H "Content-Type: application/json" \
  -H "X-CloudCore-API-Key: $API_KEY" \
  -d '{"longUrl":"https://example.com/test","expirySeconds":3600}')

echo $RESPONSE | jq '.'

SHORT_URL=$(echo $RESPONSE | jq -r '.shortUrl')
SHORT_ID=$(echo $RESPONSE | jq -r '.shortId')

if [ "$SHORT_URL" != "null" ]; then
  echo "✅ Create test PASSED"
else
  echo "❌ Create test FAILED"
  exit 1
fi

# Test 2: Test redirect
echo ""
echo "Test 2: Testing redirect..."
REDIRECT=$(curl -s -I "$SHORT_URL" | grep -i "location:" | awk '{print $2}')

if [ -n "$REDIRECT" ]; then
  echo "✅ Redirect test PASSED"
  echo "   Redirects to: $REDIRECT"
else
  echo "❌ Redirect test FAILED"
  exit 1
fi

# Test 3: Check stats
echo ""
echo "Test 3: Checking stats..."
STATS=$(curl -s "$WORKER_URL/api/stats/$SHORT_ID")
echo $STATS | jq '.'

if [ $? -eq 0 ]; then
  echo "✅ Stats test PASSED"
else
  echo "❌ Stats test FAILED"
fi

echo ""
echo "===================================="
echo "🎉 All tests passed!"
```

Run with:
```bash
chmod +x test-shortener.sh
./test-shortener.sh
```

---

## Production Testing

Before launching to users:

1. **Test with Real S3 URLs**
   - Generate actual S3 presigned URLs
   - Shorten them
   - Verify downloads work

2. **Test Different File Types**
   - Images (.jpg, .png)
   - Documents (.pdf, .docx)
   - Videos (.mp4)
   - Archives (.zip)

3. **Test Different Expiry Times**
   - 1 hour
   - 1 day
   - 7 days
   - Verify expiry works correctly

4. **Test from Different Networks**
   - Office WiFi
   - Home network
   - Mobile data
   - Different countries (if possible)

5. **Monitor for 24 Hours**
   - Watch Cloudflare analytics
   - Check for errors
   - Verify no excessive costs
   - Check KV storage growth

---

**That's it! Your URL shortener should now be fully tested and ready for production! 🚀**
