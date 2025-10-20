# OpenMusic API - Requirements Checklist

## ✅ Core Requirements

### 1. Framework
- ✅ **Using Hapi.js framework** (Node.js Hapi framework as specified)
- ✅ No other frameworks used (only Hapi is allowed per requirements)

### 2. Server Configuration
- ✅ **npm run start** script configured in package.json
- ✅ **HOST environment variable** used for server host configuration
- ✅ **PORT environment variable** used for server port configuration
- Location: `src/server.js` lines 11-19

### 3. Album CRUD Operations
- ✅ **POST /albums** - Create album
  - Requires: name (string), year (number)
  - Returns: `{"status": "success", "data": {"albumId": "..."}}`
  
- ✅ **GET /albums/{id}** - Read album by ID
  - Returns: `{"status": "success", "data": {"album": {...}}}`
  
- ✅ **PUT /albums/{id}** - Update album by ID
  - Requires: name (string), year (number)
  - Returns: `{"status": "success", "message": "Album updated successfully"}`
  
- ✅ **DELETE /albums/{id}** - Delete album by ID
  - Returns: `{"status": "success", "message": "Album deleted successfully"}`

### 4. Song CRUD Operations
- ✅ **POST /songs** - Create song
  - Required: title (string), year (number), genre (string), performer (string)
  - Optional: duration (number), albumId (string)
  - Returns: `{"status": "success", "data": {"songId": "..."}}`
  
- ✅ **GET /songs** - Read all songs
  - Returns: `{"status": "success", "data": {"songs": [...]}}`
  
- ✅ **GET /songs/{id}** - Read song by ID
  - Returns: `{"status": "success", "data": {"song": {...}}}`
  
- ✅ **PUT /songs/{id}** - Update song by ID
  - Required: title, year, genre, performer
  - Optional: duration, albumId
  - Returns: `{"status": "success", "message": "Song updated successfully"}`
  
- ✅ **DELETE /songs/{id}** - Delete song by ID
  - Returns: `{"status": "success", "message": "Song deleted successfully"}`

### 5. Response Format
- ✅ **Success responses** use `{"status": "success", "data": {...}}` format
- ✅ **Success messages** use `{"status": "success", "message": "..."}`
- ✅ All messages are non-empty strings

### 6. Database - PostgreSQL
- ✅ **PostgreSQL database** used for data persistence
- ✅ **Raw SQL commands** only (no ORMs)
- ✅ Using **pg** module for database connections
- ✅ Database service: `src/services/DatabaseService.js`

### 7. Database Migrations
- ✅ **node-pg-migrate** used for migrations
- ✅ Migration files in `migrations/` directory
- ✅ Albums table migration: `migrations/*_create-table-albums.js`
- ✅ Songs table migration: `migrations/*_create-table-songs.js`

### 8. Environment Variables (.env)
- ✅ **PGUSER** - PostgreSQL username
- ✅ **PGPASSWORD** - PostgreSQL password
- ✅ **PGDATABASE** - Database name
- ✅ **PGHOST** - Database host
- ✅ **PGPORT** - Database port
- ✅ Using **dotenv** package to load variables

### 9. Data Validation

#### Album Validation (POST/PUT /albums)
- ✅ **name** (required, string, non-empty)
- ✅ **year** (required, number)
- Location: `src/validator/albums.js`

#### Song Validation (POST/PUT /songs)
- ✅ **title** (required, string, non-empty)
- ✅ **year** (required, number)
- ✅ **genre** (required, string, non-empty)
- ✅ **performer** (required, string, non-empty)
- ✅ **duration** (optional, number)
- ✅ **albumId** (optional, string)
- Location: `src/validator/songs.js`

### 10. Error Handling

- ✅ **400 Bad Request** - Validation failures
  - Format: `{"status": "fail", "message": "..."}`
  - Examples: Missing required fields, invalid data types
  
- ✅ **404 Not Found** - Resource not found
  - Format: `{"status": "fail", "message": "..."}`
  - Examples: Album not found, Song not found
  
- ✅ **500 Internal Server Error** - Server errors
  - Format: `{"status": "error", "message": "..."}`
  - All unexpected errors handled
  
- Location: `src/server.js` (onPreResponse extension)

## ✅ Optional Features

### 1. Album-Song Relationship
- ✅ **GET /albums/{id}** returns album with embedded songs array
- ✅ Format: `{"id": "...", "name": "...", "year": ..., "songs": [{"id": "...", "title": "...", "performer": "..."}, ...]}`
- ✅ Songs show id, title, and performer only
- Location: `src/services/AlbumsService.js` - getAlbumById method

### 2. Song Search Functionality
- ✅ **GET /songs?title=...** - Search by song title
- ✅ **GET /songs?performer=...** - Search by performer
- ✅ **GET /songs?title=...&performer=...** - Combined search (both parameters)
- ✅ Case-insensitive search using ILIKE
- ✅ Partial matching supported
- Location: `src/services/SongsService.js` - getSongs method

## 📁 Project Structure

```
openmusic-api/
├── migrations/                          # Database migrations
│   ├── *_create-table-albums.js        # Albums table
│   └── *_create-table-songs.js         # Songs table
├── src/
│   ├── api/                            # API layer
│   │   ├── albums/
│   │   │   ├── handler.js             # Album request handlers
│   │   │   └── routes.js              # Album routes
│   │   └── songs/
│   │       ├── handler.js             # Song request handlers
│   │       └── routes.js              # Song routes
│   ├── exceptions/                     # Custom error classes
│   │   ├── ClientError.js             # Base client error
│   │   ├── InvariantError.js          # Validation error (400)
│   │   └── NotFoundError.js           # Not found error (404)
│   ├── services/                       # Business logic
│   │   ├── DatabaseService.js         # Database connection
│   │   ├── AlbumsService.js           # Album business logic
│   │   └── SongsService.js            # Song business logic
│   ├── validator/                      # Input validation
│   │   ├── albums.js                  # Album validation
│   │   └── songs.js                   # Song validation
│   └── server.js                       # Main server file
├── .env                                # Environment variables
├── .gitignore                          # Git ignore file
├── package.json                        # Dependencies & scripts
├── README.md                           # Main documentation
├── DATABASE_SETUP.md                   # Database setup guide
├── API_TESTING.md                      # API testing guide
└── EXAMPLES.md                         # Complete examples

```

## 🔧 Technologies Used

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime environment | v14+ |
| @hapi/hapi | Web framework | ^21.4.3 |
| pg | PostgreSQL client | ^8.16.3 |
| node-pg-migrate | Database migrations | ^8.0.3 |
| dotenv | Environment variables | ^17.2.3 |
| nanoid | ID generation | ^3.3.11 |

## 🗄️ Database Schema

### Albums Table
```sql
CREATE TABLE albums (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### Songs Table
```sql
CREATE TABLE songs (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    performer TEXT NOT NULL,
    duration INTEGER,
    album_id VARCHAR(50) REFERENCES albums(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

## 🎯 Key Implementation Details

### 1. Raw SQL Queries
All database operations use raw SQL queries via the pg module:
- `INSERT` for creating records
- `SELECT` for reading records
- `UPDATE` for modifying records
- `DELETE` for removing records
- No ORM frameworks used

### 2. ID Generation
- Using `nanoid` for unique ID generation
- Format: `album-{16-char-random}` or `song-{16-char-random}`

### 3. Foreign Key Relationship
- Songs table has `album_id` foreign key referencing albums
- CASCADE delete: deleting an album deletes its songs
- Optional relationship: songs can exist without an album

### 4. Error Flow
1. Validation errors → `InvariantError` → 400 response
2. Resource not found → `NotFoundError` → 404 response
3. Unexpected errors → Server error → 500 response
4. All errors caught by Hapi's `onPreResponse` extension

### 5. Search Implementation
- Case-insensitive: Uses PostgreSQL `ILIKE`
- Partial matching: Uses `%pattern%` wildcard
- Multiple filters: Combined with SQL `AND`
- Dynamic query building based on provided parameters

## ✅ All Requirements Met

This implementation fulfills **ALL** core requirements and **BOTH** optional features:

1. ✅ Hapi framework only
2. ✅ npm run start with HOST/PORT env vars
3. ✅ Full Album CRUD
4. ✅ Full Song CRUD
5. ✅ Correct response formats
6. ✅ PostgreSQL with raw SQL
7. ✅ node-pg-migrate migrations
8. ✅ dotenv for credentials
9. ✅ Strict data validation
10. ✅ Comprehensive error handling
11. ✅ Album-Song relationship in GET /albums/{id}
12. ✅ Song search with ?title and ?performer

## 🚀 Quick Start

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Setup database:**
   - Create PostgreSQL database: `openmusic`
   - Update `.env` with your credentials

3. **Run migrations:**
   ```
   npm run migrate up
   ```

4. **Start server:**
   ```
   npm run start
   ```

5. **Test the API:**
   - See `API_TESTING.md` for test commands
   - See `EXAMPLES.md` for complete workflows

## 📝 Notes

- All data is persisted in PostgreSQL database
- No in-memory storage used
- CORS enabled for cross-origin requests
- Timestamps automatically managed
- Foreign key constraints enforced at database level
- Comprehensive error messages for debugging
