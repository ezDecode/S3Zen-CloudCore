# CloudCore URL Shortener - System Architecture

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
└─────────────────────────────────────────────────────────────────────┘

    User opens file in CloudCore
            ↓
    Clicks "Share" button
            ↓
┌───────────────────────────┐
│      ShareModal.jsx       │
│                           │
│  [Toggle: Use Short URL]  │  ← User can enable/disable
│  [Expiry: 1 hour ▼]      │
│  [Generate Link]          │
└─────────────┬─────────────┘
              ↓
              
┌─────────────────────────────────────────────────────────────────────┐
│                     URL GENERATION PROCESS                           │
└─────────────────────────────────────────────────────────────────────┘

    handleGenerate() called
            ↓
    ┌─────────────────────────┐
    │  generateShareableLink  │  ← From s3Service.js
    │  (S3 SDK)               │
    └──────────┬──────────────┘
               ↓
    Generates S3 Presigned URL:
    https://s3.amazonaws.com/bucket/file?
    X-Amz-Algorithm=...&X-Amz-Credential=...
    &X-Amz-Signature=...&X-Amz-Expires=3600
               ↓
               │
        ┌──────┴──────┐
        │             │
   NO   │  Shortener  │  YES
   ◄────┤  Enabled?   ├────►
        │             │
        └─────────────┘
               │
               ↓                        ↓
    Display long URL         ┌──────────────────────┐
    (Presigned URL)          │  createShortUrl()    │  ← From urlShortener.js
    ✅ Done                  │                      │
                             └──────────┬───────────┘
                                        ↓
                                 POST Request to Worker:
                                 https://go.cloudcore.app/api/create
                                 Headers:
                                   X-CloudCore-API-Key: xxxxx
                                 Body:
                                   { longUrl, expirySeconds }
                                        ↓
                                        
┌───────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WORKER PROCESSING                       │
└───────────────────────────────────────────────────────────────────────┘

                            Worker receives request
                                      ↓
                            ┌──────────────────┐
                            │ Validate API Key │
                            └────────┬─────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Validate URL     │
                            │ - Check format   │
                            │ - Check scheme   │
                            │ - Check length   │
                            └────────┬─────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Generate Short ID│
                            │ Base62: aB3dEf9H │
                            └────────┬─────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Check collision  │  ← Lookup in KV
                            │ in KV storage    │
                            └────────┬─────────┘
                                     ↓
                            ┌──────────────────┐
                            │ Store in KV:     │
                            │ Key: aB3dEf9H    │
                            │ Value: {         │
                            │   longUrl,       │
                            │   createdAt,     │
                            │   expiresAt,     │
                            │   visits: 0      │
                            │ }                │
                            │ TTL: 3600s       │
                            └────────┬─────────┘
                                     ↓
                            Return to frontend:
                            {
                              "success": true,
                              "shortUrl": "https://go.cloudcore.app/s/aB3dEf9H",
                              "shortId": "aB3dEf9H",
                              "expiresIn": 3600
                            }
                                     ↓
                                     
┌───────────────────────────────────────────────────────────────────────┐
│                        DISPLAY TO USER                                │
└───────────────────────────────────────────────────────────────────────┘

                        Back to ShareModal
                              ↓
                    ┌─────────────────────┐
                    │ Shareable link:     │
                    │ [Short URL] badge   │
                    │ go.cloudcore.app/   │
                    │ s/aB3dEf9H          │
                    │                     │
                    │ [Copy Link] [Regen] │
                    └─────────────────────┘
                              ↓
                    User copies & shares!
                              ↓
                              
┌───────────────────────────────────────────────────────────────────────┐
│                      RECIPIENT FLOW                                   │
└───────────────────────────────────────────────────────────────────────┘

            Recipient receives link
            https://go.cloudcore.app/s/aB3dEf9H
                        ↓
            Opens link in browser
                        ↓
            GET https://go.cloudcore.app/s/aB3dEf9H
                        ↓
            ┌──────────────────────┐
            │  Cloudflare Worker   │
            │  - Lookup "aB3dEf9H" │  ← Read from KV
            │  - Increment visits  │  ← Update KV (async)
            │  - Get longUrl       │
            └──────────┬───────────┘
                       ↓
            302 Redirect to:
            https://s3.amazonaws.com/bucket/file?
            X-Amz-Algorithm=...&X-Amz-Signature=...
                       ↓
            ┌──────────────────────┐
            │   AWS S3 Download    │
            └──────────────────────┘
                       ↓
            File downloaded! ✅


═══════════════════════════════════════════════════════════════════════
                            COMPONENTS
═══════════════════════════════════════════════════════════════════════

┌─────────────────────┐
│   CloudCore React   │  Tech: Vite + React + AWS SDK
│   Frontend          │  Files: ShareModal.jsx, urlShortener.js
└──────────┬──────────┘
           │
           │ HTTPS + API Key Auth
           ↓
┌─────────────────────┐
│ Cloudflare Worker   │  Tech: JavaScript Worker
│ (Edge Functions)    │  File: url-shortener.js
└──────────┬──────────┘
           │
           │ Read/Write
           ↓
┌─────────────────────┐
│  Cloudflare KV      │  Tech: Distributed Key-Value Store
│  (Storage)          │  Namespace: SHORTLINKS
└─────────────────────┘


═══════════════════════════════════════════════════════════════════════
                         SECURITY LAYERS
═══════════════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────┐
│  Layer 1: API Key Authentication                       │
│  - X-CloudCore-API-Key header required                 │
│  - Stored as Cloudflare secret (encrypted)             │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Layer 2: CORS Protection                              │
│  - Origin allowlist                                    │
│  - Only authorized domains can create short URLs       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Layer 3: URL Validation                               │
│  - Scheme validation (https://, http://)               │
│  - Length limits (max 2048 chars)                      │
│  - Domain blocklist                                    │
│  - Open redirect prevention                            │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Layer 4: Rate Limiting                                │
│  - Cloudflare automatic DDoS protection                │
│  - Worker CPU limits                                   │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Layer 5: Automatic Expiry                             │
│  - TTL matches S3 presigned URL expiry                 │
│  - Max 30 days                                         │
│  - KV auto-deletes expired entries                     │
└────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════
                      DATA FLOW - EXAMPLE
═══════════════════════════════════════════════════════════════════════

Step 1: User generates share link
────────────────────────────────
    Input:
      File: "vacation-photo.jpg"
      Expiry: 3600 seconds (1 hour)
      
    S3 Output:
      https://s3.amazonaws.com/my-bucket/vacation-photo.jpg?
      X-Amz-Algorithm=AWS4-HMAC-SHA256&
      X-Amz-Credential=XXX&
      X-Amz-Date=20231124T000000Z&
      X-Amz-Expires=3600&
      X-Amz-Signature=abc123...
      
Step 2: Shortener processes
────────────────────────────
    Worker Input:
      POST /api/create
      {
        "longUrl": "https://s3.amazonaws.com/...",
        "expirySeconds": 3600
      }
      
    Worker Processing:
      1. Validate API key ✓
      2. Validate URL format ✓
      3. Generate ID: "xY7kPm3Q"
      4. Store in KV:
         {
           "longUrl": "https://s3.amazonaws.com/...",
           "shortId": "xY7kPm3Q",
           "createdAt": 1700000000000,
           "expiresAt": 1700003600000,
           "visits": 0
         }
      5. Set TTL: 3600 seconds
      
    Worker Output:
      {
        "success": true,
        "shortUrl": "https://go.cloudcore.app/s/xY7kPm3Q",
        "shortId": "xY7kPm3Q",
        "expiresIn": 3600
      }
      
Step 3: User shares
────────────────────
    Shared URL: https://go.cloudcore.app/s/xY7kPm3Q
    
Step 4: Recipient clicks
────────────────────────
    GET https://go.cloudcore.app/s/xY7kPm3Q
    ↓
    Worker:
      1. Lookup KV["xY7kPm3Q"] ✓
      2. Found! Get longUrl
      3. Increment visits: 0 → 1
      4. HTTP 302 Redirect
    ↓
    Browser redirected to:
      https://s3.amazonaws.com/my-bucket/vacation-photo.jpg?...
    ↓
    File downloads! ✓


═══════════════════════════════════════════════════════════════════════
                     SCALABILITY & PERFORMANCE
═══════════════════════════════════════════════════════════════════════

Global Edge Network:
┌──────────────┐
│   US East    │  Cloudflare has 300+ locations worldwide
├──────────────┤  Short URL redirects happen at nearest edge
│   US West    │  → Latency: <50ms typically
├──────────────┤
│   Europe     │  KV replication:
├──────────────┤  → Eventually consistent
│   Asia       │  → Writes: Global, Reads: Local
├──────────────┤
│   Australia  │
└──────────────┘

Performance Characteristics:
- Short URL redirect: ~10-50ms (edge processing)
- S3 download: Depends on file size & S3 region
- Concurrent requests: Scales automatically
- Cold start: None (Workers always warm)


═══════════════════════════════════════════════════════════════════════
                     MONITORING & ANALYTICS
═══════════════════════════════════════════════════════════════════════

Cloudflare Dashboard:
  ├─ Request count (daily/hourly)
  ├─ Error rate
  ├─ CPU usage
  ├─ Geographic distribution
  └─ Bandwidth usage

Worker Logs (wrangler tail):
  ├─ Real-time request logging
  ├─ Error stack traces
  ├─ Console.log output
  └─ Performance metrics

KV Analytics:
  ├─ Total keys stored
  ├─ Read/write operations
  ├─ Storage used
  └─ Individual key inspection

Visit Tracking (optional):
  Per short link:
    ├─ Total visits
    ├─ Last visit time
    ├─ Created date
    └─ Expiry date
```

**End of Architecture Diagram**

---

## Key Features Summary

✅ **Serverless** - No servers to manage  
✅ **Global** - 300+ edge locations  
✅ **Fast** - <50ms redirects  
✅ **Secure** - Multi-layer protection  
✅ **Scalable** - Auto-scales to millions  
✅ **Affordable** - Free tier for most  
✅ **Simple** - Single file Worker  
✅ **Reliable** - 99.99% uptime SLA  
✅ **Private** - Your infrastructure  
✅ **Integrated** - Seamless CloudCore integration
