# Quick Start Guide - Testing Playlist dengan Data Initial

## 🚀 Copy-Paste Testing Script

Ikuti langkah ini secara berurutan:

---

### **Step 1: Start Server**

```bash
npm start
```

Server akan berjalan di: `http://localhost:5000`

---

### **Step 2: Register User**

```json
POST http://localhost:5000/users
Content-Type: application/json

{
  "username": "testuser",
  "password": "secret123",
  "fullname": "Test User"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "userId": "user-xxxxxxxxxx"
  }
}
```

---

### **Step 3: Login (SIMPAN TOKEN!)**

```json
POST http://localhost:5000/authentications
Content-Type: application/json

{
  "username": "testuser",
  "password": "secret123"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

⚠️ **PENTING:** Simpan `accessToken` untuk digunakan di semua request selanjutnya!

**Contoh token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLVFiYXg1T3k3TDhXS2Y3NGwiLCJpYXQiOjE2MzM5MjM0NTZ9.xxx
```

---

### **Step 4: Create Initial Songs (WAJIB!)**

#### Song 1: Bohemian Rhapsody
```json
POST http://localhost:5000/songs
Content-Type: application/json

{
  "title": "Bohemian Rhapsody",
  "year": 1975,
  "genre": "Rock",
  "performer": "Queen"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "songId": "song-abc123"  ⬅️ SIMPAN INI!
  }
}
```

#### Song 2: Stairway to Heaven
```json
POST http://localhost:5000/songs
Content-Type: application/json

{
  "title": "Stairway to Heaven",
  "year": 1971,
  "genre": "Rock",
  "performer": "Led Zeppelin"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "songId": "song-def456"  ⬅️ SIMPAN INI!
  }
}
```

#### Song 3: Hotel California
```json
POST http://localhost:5000/songs
Content-Type: application/json

{
  "title": "Hotel California",
  "year": 1977,
  "genre": "Rock",
  "performer": "Eagles"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "songId": "song-ghi789"  ⬅️ SIMPAN INI!
  }
}
```

---

### **Step 5: Create Playlists (WAJIB!)**

#### Playlist 1: Rock Classics
```json
POST http://localhost:5000/playlists
Content-Type: application/json
Authorization: Bearer <GANTI_DENGAN_ACCESS_TOKEN>

{
  "name": "Rock Classics"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "playlistId": "playlist-xxx111"  ⬅️ SIMPAN INI!
  }
}
```

#### Playlist 2: My Favorites
```json
POST http://localhost:5000/playlists
Content-Type: application/json
Authorization: Bearer <GANTI_DENGAN_ACCESS_TOKEN>

{
  "name": "My Favorites"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "playlistId": "playlist-yyy222"  ⬅️ SIMPAN INI!
  }
}
```

---

### **Step 6: Add Songs to Playlist ✅**

Sekarang baru bisa menambahkan song ke playlist!

#### Add Song 1 to Playlist 1
```json
POST http://localhost:5000/playlists/playlist-xxx111/songs
Content-Type: application/json
Authorization: Bearer <GANTI_DENGAN_ACCESS_TOKEN>

{
  "songId": "song-abc123"
}
```

**Success Response:**
```json
{
  "status": "success",
  "message": "Lagu berhasil ditambahkan ke playlist."
}
```

#### Add Song 2 to Playlist 1
```json
POST http://localhost:5000/playlists/playlist-xxx111/songs
Content-Type: application/json
Authorization: Bearer <GANTI_DENGAN_ACCESS_TOKEN>

{
  "songId": "song-def456"
}
```

#### Add Song 3 to Playlist 2
```json
POST http://localhost:5000/playlists/playlist-yyy222/songs
Content-Type: application/json
Authorization: Bearer <GANTI_DENGAN_ACCESS_TOKEN>

{
  "songId": "song-ghi789"
}
```

---

### **Step 7: Verify - Get Playlist Songs**

```json
GET http://localhost:5000/playlists/playlist-xxx111/songs
Authorization: Bearer <GANTI_DENGAN_ACCESS_TOKEN>
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "playlist": {
      "id": "playlist-xxx111",
      "name": "Rock Classics",
      "username": "testuser",
      "songs": [
        {
          "id": "song-abc123",
          "title": "Bohemian Rhapsody",
          "performer": "Queen"
        },
        {
          "id": "song-def456",
          "title": "Stairway to Heaven",
          "performer": "Led Zeppelin"
        }
      ]
    }
  }
}
```

---

### **Step 8: Get All User Playlists**

```json
GET http://localhost:5000/playlists
Authorization: Bearer <GANTI_DENGAN_ACCESS_TOKEN>
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "playlists": [
      {
        "id": "playlist-xxx111",
        "name": "Rock Classics",
        "username": "testuser"
      },
      {
        "id": "playlist-yyy222",
        "name": "My Favorites",
        "username": "testuser"
      }
    ]
  }
}
```

---

## 📊 Summary Data Yang Dibutuhkan

| Item | Endpoint | Required For | Save This |
|------|----------|--------------|-----------|
| User | `POST /users` | Authentication | - |
| Token | `POST /authentications` | All protected endpoints | `accessToken` |
| Song | `POST /songs` | Adding to playlist | `songId` |
| Playlist | `POST /playlists` | Song container | `playlistId` |

---

## ⚠️ Jika Tidak Ada Initial Data

### ❌ **Jika Song Belum Dibuat:**
```json
POST /playlists/{id}/songs
Body: { "songId": "song-notexist" }

Response (404):
{
  "status": "fail",
  "message": "Lagu tidak ditemukan"
}
```

### ❌ **Jika Playlist Belum Dibuat:**
```json
POST /playlists/playlist-notexist/songs
Body: { "songId": "song-abc123" }

Response (404):
{
  "status": "fail",
  "message": "Playlist tidak ditemukan"
}
```

### ❌ **Jika Tidak Ada Token:**
```json
POST /playlists/{id}/songs
(No Authorization header)

Response (401):
{
  "status": "fail",
  "message": "Missing authentication"
}
```

---

## 🎯 Checklist Sebelum Add Song to Playlist

- [ ] ✅ Server running (`npm start`)
- [ ] ✅ User registered
- [ ] ✅ User logged in (has `accessToken`)
- [ ] ✅ Song created (has `songId`)
- [ ] ✅ Playlist created (has `playlistId`)
- [ ] ✅ Using correct `Authorization: Bearer <token>` header
- [ ] ✅ Using correct `playlistId` in URL
- [ ] ✅ Using correct `songId` in body
- [ ] ✅ User is playlist owner

---

## 🚨 Common Mistakes

### Mistake 1: Langsung Add Song Tanpa Buat Song
```bash
❌ POST /playlists/{id}/songs
   Body: { "songId": "song-random123" }

✅ Harus buat song dulu:
   POST /songs → dapat songId
   Baru bisa: POST /playlists/{id}/songs
```

### Mistake 2: Langsung Add Song Tanpa Buat Playlist
```bash
❌ POST /playlists/random-id/songs

✅ Harus buat playlist dulu:
   POST /playlists → dapat playlistId
   Baru bisa: POST /playlists/{playlistId}/songs
```

### Mistake 3: Tidak Login
```bash
❌ POST /playlists/{id}/songs (no Authorization)

✅ Harus login dulu:
   POST /authentications → dapat accessToken
   Baru bisa: Authorization: Bearer <accessToken>
```

### Mistake 4: Pakai Playlist Orang Lain
```bash
❌ User A login, coba add song ke playlist User B

✅ Harus pakai playlist sendiri:
   - Login sebagai User A
   - Buat playlist sebagai User A
   - Add song ke playlist User A
```

---

## 💡 Tips

### Gunakan Postman Environment Variables
```javascript
// Simpan otomatis setelah login:
const response = pm.response.json();
pm.environment.set("accessToken", response.data.accessToken);

// Simpan setelah create song:
const response = pm.response.json();
pm.environment.set("songId", response.data.songId);

// Simpan setelah create playlist:
const response = pm.response.json();
pm.environment.set("playlistId", response.data.playlistId);

// Lalu gunakan di request:
Authorization: Bearer {{accessToken}}
URL: {{baseUrl}}/playlists/{{playlistId}}/songs
Body: { "songId": "{{songId}}" }
```

---

## ✅ Kesimpulan

**JAWABAN: YA, HARUS ADA INITIAL DATA!**

1. **Song** - Buat dulu dengan `POST /songs`
2. **Playlist** - Buat dulu dengan `POST /playlists`
3. **Token** - Login dulu dengan `POST /authentications`

Tanpa ketiganya, endpoint `POST /playlists/{id}/songs` akan **GAGAL** dengan error 401, 403, atau 404.

**Urutan yang benar:**
```
Register → Login → Create Songs → Create Playlists → Add Songs to Playlists
```

Ikuti step-by-step di atas untuk testing yang sukses! 🚀
