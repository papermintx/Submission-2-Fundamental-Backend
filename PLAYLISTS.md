# Playlist Management API Documentation

This document describes the playlist management endpoints for the OpenMusic API.

## Overview

The Playlist feature allows authenticated users to:
- Create personal playlists
- Add songs to their playlists
- View their playlists and songs
- Remove songs from playlists
- Delete playlists

**All playlist endpoints require JWT authentication.**

---

## Prerequisites

1. User must be registered and authenticated
2. Include the access token in the Authorization header:
   ```
   Authorization: Bearer <access_token>
   ```

---

## Endpoints

### 1. Create Playlist

**POST /playlists**

Create a new playlist for the authenticated user.

**Authentication:** Required (JWT)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "My Favorite Songs"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "playlistId": "playlist-Qbax5Oy7L8yX1e77"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payload
- `401 Unauthorized`: Missing or invalid token

---

### 2. Get User Playlists

**GET /playlists**

Retrieve all playlists owned by the authenticated user.

**Authentication:** Required (JWT)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "playlists": [
      {
        "id": "playlist-Qbax5Oy7L8yX1e77",
        "name": "My Favorite Songs",
        "username": "johndoe"
      },
      {
        "id": "playlist-Xbcd6Py8M9zY2f88",
        "name": "Workout Mix",
        "username": "johndoe"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

### 3. Delete Playlist

**DELETE /playlists/{id}**

Delete a playlist. Only the playlist owner can delete it.

**Authentication:** Required (JWT)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Playlist berhasil dihapus"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not the playlist owner
- `404 Not Found`: Playlist not found

---

### 4. Add Song to Playlist

**POST /playlists/{id}/songs**

Add a song to a playlist. Only the playlist owner can add songs.

**Authentication:** Required (JWT)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "songId": "song-Qbax5Oy7L8yX1e77"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Lagu berhasil ditambahkan ke playlist"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payload or song doesn't exist
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not the playlist owner
- `404 Not Found`: Playlist or song not found

---

### 5. Get Playlist Songs

**GET /playlists/{id}/songs**

Retrieve all songs in a playlist with full details. Only the playlist owner can view the songs.

**Authentication:** Required (JWT)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "playlist": {
      "id": "playlist-Qbax5Oy7L8yX1e77",
      "name": "My Favorite Songs",
      "username": "johndoe",
      "songs": [
        {
          "id": "song-Qbax5Oy7L8yX1e77",
          "title": "Bohemian Rhapsody",
          "performer": "Queen"
        },
        {
          "id": "song-Xbcd6Py8M9zY2f88",
          "title": "Stairway to Heaven",
          "performer": "Led Zeppelin"
        }
      ]
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not the playlist owner
- `404 Not Found`: Playlist not found

---

### 6. Remove Song from Playlist

**DELETE /playlists/{id}/songs**

Remove a song from a playlist. Only the playlist owner can remove songs.

**Authentication:** Required (JWT)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "songId": "song-Qbax5Oy7L8yX1e77"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Lagu berhasil dihapus dari playlist"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid payload
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User is not the playlist owner
- `404 Not Found`: Playlist or song not found in playlist

---

## Authorization Rules

### Ownership Verification

All playlist operations (except creating) verify that the authenticated user is the playlist owner:

1. **Create Playlist**: User becomes the owner automatically
2. **View Playlists**: User can only see their own playlists
3. **Delete Playlist**: Only owner can delete
4. **Add Song**: Only owner can add songs
5. **View Songs**: Only owner can view playlist songs
6. **Remove Song**: Only owner can remove songs

### Error Handling

- **401 Unauthorized**: Token is missing, invalid, or expired
- **403 Forbidden**: User doesn't have permission (not the owner)
- **404 Not Found**: Resource doesn't exist

---

## Database Schema

### playlists Table
| Column | Type        | Constraints                    |
|--------|-------------|--------------------------------|
| id     | VARCHAR(50) | PRIMARY KEY                    |
| name   | TEXT        | NOT NULL                       |
| owner  | VARCHAR(50) | NOT NULL, FK to users(id)      |

### playlist_songs Table
| Column      | Type        | Constraints                        |
|-------------|-------------|------------------------------------|
| id          | VARCHAR(50) | PRIMARY KEY                        |
| playlist_id | VARCHAR(50) | NOT NULL, FK to playlists(id)      |
| song_id     | VARCHAR(50) | NOT NULL, FK to songs(id)          |

**Constraints:**
- Unique constraint on (playlist_id, song_id) - prevents duplicate songs in a playlist
- CASCADE DELETE - deleting a playlist deletes all its songs
- CASCADE DELETE - deleting a song removes it from all playlists

---

## Example Usage Flow

### 1. Register and Login
```bash
# Register
POST /users
{ "username": "johndoe", "password": "secret", "fullname": "John Doe" }

# Login
POST /authentications
{ "username": "johndoe", "password": "secret" }

# Response includes accessToken
```

### 2. Create a Playlist
```bash
POST /playlists
Authorization: Bearer <accessToken>
{ "name": "My Favorites" }
```

### 3. Add Songs to Playlist
```bash
POST /playlists/{playlistId}/songs
Authorization: Bearer <accessToken>
{ "songId": "song-123" }
```

### 4. View Playlist Songs
```bash
GET /playlists/{playlistId}/songs
Authorization: Bearer <accessToken>
```

### 5. Remove Song from Playlist
```bash
DELETE /playlists/{playlistId}/songs
Authorization: Bearer <accessToken>
{ "songId": "song-123" }
```

### 6. Delete Playlist
```bash
DELETE /playlists/{playlistId}
Authorization: Bearer <accessToken>
```

---

## Security Features

✅ **JWT Authentication**: All endpoints require valid access token  
✅ **Authorization**: Ownership verification on all operations  
✅ **Data Validation**: All payloads validated before processing  
✅ **Foreign Key Constraints**: Database-level data integrity  
✅ **Cascade Delete**: Automatic cleanup of related data  
✅ **Duplicate Prevention**: Cannot add same song twice to playlist  

---

## Testing with cURL

### Create Playlist
```bash
curl -X POST http://localhost:5000/playlists \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Playlist"}'
```

### Add Song to Playlist
```bash
curl -X POST http://localhost:5000/playlists/PLAYLIST_ID/songs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"songId": "SONG_ID"}'
```

### Get Playlist Songs
```bash
curl -X GET http://localhost:5000/playlists/PLAYLIST_ID/songs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

**For more examples, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)**
