# OpenMusic API

A RESTful API for managing music albums and songs, built with Node.js Hapi framework and PostgreSQL database.

## Features

- **🎵 Music Management**
  - Full CRUD operations for Albums
  - Full CRUD operations for Songs
  - Song searching by title and performer
  - Album-Song relationships (view songs associated with an album)

- **🔐 Authentication & Security**
  - User registration with unique username validation
  - Secure password hashing with bcrypt
  - JWT-based authentication (access & refresh tokens)
  - Token refresh mechanism for session management
  - Secure logout with token invalidation
  - Ready-to-use JWT strategy for protected routes

- **📝 Playlist Management** ✨ NEW
  - Create personal playlists
  - Add/remove songs to/from playlists
  - View playlist details with full song information
  - Owner-based access control and authorization
  - Automatic cascade deletion for data integrity
  - Duplicate song prevention per playlist

- **🛠️ Technical Features**
  - PostgreSQL database with migrations
  - Comprehensive error handling and data validation
  - RESTful API design
  - CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

3. Create a PostgreSQL database named `openmusic`:
   ```sql
   CREATE DATABASE openmusic;
   ```

4. Configure environment variables in `.env` file (see `.env.example`):
   ```
   HOST=localhost
   PORT=5000
   
   # Database
   PGUSER=postgres
   PGPASSWORD=your_password
   PGDATABASE=openmusic
   PGHOST=localhost
   PGPORT=5432
   
   # JWT Authentication (generate secure keys!)
   ACCESS_TOKEN_KEY=your_secret_access_token_key
   REFRESH_TOKEN_KEY=your_secret_refresh_token_key
   ACCESS_TOKEN_AGE=1800
   ```
   
   Generate secure keys for production:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. Run database migrations:
   ```
   npm run migrate up
   ```

## Running the Application

Start the server:
```
npm run start
```

The API will be available at `http://localhost:5000` (or your configured HOST and PORT).

## API Endpoints

### 🔐 Authentication (NEW!)

- **POST /users** - Register a new user
  - Body: `{ "username": "string", "password": "string", "fullname": "string" }`
  - Response: `{ "status": "success", "data": { "userId": "string" } }`

- **POST /authentications** - Login (get access & refresh tokens)
  - Body: `{ "username": "string", "password": "string" }`
  - Response: `{ "status": "success", "data": { "accessToken": "string", "refreshToken": "string" } }`

- **PUT /authentications** - Refresh access token
  - Body: `{ "refreshToken": "string" }`
  - Response: `{ "status": "success", "data": { "accessToken": "string" } }`

- **DELETE /authentications** - Logout (invalidate refresh token)
  - Body: `{ "refreshToken": "string" }`
  - Response: `{ "status": "success", "message": "Refresh token berhasil dihapus" }`

📖 **[View detailed authentication documentation →](./AUTHENTICATION.md)**

### 📝 Playlists (NEW! - Requires Authentication)

- **POST /playlists** - Create a new playlist
  - Auth: Required (JWT)
  - Body: `{ "name": "string" }`
  - Response: `{ "status": "success", "data": { "playlistId": "string" } }`

- **GET /playlists** - Get user's playlists
  - Auth: Required (JWT)
  - Response: `{ "status": "success", "data": { "playlists": [...] } }`

- **DELETE /playlists/{id}** - Delete a playlist (owner only)
  - Auth: Required (JWT)
  - Response: `{ "status": "success", "message": "Playlist berhasil dihapus" }`

- **POST /playlists/{id}/songs** - Add song to playlist (owner only)
  - Auth: Required (JWT)
  - Body: `{ "songId": "string" }`
  - Response: `{ "status": "success", "message": "Lagu berhasil ditambahkan ke playlist" }`

- **GET /playlists/{id}/songs** - Get playlist songs (owner only)
  - Auth: Required (JWT)
  - Response: `{ "status": "success", "data": { "playlist": {...} } }`

- **DELETE /playlists/{id}/songs** - Remove song from playlist (owner only)
  - Auth: Required (JWT)
  - Body: `{ "songId": "string" }`
  - Response: `{ "status": "success", "message": "Lagu berhasil dihapus dari playlist" }`

📖 **[View detailed playlist documentation →](./PLAYLISTS.md)**

### Albums

- **POST /albums** - Create a new album
  - Body: `{ "name": "string", "year": number }`
  - Response: `{ "status": "success", "data": { "albumId": "string" } }`

- **GET /albums/{id}** - Get album by ID (includes associated songs)
  - Response: `{ "status": "success", "data": { "album": {...} } }`

- **PUT /albums/{id}** - Update album by ID
  - Body: `{ "name": "string", "year": number }`
  - Response: `{ "status": "success", "message": "Album updated successfully" }`

- **DELETE /albums/{id}** - Delete album by ID
  - Response: `{ "status": "success", "message": "Album deleted successfully" }`

### Songs

- **POST /songs** - Create a new song
  - Body: `{ "title": "string", "year": number, "genre": "string", "performer": "string", "duration": number (optional), "albumId": "string" (optional) }`
  - Response: `{ "status": "success", "data": { "songId": "string" } }`

- **GET /songs** - Get all songs (supports query parameters)
  - Query params: `?title=string&performer=string`
  - Response: `{ "status": "success", "data": { "songs": [...] } }`

- **GET /songs/{id}** - Get song by ID
  - Response: `{ "status": "success", "data": { "song": {...} } }`

- **PUT /songs/{id}** - Update song by ID
  - Body: `{ "title": "string", "year": number, "genre": "string", "performer": "string", "duration": number (optional), "albumId": "string" (optional) }`
  - Response: `{ "status": "success", "message": "Song updated successfully" }`

- **DELETE /songs/{id}** - Delete song by ID
  - Response: `{ "status": "success", "message": "Song deleted successfully" }`

## Error Responses

- **400 Bad Request** - Validation error
  ```json
  { "status": "fail", "message": "Error message" }
  ```

- **404 Not Found** - Resource not found
  ```json
  { "status": "fail", "message": "Error message" }
  ```

- **500 Internal Server Error** - Server error
  ```json
  { "status": "error", "message": "An internal server error occurred" }
  ```

## Project Structure

```
├── migrations/                      # Database migrations
│   ├── *_create-table-albums.js
│   ├── *_create-table-songs.js
│   ├── *_create-table-users.js
│   ├── *_create-table-authentications.js
│   ├── *_create-table-playlists.js          # ✨ NEW
│   └── *_create-table-playlist-songs.js     # ✨ NEW
├── src/
│   ├── api/                         # API handlers and routes
│   │   ├── albums/
│   │   ├── songs/
│   │   ├── users/
│   │   ├── authentications/
│   │   └── playlists/               # ✨ NEW
│   ├── exceptions/                  # Custom error classes
│   │   ├── ClientError.js
│   │   ├── InvariantError.js
│   │   ├── NotFoundError.js
│   │   ├── AuthenticationError.js
│   │   └── AuthorizationError.js    # ✨ NEW
│   ├── services/                    # Business logic
│   │   ├── DatabaseService.js
│   │   ├── AlbumsService.js
│   │   ├── SongsService.js
│   │   ├── UsersService.js
│   │   ├── AuthenticationsService.js
│   │   └── PlaylistsService.js      # ✨ NEW
│   ├── tokenize/
│   │   └── TokenManager.js          # JWT token utilities
│   ├── validator/                   # Input validation
│   │   ├── albums.js
│   │   ├── songs.js
│   │   ├── users.js
│   │   ├── authentications.js
│   │   └── playlists.js             # ✨ NEW
│   └── server.js                    # Main server file
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── package.json
├── README.md
├── AUTHENTICATION.md                # Authentication API docs
├── PLAYLISTS.md                     # Playlist API docs ✨ NEW
├── TESTING_GUIDE.md                 # Quick testing guide
├── IMPLEMENTATION_SUMMARY.md        # Implementation details
└── ARCHITECTURE.md                  # Flow diagrams
```

## Database Migrations

Create a new migration:
```
npm run migrate create migration-name
```

Run migrations:
```
npm run migrate up
```

Rollback migrations:
```
npm run migrate down
```

## Technologies Used

- **Framework**: Hapi.js v21+
- **Database**: PostgreSQL
- **Migration Tool**: node-pg-migrate
- **Environment Variables**: dotenv
- **ID Generation**: nanoid
- **Authentication**: @hapi/jwt
- **Password Hashing**: bcrypt

## 📚 Documentation

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete authentication API reference
- **[PLAYLISTS.md](./PLAYLISTS.md)** - Complete playlist management API reference ✨ NEW
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Step-by-step testing instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Detailed implementation overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Authentication flow diagrams
- **[API_TESTING.md](./API_TESTING.md)** - API testing examples
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database configuration guide

## 🚀 Quick Start for Authentication

1. **Setup environment** (see `.env.example`)
2. **Run migrations**: `npm run migrate up`
3. **Start server**: `npm start`
4. **Register user**: `POST /users`
5. **Login**: `POST /authentications`
6. **Use tokens** for protected routes!

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed examples.

## 🔒 Protecting Routes with JWT

To protect any route, add the JWT auth strategy:

```javascript
{
  method: 'GET',
  path: '/playlists',
  handler: handler.getPlaylistsHandler,
  options: {
    auth: 'openmusic_jwt',  // Require authentication
  },
}
```

Access user ID in handlers:
```javascript
const { userId } = request.auth.credentials;
```

## License

ISC
