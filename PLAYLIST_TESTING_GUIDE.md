# Testing Guide - Playlist Management

## Setup

1. Server harus berjalan di `http://localhost:5000`
2. Database migrations sudah dijalankan (`npm run migrate up`)
3. Ada JWT tokens yang valid

## Testing Flow

### 1. Register User

```bash
POST http://localhost:5000/users
Content-Type: application/json

{
  "username": "johndoe",
  "password": "secret123",
  "fullname": "John Doe"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "data": {
    "userId": "user-xxxxxxxxxxxxxxxx"
  }
}
```

### 2. Login (Get Access Token)

```bash
POST http://localhost:5000/authentications
Content-Type: application/json

{
  "username": "johndoe",
  "password": "secret123"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**PENTING:** Simpan `accessToken` untuk digunakan di request selanjutnya!

### 3. Create Song (Untuk Testing)

```bash
POST http://localhost:5000/songs
Content-Type: application/json

{
  "title": "Bohemian Rhapsody",
  "year": 1975,
  "genre": "Rock",
  "performer": "Queen"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "data": {
    "songId": "song-xxxxxxxxxxxxxxxx"
  }
}
```

**PENTING:** Simpan `songId` untuk digunakan saat menambahkan ke playlist!

### 4. Create Playlist

```bash
POST http://localhost:5000/playlists
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "My Favorite Songs"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "data": {
    "playlistId": "playlist-xxxxxxxxxxxxxxxx"
  }
}
```

**PENTING:** Simpan `playlistId` untuk request selanjutnya!

### 5. Add Song to Playlist

```bash
POST http://localhost:5000/playlists/{playlistId}/songs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "songId": "song-xxxxxxxxxxxxxxxx"
}
```

**Expected Response (201) - SUCCESS:**
```json
{
  "status": "success",
  "message": "Lagu berhasil ditambahkan ke playlist."
}
```

**Expected Response (404) - Song Not Found:**
```json
{
  "status": "fail",
  "message": "Lagu tidak ditemukan"
}
```

**Expected Response (403) - Not Owner:**
```json
{
  "status": "fail",
  "message": "Anda tidak berhak mengakses resource ini"
}
```

**Expected Response (404) - Playlist Not Found:**
```json
{
  "status": "fail",
  "message": "Playlist tidak ditemukan"
}
```

### 6. Get Playlist Songs

```bash
GET http://localhost:5000/playlists/{playlistId}/songs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "playlist": {
      "id": "playlist-Mk8AnmCp210PwT6B",
      "name": "My Favorite Songs",
      "username": "johndoe",
      "songs": [
        {
          "id": "song-Qbax5Oy7L8WKf74l",
          "title": "Bohemian Rhapsody",
          "performer": "Queen"
        }
      ]
    }
  }
}
```

### 7. Get User's Playlists

```bash
GET http://localhost:5000/playlists
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "playlists": [
      {
        "id": "playlist-Qbax5Oy7L8WKf74l",
        "name": "My Favorite Songs",
        "username": "johndoe"
      }
    ]
  }
}
```

### 8. Remove Song from Playlist

```bash
DELETE http://localhost:5000/playlists/{playlistId}/songs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "songId": "song-xxxxxxxxxxxxxxxx"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Lagu berhasil dihapus dari playlist."
}
```

### 9. Delete Playlist

```bash
DELETE http://localhost:5000/playlists/{playlistId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Playlist berhasil dihapus"
}
```

---

## Common Errors & Solutions

### Error: "Missing authentication"
**Status:** 401 Unauthorized

**Penyebab:** 
- Header `Authorization` tidak dikirim
- Format header salah

**Solusi:**
```
Authorization: Bearer <access_token>
```

### Error: "Anda tidak berhak mengakses resource ini"
**Status:** 403 Forbidden

**Penyebab:**
- User bukan owner playlist
- Mencoba mengakses playlist orang lain

**Solusi:**
- Gunakan token dari user yang membuat playlist

### Error: "Playlist tidak ditemukan"
**Status:** 404 Not Found

**Penyebab:**
- PlaylistId salah atau tidak ada
- Playlist sudah dihapus

**Solusi:**
- Gunakan playlistId yang valid
- Buat playlist baru terlebih dahulu

### Error: "Lagu tidak ditemukan"
**Status:** 404 Not Found

**Penyebab:**
- SongId tidak valid
- Lagu belum dibuat di database

**Solusi:**
- Buat lagu terlebih dahulu (`POST /songs`)
- Gunakan songId yang valid dari response

### Error: "Gagal menambahkan lagu ke playlist. Mohon isi songId"
**Status:** 400 Bad Request

**Penyebab:**
- Field `songId` tidak ada di request body
- Field `songId` kosong

**Solusi:**
```json
{
  "songId": "song-xxxxxxxxxxxxxxxx"
}
```

---

## Testing dengan Postman

1. **Buat Collection:** "OpenMusic API"
2. **Set Environment Variable:**
   - `baseUrl`: `http://localhost:5000`
   - `accessToken`: (akan diisi setelah login)
   - `playlistId`: (akan diisi setelah create playlist)
   - `songId`: (akan diisi setelah create song)

3. **Request Setup:**
   ```
   URL: {{baseUrl}}/playlists/{{playlistId}}/songs
   Method: POST
   Headers:
     - Content-Type: application/json
     - Authorization: Bearer {{accessToken}}
   Body (raw JSON):
     {
       "songId": "{{songId}}"
     }
   ```

4. **Auto-save tokens:**
   Di tab "Tests" pada request Login, tambahkan:
   ```javascript
   const response = pm.response.json();
   pm.environment.set("accessToken", response.data.accessToken);
   ```

---

## Checklist Debugging

Jika `POST /playlists/{id}/songs` tidak berfungsi, periksa:

- [ ] Server berjalan di port 5000
- [ ] Database migrations sudah dijalankan
- [ ] User sudah register dan login
- [ ] Access token disimpan dari response login
- [ ] Header `Authorization: Bearer <token>` ada dan benar
- [ ] PlaylistId valid dan playlist milik user tersebut
- [ ] SongId valid dan lagu ada di database
- [ ] Body request berisi `{"songId": "song-xxx"}`
- [ ] Content-Type header: `application/json`

---

## cURL Examples (PowerShell Compatible)

### Register
```powershell
curl.exe -X POST "http://localhost:5000/users" `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"johndoe\",\"password\":\"secret123\",\"fullname\":\"John Doe\"}'
```

### Login
```powershell
curl.exe -X POST "http://localhost:5000/authentications" `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"johndoe\",\"password\":\"secret123\"}'
```

### Create Song
```powershell
curl.exe -X POST "http://localhost:5000/songs" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Bohemian Rhapsody\",\"year\":1975,\"genre\":\"Rock\",\"performer\":\"Queen\"}'
```

### Create Playlist (Replace <TOKEN>)
```powershell
curl.exe -X POST "http://localhost:5000/playlists" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"name\":\"My Favorites\"}'
```

### Add Song to Playlist (Replace <TOKEN>, <PLAYLIST_ID>, <SONG_ID>)
```powershell
curl.exe -X POST "http://localhost:5000/playlists/<PLAYLIST_ID>/songs" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{\"songId\":\"<SONG_ID>\"}'
```

---

## Validation Rules

### POST /playlists/{id}/songs

**Authorization:**
- ✅ Requires JWT authentication
- ✅ User must be playlist owner
- ✅ Returns 403 if not owner

**Validation:**
- ✅ `songId` is required (400 if missing)
- ✅ `songId` must be string (400 if wrong type)
- ✅ `songId` must exist in database (404 if not found)
- ✅ Playlist must exist (404 if not found)

**Success Response:**
```json
{
  "status": "success",
  "message": "Lagu berhasil ditambahkan ke playlist."
}
```

**HTTP Status Codes:**
- `201` - Song added successfully
- `400` - Bad request (missing/invalid songId)
- `401` - Unauthorized (no token)
- `403` - Forbidden (not playlist owner)
- `404` - Not found (playlist or song doesn't exist)
