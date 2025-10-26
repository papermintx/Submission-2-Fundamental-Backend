# OpenMusic API

Backend API untuk aplikasi music catalog dengan fitur authentication, playlist management, collaboration, export playlist, album cover upload, album likes, dan server-side caching.

## 🚀 Features

- **Music Management** - CRUD operations untuk Albums & Songs
- **Authentication** - JWT-based auth dengan access & refresh tokens
- **Playlist Management** - Create, manage playlists dengan collaboration support
- **Export Playlist** - Export playlist ke email menggunakan RabbitMQ
- **Album Covers** - Upload album cover dengan validasi (max 500KB)
- **Album Likes** - Like/unlike album dengan Redis caching
- **Server-Side Cache** - Redis cache dengan TTL 30 menit untuk performa optimal

## 📋 Tech Stack

- **Runtime:** Node.js v14+
- **Framework:** Hapi.js v21
- **Database:** PostgreSQL v12+
- **Authentication:** JWT (@hapi/jwt)
- **Password Hashing:** bcrypt
- **Message Queue:** RabbitMQ
- **Cache:** Redis/Memurai
- **Migration:** node-pg-migrate

## 🛠️ Prerequisites

Before installation, make sure you have:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Redis/Memurai (for caching)
- RabbitMQ (for export playlist feature)

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Submission-2-Fundamental-Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup PostgreSQL Database
```bash
# Create database
createdb openmusic

# Or via psql
psql -U postgres
CREATE DATABASE openmusic;
\q
```

### 4. Setup Redis

**Option 1: Memurai (Windows - Recommended)**
```bash
# Download dari: https://www.memurai.com/get-memurai
# Install dan akan otomatis running sebagai Windows Service

# Start service
net start Memurai

# Test connection
memurai-cli ping
```

**Option 2: Docker (Cross-platform)**
```bash
# Pull dan jalankan Redis
docker run -d --name redis -p 6379:6379 redis:latest

# Start/Stop
docker start redis
docker stop redis
```

**Option 3: WSL2**
```bash
sudo apt update
sudo apt install redis-server -y
sudo service redis-server start
redis-cli ping
```

### 5. Setup RabbitMQ

**Option 1: Install Langsung (Windows)**
```bash
# 1. Install Erlang dari: https://www.erlang.org/downloads
# 2. Install RabbitMQ dari: https://www.rabbitmq.com/install-windows.html
# 3. Enable Management Plugin (Command Prompt as Admin):

cd "C:\Program Files\RabbitMQ Server\rabbitmq_server-x.x.x\sbin"
rabbitmq-plugins enable rabbitmq_management

# 4. Restart Service
net stop RabbitMQ
net start RabbitMQ

# 5. Access Web UI: http://localhost:15672
# Username: guest
# Password: guest
```

**Option 2: Docker (Recommended)**
```bash
# Pull dan jalankan RabbitMQ dengan Management UI
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# Start/Stop
docker start rabbitmq
docker stop rabbitmq

# Access Web UI: http://localhost:15672
```

### 6. Configure Environment Variables

Create `.env` file:
```env
# Server Configuration
HOST=localhost
PORT=5000

# PostgreSQL Configuration
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=openmusic
PGHOST=localhost
PGPORT=5432

# JWT Token Configuration
ACCESS_TOKEN_KEY=generate_random_key_here
REFRESH_TOKEN_KEY=generate_random_key_here
ACCESS_TOKEN_AGE=1800

# RabbitMQ Configuration
RABBITMQ_SERVER=amqp://localhost

# SMTP Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis Configuration
REDIS_SERVER=localhost
```

**Generate secure JWT keys:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Setup Gmail App Password:**
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy 16-character password ke `SMTP_PASSWORD`

### 7. Run Database Migrations
```bash
npm run migrate up
```

### 8. Start Application

**Terminal 1 - API Server:**
```bash
npm run start
```

**Terminal 2 - Consumer (Export Playlist):**
```bash
cd consumer
npm install
npm run start
```

Server akan berjalan di `http://localhost:5000`

## 🧪 Testing

### Test Redis Connection
```bash
node test-redis.js
```

Expected output:
```
✅ Redis connected successfully
✅ Redis is ready
✅ Cache SET successful
✅ Cache GET successful: 10
✅ Cache TTL: 1799 seconds remaining
```

### Test RabbitMQ Connection
```bash
node test-rabbitmq.js
```

Expected output:
```
✅ RabbitMQ connected successfully!
```

## 🔗 API Endpoints

### Authentication
- `POST /users` - Register user
- `POST /authentications` - Login
- `PUT /authentications` - Refresh token
- `DELETE /authentications` - Logout

### Albums
- `POST /albums` - Create album
- `GET /albums/{id}` - Get album by ID
- `PUT /albums/{id}` - Update album
- `DELETE /albums/{id}` - Delete album
- `POST /albums/{id}/covers` - Upload album cover (max 500KB)
- `POST /albums/{id}/likes` - Like album (auth required)
- `DELETE /albums/{id}/likes` - Unlike album (auth required)
- `GET /albums/{id}/likes` - Get likes count (with Redis cache)

### Songs
- `POST /songs` - Create song
- `GET /songs` - Get all songs (supports query: title, performer)
- `GET /songs/{id}` - Get song by ID
- `PUT /songs/{id}` - Update song
- `DELETE /songs/{id}` - Delete song

### Playlists (Auth Required)
- `POST /playlists` - Create playlist
- `GET /playlists` - Get user's playlists
- `DELETE /playlists/{id}` - Delete playlist (owner only)
- `POST /playlists/{id}/songs` - Add song to playlist
- `GET /playlists/{id}/songs` - Get playlist songs
- `DELETE /playlists/{id}/songs` - Remove song from playlist

### Collaborations (Auth Required)
- `POST /collaborations` - Add collaborator (owner only)
- `DELETE /collaborations` - Remove collaborator (owner only)

### Export (Auth Required)
- `POST /export/playlists/{id}` - Export playlist to email

## 📊 Database Schema

```
users (id, username, password, fullname)
authentications (token)
albums (id, name, year, cover_url)
songs (id, title, year, genre, performer, duration, album_id)
playlists (id, name, owner)
playlist_songs (id, playlist_id, song_id)
playlist_activities (id, playlist_id, song_id, user_id, action, time)
collaborations (id, playlist_id, user_id)
user_album_likes (id, user_id, album_id)
```

## 🗂️ Project Structure

```
├── consumer/                        # Consumer untuk export playlist
│   ├── src/
│   │   ├── consumer.js             # Main consumer
│   │   ├── listener.js             # Message listener
│   │   ├── MailSender.js           # Email service
│   │   └── PlaylistsService.js    # Playlist service
│   └── package.json
├── migrations/                      # Database migrations
├── src/
│   ├── api/                         # API routes & handlers
│   │   ├── albums/
│   │   ├── songs/
│   │   ├── users/
│   │   ├── authentications/
│   │   ├── playlists/
│   │   ├── collaborations/
│   │   └── exports/
│   ├── services/                    # Business logic
│   │   ├── AlbumsService.js
│   │   ├── SongsService.js
│   │   ├── PlaylistsService.js
│   │   ├── rabbitmq/
│   │   │   └── ProducerService.js  # RabbitMQ producer
│   │   └── redis/
│   │       └── RedisService.js     # Redis cache service
│   ├── validator/                   # Input validation
│   ├── exceptions/                  # Custom error classes
│   ├── tokenize/                    # JWT utilities
│   └── server.js                    # Main server
├── uploads/                         # Album cover uploads
├── .env                             # Environment variables
├── test-redis.js                    # Redis connection test
├── test-rabbitmq.js                 # RabbitMQ connection test
└── README.md
```

## 🎯 Key Features Implementation

### 1. Export Playlist (RabbitMQ)
```bash
POST /export/playlists/{id}
Body: { "targetEmail": "user@example.com" }

# Producer mengirim message ke RabbitMQ
# Consumer menerima, query data, kirim email dengan attachment JSON
```

### 2. Album Cover Upload
```bash
POST /albums/{id}/covers
Content-Type: multipart/form-data
Body: cover (file, max 500KB, image/*)

# File disimpan di folder uploads/
# URL tersimpan di database: cover_url
```

### 3. Album Likes dengan Redis Cache
```bash
# Like album
POST /albums/{id}/likes
Authorization: Bearer {token}

# Get likes (cached 30 minutes)
GET /albums/{id}/likes
Response Header: X-Data-Source: cache (jika dari cache)

# Unlike album (cache dihapus)
DELETE /albums/{id}/likes
Authorization: Bearer {token}
```

## 📈 Performance

### Redis Caching Impact:
- **Without cache:** ~85ms per request
- **With cache:** ~6ms per request
- **Improvement:** 14x faster! ⚡

## 🐛 Troubleshooting

### Redis Connection Error
```bash
# Check if Redis running
redis-cli ping
# atau
memurai-cli ping

# Start Redis
net start Memurai  # Windows
docker start redis # Docker
```

### RabbitMQ Connection Error
```bash
# Check if RabbitMQ running
# Access Web UI: http://localhost:15672

# Start RabbitMQ
net start RabbitMQ  # Windows
docker start rabbitmq # Docker
```

### Port Already in Use
```bash
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

## 📚 Additional Documentation

- **[REDIS_SETUP.md](./REDIS_SETUP.md)** - Detailed Redis setup & monitoring
- **[EXPORT_PLAYLIST.md](./EXPORT_PLAYLIST.md)** - Export playlist feature guide
- **[KRITERIA_4_VERIFICATION.md](./KRITERIA_4_VERIFICATION.md)** - Cache implementation verification

## 📝 Scripts

```bash
npm start                # Start API server
npm run migrate up       # Run migrations
npm run migrate down     # Rollback migrations
node test-redis.js       # Test Redis connection
node test-rabbitmq.js    # Test RabbitMQ connection
```

## 👤 Author

Muhamad Muslih

## 📄 License

ISC



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
