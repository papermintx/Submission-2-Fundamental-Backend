# 📊 Playlist Activities Feature

**Status:** ✅ Implemented (Optional Criteria 2)

## Overview

Fitur ini mencatat setiap aktivitas yang dilakukan pada playlist (menambah atau menghapus lagu), sehingga owner dan collaborator dapat melihat riwayat perubahan.

## Database Schema

```sql
playlist_activities (
  id VARCHAR(50) PRIMARY KEY,
  playlist_id VARCHAR(50) NOT NULL,
  song_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  action VARCHAR(10) NOT NULL,  -- 'add' or 'delete'
  time TIMESTAMP NOT NULL DEFAULT current_timestamp,
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## API Endpoint

### GET /playlists/{id}/activities

Mendapatkan riwayat aktivitas dari sebuah playlist.

**Authentication:** Required (JWT)

**Authorization:** Owner atau Collaborator

**Path Parameters:**
- `id` (string, required) - Playlist ID

**Response Success (200):**

```json
{
  "status": "success",
  "data": {
    "playlistId": "playlist-Qbax5Oy7L8WKf74l",
    "activities": [
      {
        "username": "john_doe",
        "title": "Bohemian Rhapsody",
        "action": "add",
        "time": "2025-10-20T10:30:00.000Z"
      },
      {
        "username": "jane_smith",
        "title": "Imagine",
        "action": "add",
        "time": "2025-10-20T11:15:00.000Z"
      },
      {
        "username": "john_doe",
        "title": "Bohemian Rhapsody",
        "action": "delete",
        "time": "2025-10-20T12:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- **401 Unauthorized** - Token tidak valid atau tidak ada
- **403 Forbidden** - User bukan owner atau collaborator
- **404 Not Found** - Playlist tidak ditemukan

## Implementation Details

### Automatic Activity Logging

Aktivitas otomatis dicatat ketika:

1. **Menambah lagu ke playlist** (POST /playlists/{id}/songs)
   - Action: `"add"`
   - User: Yang melakukan request
   - Song: Lagu yang ditambahkan
   - Time: Timestamp saat penambahan

2. **Menghapus lagu dari playlist** (DELETE /playlists/{id}/songs)
   - Action: `"delete"`
   - User: Yang melakukan request
   - Song: Lagu yang dihapus
   - Time: Timestamp saat penghapusan

### Authorization

- ✅ Owner dapat melihat aktivitas
- ✅ Collaborator dapat melihat aktivitas
- ❌ User lain tidak dapat melihat aktivitas

### Data Display

Aktivitas ditampilkan dengan:
- `username` - Nama user yang melakukan aksi
- `title` - Judul lagu yang terlibat
- `action` - Jenis aksi ('add' atau 'delete')
- `time` - Waktu aksi dilakukan (ascending order)

## Testing Example

```bash
# 1. Login as owner
POST http://localhost:5000/authentications
Body: { "username": "john_doe", "password": "secret123" }
# Save accessToken

# 2. Add song to playlist
POST http://localhost:5000/playlists/playlist-abc123/songs
Headers: Authorization: Bearer <accessToken>
Body: { "songId": "song-xyz789" }

# 3. Delete song from playlist
DELETE http://localhost:5000/playlists/playlist-abc123/songs
Headers: Authorization: Bearer <accessToken>
Body: { "songId": "song-xyz789" }

# 4. View playlist activities
GET http://localhost:5000/playlists/playlist-abc123/activities
Headers: Authorization: Bearer <accessToken>

# Response will show both add and delete activities
```

## Features Checklist

- [x] Migration file created
- [x] Foreign keys to playlists, songs, and users tables
- [x] CASCADE DELETE for data integrity
- [x] ActivitiesService class with addActivity and getActivitiesByPlaylistId
- [x] Automatic logging on POST /playlists/{id}/songs
- [x] Automatic logging on DELETE /playlists/{id}/songs
- [x] GET /playlists/{id}/activities endpoint
- [x] JWT authentication required
- [x] Authorization check (owner OR collaborator)
- [x] SQL JOIN to get username and song title
- [x] Activities ordered by time (ASC)
- [x] Error handling (401, 403, 404)

## Service Layer

### ActivitiesService.js

**Methods:**

1. `addActivity({ playlistId, songId, userId, action })`
   - Mencatat aktivitas baru ke database
   - Return: activity ID

2. `getActivitiesByPlaylistId(playlistId)`
   - Mengambil semua aktivitas untuk playlist tertentu
   - JOIN dengan users dan songs untuk mendapatkan detail
   - Return: Array of activities dengan username, title, action, time

## Benefits

✅ Audit trail untuk setiap perubahan playlist
✅ Transparansi untuk owner dan collaborator
✅ Debugging dan troubleshooting lebih mudah
✅ Memenuhi optional criteria submission
