# CloudCore URL Shortener Backend

A minimal, clean URL shortener backend with zero AWS dependencies.

## Features

- ✅ Shorten long URLs to short codes
- ✅ Redirect short URLs to original destinations
- ✅ SQLite storage (no external database needed)
- ✅ URL validation (rejects localhost/IP addresses)
- ✅ 6-character short codes using nanoid
- ❌ No AWS, no S3, no credentials
- ❌ No authentication or user system
- ❌ No teams, roles, or invites

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3001
BASE_URL=http://localhost:3001
```

## Running

```bash
npm start
```

Server will start on `http://localhost:3001`

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
