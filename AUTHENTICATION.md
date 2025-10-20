# Authentication API Documentation

This document describes the authentication endpoints for the OpenMusic API.

## Prerequisites

Before using the authentication endpoints, ensure you have:
1. Run the database migrations: `npm run migrate up`
2. Set up the `.env` file with JWT secrets (see `.env.example`)

## Endpoints

### 1. User Registration

**POST /users**

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "secret123",
  "fullname": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "userId": "user-Qbax5Oy7L8yX1e77"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payload or username already exists
```json
{
  "status": "fail",
  "message": "Gagal menambahkan user. Username sudah digunakan."
}
```

---

### 2. User Login (Authentication)

**POST /authentications**

Login with username and password to receive access and refresh tokens.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "secret123"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid credentials
```json
{
  "status": "fail",
  "message": "Kredensial yang Anda berikan salah"
}
```

---

### 3. Refresh Access Token

**PUT /authentications**

Generate a new access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired refresh token
```json
{
  "status": "fail",
  "message": "Refresh token tidak valid"
}
```

---

### 4. User Logout

**DELETE /authentications**

Logout by invalidating the refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Refresh token berhasil dihapus"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid refresh token
```json
{
  "status": "fail",
  "message": "Refresh token tidak valid"
}
```

---

## Using Authentication in Protected Routes

To protect routes (e.g., playlists, user-specific data), use the JWT authentication strategy:

```javascript
{
  method: 'POST',
  path: '/playlists',
  handler: handler.postPlaylistHandler,
  options: {
    auth: 'openmusic_jwt',
  },
}
```

Access the authenticated user ID in handlers:
```javascript
const { userId } = request.auth.credentials;
```

## Token Information

- **Access Token**: Short-lived (default: 30 minutes). Used for API requests.
- **Refresh Token**: Long-lived. Used to obtain new access tokens.
- Both tokens contain the `userId` in their payload.

## Environment Variables

Required environment variables for authentication:

```
ACCESS_TOKEN_KEY=your_secret_key_for_access_token
REFRESH_TOKEN_KEY=your_secret_key_for_refresh_token
ACCESS_TOKEN_AGE=1800
```

Generate secure random keys for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
