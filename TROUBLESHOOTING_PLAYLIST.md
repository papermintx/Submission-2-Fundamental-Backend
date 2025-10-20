# 🔧 Troubleshooting: Menambahkan Lagu ke Playlist

## ❓ Masalah

Tidak bisa menambahkan lagu ke playlist saat menggunakan endpoint:
```
POST http://localhost:{{port}}/playlists/{{playlistIdJohn}}/songs
```

---

## ✅ Solusi & Penjelasan

### 1. **Pastikan Semua Ketentuan Terpenuhi**

#### ✓ Authentication Required (JWT)
Endpoint ini **WAJIB** menggunakan access token:

```
Authorization: Bearer <access_token>
```

**Cara mendapatkan token:**
```bash
# 1. Register user
POST /users
{
  "username": "johndoe",
  "password": "secret123",
  "fullname": "John Doe"
}

# 2. Login
POST /authentications
{
  "username": "johndoe",
  "password": "secret123"
}

# Response akan berisi accessToken
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

#### ✓ Owner Verification
Hanya **owner playlist** yang bisa menambahkan lagu:

```javascript
// Server akan melakukan pengecekan:
// 1. Ambil userId dari JWT token
// 2. Cek apakah user adalah owner playlist
// 3. Jika BUKAN owner → 403 Forbidden
// 4. Jika owner → Lanjut proses
```

#### ✓ Valid SongId Required
SongId **HARUS** ada di database:

```javascript
// Server akan melakukan validasi:
// 1. Cek apakah songId ada di database songs
// 2. Jika TIDAK ada → 404 "Lagu tidak ditemukan"
// 3. Jika ada → Lanjut proses
```

---

### 2. **Validasi Lengkap yang Sudah Diimplementasi**

#### A. Validasi Input (400 Bad Request)
```javascript
// Cek apakah songId ada di request body
if (!songId) {
  return 400 "Gagal menambahkan lagu ke playlist. Mohon isi songId"
}

// Cek tipe data
if (typeof songId !== 'string') {
  return 400 "Gagal menambahkan lagu ke playlist. Tipe data tidak sesuai"
}
```

#### B. Validasi Authentication (401 Unauthorized)
```javascript
// Cek apakah ada Authorization header
if (!request.auth.credentials) {
  return 401 "Missing authentication"
}
```

#### C. Validasi Authorization (403 Forbidden)
```javascript
// Cek ownership playlist
await playlistsService.verifyPlaylistOwner(playlistId, userId);
// Jika bukan owner:
return 403 "Anda tidak berhak mengakses resource ini"
```

#### D. Validasi Song Exists (404 Not Found)
```javascript
// Cek apakah lagu ada di database
try {
  await songsService.getSongById(songId);
} catch (error) {
  if (error.name === 'NotFoundError') {
    return 404 "Lagu tidak ditemukan"
  }
}
```

#### E. Validasi Playlist Exists (404 Not Found)
```javascript
// Dilakukan di verifyPlaylistOwner
if (!playlist) {
  return 404 "Playlist tidak ditemukan"
}
```

---

### 3. **Response yang Sesuai Ketentuan**

#### ✅ Success (201 Created)
```json
{
  "status": "success",
  "message": "Lagu berhasil ditambahkan ke playlist."
}
```

#### ❌ Song Not Found (404)
```json
{
  "status": "fail",
  "message": "Lagu tidak ditemukan"
}
```

#### ❌ Not Owner (403)
```json
{
  "status": "fail",
  "message": "Anda tidak berhak mengakses resource ini"
}
```

#### ❌ Invalid Input (400)
```json
{
  "status": "fail",
  "message": "Gagal menambahkan lagu ke playlist. Mohon isi songId"
}
```

---

### 4. **Struktur Data yang Benar**

#### Playlist Object di Database
```json
{
  "id": "playlist-Qbax5Oy7L8WKf74l",
  "name": "Lagu Indie Hits Indonesia",
  "owner": "user-Qbax5Oy7L8WKf74l"
}
```

**Catatan:** Properti `owner` berisi `userId` dari JWT token payload.

#### Response GET /playlists
```json
{
  "status": "success",
  "data": {
    "playlists": [
      {
        "id": "playlist-Qbax5Oy7L8WKf74l",
        "name": "Lagu Indie Hits Indonesia",
        "username": "dicoding"
      }
    ]
  }
}
```

#### Response GET /playlists/{id}/songs
```json
{
  "status": "success",
  "data": {
    "playlist": {
      "id": "playlist-Mk8AnmCp210PwT6B",
      "name": "My Favorite Coldplay",
      "username": "dicoding",
      "songs": [
        {
          "id": "song-Qbax5Oy7L8WKf74l",
          "title": "Life in Technicolor",
          "performer": "Coldplay"
        }
      ]
    }
  }
}
```

---

## 🛠️ Langkah Testing yang Benar

### Step 1: Register User
```bash
POST http://localhost:5000/users
Content-Type: application/json

{
  "username": "johndoe",
  "password": "secret123",
  "fullname": "John Doe"
}
```

### Step 2: Login (Simpan Token!)
```bash
POST http://localhost:5000/authentications
Content-Type: application/json

{
  "username": "johndoe",
  "password": "secret123"
}

# RESPONSE - COPY accessToken!
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

### Step 3: Create Song (Simpan SongId!)
```bash
POST http://localhost:5000/songs
Content-Type: application/json

{
  "title": "Bohemian Rhapsody",
  "year": 1975,
  "genre": "Rock",
  "performer": "Queen"
}

# RESPONSE - COPY songId!
{
  "status": "success",
  "data": {
    "songId": "song-Qbax5Oy7L8WKf74l"
  }
}
```

### Step 4: Create Playlist (Simpan PlaylistId!)
```bash
POST http://localhost:5000/playlists
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "My Favorite Songs"
}

# RESPONSE - COPY playlistId!
{
  "status": "success",
  "data": {
    "playlistId": "playlist-Mk8AnmCp210PwT6B"
  }
}
```

### Step 5: Add Song to Playlist ✅
```bash
POST http://localhost:5000/playlists/playlist-Mk8AnmCp210PwT6B/songs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "songId": "song-Qbax5Oy7L8WKf74l"
}

# SUCCESS RESPONSE
{
  "status": "success",
  "message": "Lagu berhasil ditambahkan ke playlist."
}
```

---

## 🚨 Common Errors & Solutions

### Error 1: "Missing authentication"
**Status:** 401

**Penyebab:**
- Tidak ada header `Authorization`
- Format header salah

**Solusi:**
```
Authorization: Bearer <access_token>
```

### Error 2: "Anda tidak berhak mengakses resource ini"
**Status:** 403

**Penyebab:**
- User bukan owner playlist
- Menggunakan token user lain

**Solusi:**
- Gunakan token dari user yang membuat playlist
- Atau buat playlist baru dengan user saat ini

### Error 3: "Playlist tidak ditemukan"
**Status:** 404

**Penyebab:**
- PlaylistId salah
- Playlist sudah dihapus
- Typo di URL

**Solusi:**
- Pastikan playlistId benar
- Buat playlist baru
- Cek URL: `/playlists/{id}/songs`

### Error 4: "Lagu tidak ditemukan"
**Status:** 404

**Penyebab:**
- SongId tidak ada di database
- SongId salah
- Typo di request body

**Solusi:**
- Buat lagu terlebih dahulu (`POST /songs`)
- Gunakan songId yang valid
- Cek spelling di request body

### Error 5: "Gagal menambahkan lagu ke playlist. Mohon isi songId"
**Status:** 400

**Penyebab:**
- Field `songId` tidak ada
- Field `songId` kosong
- Typo field name (misal: `song_id`)

**Solusi:**
```json
{
  "songId": "song-xxx"  // HARUS songId (camelCase)
}
```

---

## ✅ Checklist Sebelum Request

Sebelum melakukan `POST /playlists/{id}/songs`, pastikan:

- [ ] Server berjalan (`npm start`)
- [ ] Database migrations sudah dijalankan (`npm run migrate up`)
- [ ] User sudah register
- [ ] User sudah login dan dapat accessToken
- [ ] Lagu sudah dibuat dan dapat songId
- [ ] Playlist sudah dibuat dan dapat playlistId
- [ ] Playlist dibuat oleh user yang sama (owner)
- [ ] Header `Authorization: Bearer <token>` ada
- [ ] Header `Content-Type: application/json` ada
- [ ] Body berisi `{"songId": "song-xxx"}`
- [ ] URL benar: `/playlists/{playlistId}/songs`

---

## 📝 Implementation Details

### Handler Code (src/api/playlists/handler.js)
```javascript
async postSongToPlaylistHandler(request, h) {
  // 1. Validate payload
  PlaylistsValidator.validatePlaylistSongPayload(request.payload);

  const { id } = request.params;
  const { songId } = request.payload;
  const { userId } = request.auth.credentials; // dari JWT

  // 2. Verify ownership (403 jika bukan owner)
  await this._playlistsService.verifyPlaylistOwner(id, userId);

  // 3. Validate song exists (404 jika tidak ada)
  try {
    await this._songsService.getSongById(songId);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return h.response({
        status: 'fail',
        message: 'Lagu tidak ditemukan',
      }).code(404);
    }
    throw error;
  }

  // 4. Add song to playlist
  await this._playlistsService.addSongToPlaylist(id, songId);

  // 5. Return success
  return h.response({
    status: 'success',
    message: 'Lagu berhasil ditambahkan ke playlist.',
  }).code(201);
}
```

### Service Code (src/services/PlaylistsService.js)
```javascript
async verifyPlaylistOwner(id, owner) {
  const query = {
    text: 'SELECT * FROM playlists WHERE id = $1',
    values: [id],
  };

  const result = await this.query(query.text, query.values);

  if (!result.rows.length) {
    throw new NotFoundError('Playlist tidak ditemukan');
  }

  const playlist = result.rows[0];

  if (playlist.owner !== owner) {
    throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }
}

async addSongToPlaylist(playlistId, songId) {
  const id = `playlist-song-${nanoid(16)}`;

  const query = {
    text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
    values: [id, playlistId, songId],
  };

  const result = await this.query(query.text, query.values);

  if (!result.rows[0].id) {
    throw new Error('Lagu gagal ditambahkan ke playlist');
  }

  return result.rows[0].id;
}
```

---

## 🎯 Summary

**Masalah sudah diselesaikan dengan:**

1. ✅ Validasi `songId` yang benar (404 jika tidak ada)
2. ✅ Message error sesuai: "Lagu tidak ditemukan"
3. ✅ Verifikasi ownership playlist (403 jika bukan owner)
4. ✅ Response success yang benar (201 Created)
5. ✅ Message success: "Lagu berhasil ditambahkan ke playlist."

**File yang diupdate:**
- `src/api/playlists/handler.js` - Added try-catch untuk validasi songId
- `PLAYLIST_TESTING_GUIDE.md` - Dokumentasi testing lengkap

**Commit:**
```
fix(playlists): Add proper 404 validation for invalid songId with message 'Lagu tidak ditemukan'
```

Silakan ikuti **PLAYLIST_TESTING_GUIDE.md** untuk testing lengkap! 🚀
