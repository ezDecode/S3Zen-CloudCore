# CloudCore Backend

A secure backend service for CloudCore - an S3 file manager with multi-bucket support and Supabase authentication.

## Features

### URL Shortening
- ✅ Shorten long URLs to short codes
- ✅ Redirect short URLs to original destinations
- ✅ SQLite storage for URL mappings

### Multi-Bucket Management (New)
- ✅ Supabase Auth integration (JWT validation)
- ✅ AES-256-GCM encrypted credential storage
- ✅ Row Level Security (RLS) for data isolation
- ✅ Multiple S3 buckets per user
- ✅ Default bucket auto-selection
- ✅ AWS HeadBucket validation before saving
- ✅ Credential encryption with unique IVs

### Security
- ✅ HTTPS enforcement in production
- ✅ Helmet security headers
- ✅ CORS with origin whitelist
- ✅ Rate limiting (general + auth-specific)
- ✅ Request body size limits
- ✅ Secure error logging (no plaintext secrets)

## Prerequisites

- Node.js 18+
- A Supabase project
- PostgreSQL (managed by Supabase)

## Installation

```bash
cd backend
npm install
```

## Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Supabase

1. Create a Supabase project at https://supabase.com
2. Get your project credentials from Settings > API
3. Add them to `.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Generate Encryption Key

Generate a secure 32-byte encryption key:

```bash
npm run generate:key
# Or manually: openssl rand -hex 32
```

Add to `.env`:

```env
ENCRYPTION_KEY=your-64-character-hex-key
```

**⚠️ IMPORTANT:** Store this key securely. If lost, all encrypted credentials become unrecoverable.

### 4. Run Database Migrations

Apply the SQL migrations to your Supabase database:

```bash
# Using Supabase CLI
npx supabase db push

# Or manually run in Supabase SQL Editor:
# backend/supabase/migrations/20241203000001_create_bucket_configurations.sql
```

## Running

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server starts on `http://localhost:3001` (or configured PORT).

## API Endpoints

### Health Check

```
GET /health
GET /health?detailed=true  # Include database status
```

### URL Shortening (Legacy)

```
POST /shorten              # Create short URL
GET  /s/:code              # Redirect to original URL
```

### Bucket Management (New)

All bucket endpoints require authentication via `Authorization: Bearer <token>`.

```
POST   /api/buckets              # Create bucket configuration
GET    /api/buckets              # List all buckets (metadata only)
GET    /api/buckets/default      # Get default bucket with credentials
GET    /api/buckets/:id          # Get bucket metadata
GET    /api/buckets/:id/credentials  # Get decrypted credentials
PUT    /api/buckets/:id          # Update bucket configuration
DELETE /api/buckets/:id          # Delete bucket configuration
POST   /api/buckets/validate     # Validate bucket access (no save)
```

See `docs/API.md` for complete API documentation.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
backend/
├── src/
│   ├── server.js           # Express app entry point
│   ├── config/
│   │   └── supabase.js     # Supabase client configuration
│   ├── middleware/
│   │   └── authMiddleware.js # JWT authentication
│   ├── routes/
│   │   ├── shortener.js    # URL shortening routes
│   │   └── buckets.js      # Bucket management routes
│   ├── services/
│   │   ├── encryptionService.js # AES-256-GCM encryption
│   │   └── bucketService.js     # Bucket database operations
│   └── utils/
├── supabase/
│   └── migrations/         # SQL migration files
├── tests/                  # Test files
├── docs/
│   └── API.md              # API documentation
└── data/                   # SQLite database (URL shortener)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Server port (default: 3001) |
| `BASE_URL` | No | Base URL for short URLs |
| `ALLOWED_ORIGINS` | No | CORS allowed origins (comma-separated) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `ENCRYPTION_KEY` | Yes | 64-character hex key for AES-256-GCM |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (default: 900000) |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |

## Security Considerations

### Encryption Key Management
- Generate with: `npm run generate:key`
- Never commit to version control
- Use secrets manager in production
- Rotate periodically using key rotation procedure

### Supabase Service Role Key
- Never expose to frontend
- Only used for backend admin operations
- Bypasses Row Level Security

### Credential Storage
- All AWS credentials encrypted with AES-256-GCM
- Unique IV per encryption operation
- Decryption only for authenticated bucket owners

## Database Schema

See `supabase/migrations/20241203000001_create_bucket_configurations.sql` for:
- `bucket_configurations` table schema
- RLS policies
- Indexes
- Triggers (single default, timestamp updates, cascade reassignment)

## API Endpoints

### 1. Create Short URL

**POST** `/shorten`

Request:
```json
{
  "longUrl": "https://example.com/some/very/long/path"
}
```

Response:
```json
{
  "shortUrl": "http://localhost:3001/s/abc123",
  "shortCode": "abc123"
}
```

### 2. Redirect Short URL

**GET** `/s/:code`

Redirects (302) to the original URL.

Example: `http://localhost:3001/s/abc123` → `https://example.com/some/very/long/path`

### 3. Health Check

**GET** `/health`

Response:
```json
{
  "status": "ok"
}
```

## URL Validation

The backend rejects:
- Invalid URLs (malformed)
- localhost URLs
- IP addresses (127.0.0.1, 192.168.x.x, etc.)
- IPv6 addresses

Only public HTTP/HTTPS URLs are accepted.

## Database

Uses SQLite with a single table:

```sql
CREATE TABLE shortlinks (
    code TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

Database file: `backend/src/db/shortlinks.db`

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Main server
│   ├── routes/
│   │   └── shortener.js       # URL shortening routes
│   ├── utils/
│   │   ├── idGen.js          # Short code generator
│   │   └── validateUrl.js    # URL validation
│   └── db/
│       └── shortlinks.db     # SQLite database (auto-created)
├── .env.example
├── package.json
└── README.md
```

## Testing

### Using curl

Create a short URL:
```bash
curl -X POST http://localhost:3001/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://github.com"}'
```

Test redirect:
```bash
curl -L http://localhost:3001/s/abc123
```

### Using browser

1. Create short URL via API
2. Visit `http://localhost:3001/s/abc123` in browser
3. Should redirect to original URL

## Dependencies

- `express` - Web framework
- `sqlite3` - Database
- `nanoid` - Short code generation
- `cors` - CORS support
- `dotenv` - Environment variables

## License

MIT
