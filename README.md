# OpenMusic API

A RESTful API for managing music albums and songs, built with Node.js Hapi framework and PostgreSQL database.

## Features

- Full CRUD operations for Albums
- Full CRUD operations for Songs
- Song searching by title and performer
- Album-Song relationships (view songs associated with an album)
- PostgreSQL database with migrations
- Comprehensive error handling and data validation

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

4. Configure environment variables in `.env` file:
   ```
   HOST=localhost
   PORT=5000
   
   PGUSER=postgres
   PGPASSWORD=your_password
   PGDATABASE=openmusic
   PGHOST=localhost
   PGPORT=5432
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
├── migrations/                 # Database migrations
├── src/
│   ├── api/                   # API handlers and routes
│   │   ├── albums/
│   │   └── songs/
│   ├── exceptions/            # Custom error classes
│   ├── services/              # Business logic
│   ├── validator/             # Input validation
│   └── server.js              # Main server file
├── .env                       # Environment variables
├── package.json
└── README.md
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

- **Framework**: Hapi.js
- **Database**: PostgreSQL
- **Migration Tool**: node-pg-migrate
- **Environment Variables**: dotenv
- **ID Generation**: nanoid

## License

ISC
