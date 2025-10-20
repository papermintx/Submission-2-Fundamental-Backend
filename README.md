# OpenMusic API - Submission Backend Fundamental# OpenMusic API



Backend API untuk aplikasi music catalog dengan fitur authentication, playlist management, dan collaboration.A RESTful API for managing music albums and songs, built with Node.js Hapi framework and PostgreSQL database.



## Tech Stack## Features



- **Runtime:** Node.js- **🎵 Music Management**

- **Framework:** Hapi.js v21  - Full CRUD operations for Albums

- **Database:** PostgreSQL  - Full CRUD operations for Songs

- **Authentication:** JWT (@hapi/jwt)  - Song searching by title and performer

- **Password Hashing:** bcrypt  - Album-Song relationships (view songs associated with an album)

- **Migration:** node-pg-migrate

- **Environment:** dotenv- **🔐 Authentication & Security**

  - User registration with unique username validation

## Features  - Secure password hashing with bcrypt

  - JWT-based authentication (access & refresh tokens)

### Core Features  - Token refresh mechanism for session management

- ✅ Albums Management (CRUD)  - Secure logout with token invalidation

- ✅ Songs Management (CRUD)   - Ready-to-use JWT strategy for protected routes

- ✅ User Registration

- ✅ JWT Authentication (Login, Refresh Token, Logout)- **📝 Playlist Management** ✨ NEW

- ✅ Playlist Management (CRUD)  - Create personal playlists

- ✅ Playlist Songs Management  - Add/remove songs to/from playlists

- ✅ Playlist Collaboration (Optional)  - View playlist details with full song information

  - Owner-based access control and authorization

## Kriteria Submission  - Automatic cascade deletion for data integrity

  - Duplicate song prevention per playlist

### ✅ Kriteria Wajib

- **🛠️ Technical Features**

#### 1. Registrasi dan Autentikasi Pengguna  - PostgreSQL database with migrations

- [x] POST /users - Register user baru  - Comprehensive error handling and data validation

- [x] POST /authentications - Login (generate access & refresh token)  - RESTful API design

- [x] PUT /authentications - Refresh access token  - CORS enabled

- [x] DELETE /authentications - Logout (hapus refresh token)

- [x] Password hashing dengan bcrypt## Prerequisites

- [x] JWT authentication dengan @hapi/jwt

- Node.js (v14 or higher)

#### 2. Mengelola Playlist- PostgreSQL (v12 or higher)

- [x] POST /playlists - Buat playlist (auth required)- npm

- [x] GET /playlists - Lihat daftar playlist milik user (auth required)

- [x] DELETE /playlists/{id} - Hapus playlist (owner only)## Installation

- [x] POST /playlists/{id}/songs - Tambah lagu ke playlist (owner/collaborator)

- [x] GET /playlists/{id}/songs - Lihat lagu dalam playlist (owner/collaborator)1. Clone this repository

- [x] DELETE /playlists/{id}/songs - Hapus lagu dari playlist (owner/collaborator)2. Install dependencies:

   ```

#### 3. Foreign Key   npm install

- [x] songs.album_id → albums.id (ON DELETE CASCADE)   ```

- [x] playlists.owner → users.id (ON DELETE CASCADE)

- [x] playlist_songs.playlist_id → playlists.id (ON DELETE CASCADE)3. Create a PostgreSQL database named `openmusic`:

- [x] playlist_songs.song_id → songs.id (ON DELETE CASCADE)   ```sql

- [x] collaborations.playlist_id → playlists.id (ON DELETE CASCADE)   CREATE DATABASE openmusic;

- [x] collaborations.user_id → users.id (ON DELETE CASCADE)   ```



#### 4. Data Validation4. Configure environment variables in `.env` file (see `.env.example`):

- [x] POST /users: username, password, fullname (string, required)   ```

- [x] POST /authentications: username, password (string, required)   HOST=localhost

- [x] PUT /authentications: refreshToken (string, required)   PORT=5000

- [x] DELETE /authentications: refreshToken (string, required)   

- [x] POST /playlists: name (string, required)   # Database

- [x] POST /playlists/{id}/songs: songId (string, required)   PGUSER=postgres

   PGPASSWORD=your_password

#### 5. Error Handling   PGDATABASE=openmusic

- [x] 400 - Validasi gagal (status: fail)   PGHOST=localhost

- [x] 401 - Akses tanpa token (status: fail)   PGPORT=5432

- [x] 403 - Akses resource bukan miliknya (status: fail)   

- [x] 404 - Resource tidak ditemukan (status: fail)   # JWT Authentication (generate secure keys!)

- [x] 500 - Server error (status: error)   ACCESS_TOKEN_KEY=your_secret_access_token_key

   REFRESH_TOKEN_KEY=your_secret_refresh_token_key

### ✅ Kriteria Opsional   ACCESS_TOKEN_AGE=1800

   ```

#### Opsional 1: Playlist Collaboration   

- [x] POST /collaborations - Tambah kolaborator (owner only)   Generate secure keys for production:

- [x] DELETE /collaborations - Hapus kolaborator (owner only)   ```bash

- [x] GET /playlists mengembalikan playlist owned + collaborated (UNION)   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

- [x] Kolaborator dapat mengelola lagu dalam playlist   ```



## Database Schema5. Run database migrations:

   ```

```   npm run migrate up

users (id, username, password, fullname)   ```

authentications (token)

albums (id, name, year)## Running the Application

songs (id, title, year, genre, performer, duration, album_id)

playlists (id, name, owner)Start the server:

playlist_songs (id, playlist_id, song_id)```

collaborations (id, playlist_id, user_id)npm run start

``````



## InstallationThe API will be available at `http://localhost:5000` (or your configured HOST and PORT).



1. **Clone repository**## API Endpoints

```bash

git clone <repository-url>### 🔐 Authentication (NEW!)

cd Submission-1-Fundamental-Backend-main

```- **POST /users** - Register a new user

  - Body: `{ "username": "string", "password": "string", "fullname": "string" }`

2. **Install dependencies**  - Response: `{ "status": "success", "data": { "userId": "string" } }`

```bash

npm install- **POST /authentications** - Login (get access & refresh tokens)

```  - Body: `{ "username": "string", "password": "string" }`

  - Response: `{ "status": "success", "data": { "accessToken": "string", "refreshToken": "string" } }`

3. **Setup database**

```bash- **PUT /authentications** - Refresh access token

# Create database  - Body: `{ "refreshToken": "string" }`

createdb openmusic  - Response: `{ "status": "success", "data": { "accessToken": "string" } }`



# Copy environment file- **DELETE /authentications** - Logout (invalidate refresh token)

cp .env.example .env  - Body: `{ "refreshToken": "string" }`

  - Response: `{ "status": "success", "message": "Refresh token berhasil dihapus" }`

# Edit .env and set:

# - DATABASE_URL📖 **[View detailed authentication documentation →](./AUTHENTICATION.md)**

# - ACCESS_TOKEN_KEY (generate random: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# - REFRESH_TOKEN_KEY (generate random)### 📝 Playlists (NEW! - Requires Authentication)

```

- **POST /playlists** - Create a new playlist

4. **Run migrations**  - Auth: Required (JWT)

```bash  - Body: `{ "name": "string" }`

npm run migrate up  - Response: `{ "status": "success", "data": { "playlistId": "string" } }`

```

- **GET /playlists** - Get user's playlists

5. **Start server**  - Auth: Required (JWT)

```bash  - Response: `{ "status": "success", "data": { "playlists": [...] } }`

npm start

```- **DELETE /playlists/{id}** - Delete a playlist (owner only)

  - Auth: Required (JWT)

Server akan berjalan di `http://localhost:5000`  - Response: `{ "status": "success", "message": "Playlist berhasil dihapus" }`



## API Endpoints- **POST /playlists/{id}/songs** - Add song to playlist (owner only)

  - Auth: Required (JWT)

### Users  - Body: `{ "songId": "string" }`

- `POST /users` - Register  - Response: `{ "status": "success", "message": "Lagu berhasil ditambahkan ke playlist" }`



### Authentication- **GET /playlists/{id}/songs** - Get playlist songs (owner only)

- `POST /authentications` - Login  - Auth: Required (JWT)

- `PUT /authentications` - Refresh token  - Response: `{ "status": "success", "data": { "playlist": {...} } }`

- `DELETE /authentications` - Logout

- **DELETE /playlists/{id}/songs** - Remove song from playlist (owner only)

### Albums  - Auth: Required (JWT)

- `POST /albums` - Create  - Body: `{ "songId": "string" }`

- `GET /albums` - Get all  - Response: `{ "status": "success", "message": "Lagu berhasil dihapus dari playlist" }`

- `GET /albums/{id}` - Get by ID

- `PUT /albums/{id}` - Update📖 **[View detailed playlist documentation →](./PLAYLISTS.md)**

- `DELETE /albums/{id}` - Delete

### Albums

### Songs

- `POST /songs` - Create- **POST /albums** - Create a new album

- `GET /songs` - Get all (optional query: title, performer)  - Body: `{ "name": "string", "year": number }`

- `GET /songs/{id}` - Get by ID  - Response: `{ "status": "success", "data": { "albumId": "string" } }`

- `PUT /songs/{id}` - Update

- `DELETE /songs/{id}` - Delete- **GET /albums/{id}** - Get album by ID (includes associated songs)

  - Response: `{ "status": "success", "data": { "album": {...} } }`

### Playlists (Auth Required)

- `POST /playlists` - Create- **PUT /albums/{id}** - Update album by ID

- `GET /playlists` - Get owned + collaborated playlists  - Body: `{ "name": "string", "year": number }`

- `DELETE /playlists/{id}` - Delete (owner only)  - Response: `{ "status": "success", "message": "Album updated successfully" }`

- `POST /playlists/{id}/songs` - Add song (owner/collaborator)

- `GET /playlists/{id}/songs` - Get songs (owner/collaborator)- **DELETE /albums/{id}** - Delete album by ID

- `DELETE /playlists/{id}/songs` - Remove song (owner/collaborator)  - Response: `{ "status": "success", "message": "Album deleted successfully" }`



### Collaborations (Auth Required)### Songs

- `POST /collaborations` - Add collaborator (owner only)

- `DELETE /collaborations` - Remove collaborator (owner only)- **POST /songs** - Create a new song

  - Body: `{ "title": "string", "year": number, "genre": "string", "performer": "string", "duration": number (optional), "albumId": "string" (optional) }`

## Project Structure  - Response: `{ "status": "success", "data": { "songId": "string" } }`



```- **GET /songs** - Get all songs (supports query parameters)

migrations/          # Database migrations  - Query params: `?title=string&performer=string`

src/  - Response: `{ "status": "success", "data": { "songs": [...] } }`

  ├── api/          # Route handlers

  │   ├── albums/- **GET /songs/{id}** - Get song by ID

  │   ├── songs/  - Response: `{ "status": "success", "data": { "song": {...} } }`

  │   ├── users/

  │   ├── authentications/- **PUT /songs/{id}** - Update song by ID

  │   ├── playlists/  - Body: `{ "title": "string", "year": number, "genre": "string", "performer": "string", "duration": number (optional), "albumId": "string" (optional) }`

  │   └── collaborations/  - Response: `{ "status": "success", "message": "Song updated successfully" }`

  ├── services/     # Business logic

  ├── validator/    # Payload validation- **DELETE /songs/{id}** - Delete song by ID

  ├── exceptions/   # Custom error classes  - Response: `{ "status": "success", "message": "Song deleted successfully" }`

  ├── tokenize/     # JWT token manager

  └── server.js     # Main server## Error Responses

```

- **400 Bad Request** - Validation error

## Testing  ```json

  { "status": "fail", "message": "Error message" }

### Manual Testing  ```

```bash

# Register user- **404 Not Found** - Resource not found

POST /users  ```json

{  { "status": "fail", "message": "Error message" }

  "username": "testuser",  ```

  "password": "secret123",

  "fullname": "Test User"- **500 Internal Server Error** - Server error

}  ```json

  { "status": "error", "message": "An internal server error occurred" }

# Login  ```

POST /authentications

{## Project Structure

  "username": "testuser",

  "password": "secret123"```

}├── migrations/                      # Database migrations

# Save accessToken from response│   ├── *_create-table-albums.js

│   ├── *_create-table-songs.js

# Create playlist│   ├── *_create-table-users.js

POST /playlists│   ├── *_create-table-authentications.js

Authorization: Bearer {accessToken}│   ├── *_create-table-playlists.js          # ✨ NEW

{│   └── *_create-table-playlist-songs.js     # ✨ NEW

  "name": "My Playlist"├── src/

}│   ├── api/                         # API handlers and routes

│   │   ├── albums/

# Add song to playlist│   │   ├── songs/

POST /playlists/{playlistId}/songs│   │   ├── users/

Authorization: Bearer {accessToken}│   │   ├── authentications/

{│   │   └── playlists/               # ✨ NEW

  "songId": "song-xxx"│   ├── exceptions/                  # Custom error classes

}│   │   ├── ClientError.js

```│   │   ├── InvariantError.js

│   │   ├── NotFoundError.js

## Environment Variables│   │   ├── AuthenticationError.js

│   │   └── AuthorizationError.js    # ✨ NEW

```env│   ├── services/                    # Business logic

# Server│   │   ├── DatabaseService.js

HOST=localhost│   │   ├── AlbumsService.js

PORT=5000│   │   ├── SongsService.js

│   │   ├── UsersService.js

# PostgreSQL│   │   ├── AuthenticationsService.js

PGHOST=localhost│   │   └── PlaylistsService.js      # ✨ NEW

PGPORT=5432│   ├── tokenize/

PGUSER=postgres│   │   └── TokenManager.js          # JWT token utilities

PGPASSWORD=yourpassword│   ├── validator/                   # Input validation

PGDATABASE=openmusic│   │   ├── albums.js

│   │   ├── songs.js

# JWT│   │   ├── users.js

ACCESS_TOKEN_KEY=your-secret-access-key│   │   ├── authentications.js

REFRESH_TOKEN_KEY=your-secret-refresh-key│   │   └── playlists.js             # ✨ NEW

ACCESS_TOKEN_AGE=1800│   └── server.js                    # Main server file

```├── .env                             # Environment variables

├── .env.example                     # Environment template

## Scripts├── package.json

├── README.md

```bash├── AUTHENTICATION.md                # Authentication API docs

npm start              # Start server├── PLAYLISTS.md                     # Playlist API docs ✨ NEW

npm run migrate up     # Run migrations├── TESTING_GUIDE.md                 # Quick testing guide

npm run migrate down   # Rollback migrations├── IMPLEMENTATION_SUMMARY.md        # Implementation details

```└── ARCHITECTURE.md                  # Flow diagrams

```

## Error Response Format

## Database Migrations

### Client Errors (4xx)

```jsonCreate a new migration:

{```

  "status": "fail",npm run migrate create migration-name

  "message": "Error message"```

}

```Run migrations:

```

### Server Errors (5xx)npm run migrate up

```json```

{

  "status": "error",Rollback migrations:

  "message": "An internal server error occurred"```

}npm run migrate down

``````



## License## Technologies Used



ISC- **Framework**: Hapi.js v21+

- **Database**: PostgreSQL

## Author- **Migration Tool**: node-pg-migrate

- **Environment Variables**: dotenv

Muhamad Muslih- **ID Generation**: nanoid

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
