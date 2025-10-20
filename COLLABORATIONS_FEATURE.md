# ✅ Optional Criteria 1: Playlist Collaboration Feature

## 📋 Status: **FULLY IMPLEMENTED**

Aplikasi OpenMusic API sekarang mendukung fitur kolaborasi playlist yang memungkinkan pemilik playlist menambahkan dan menghapus kolaborator, serta memberikan akses kolaborator ke playlist management.

---

## 🎯 Feature Overview

### **What's New:**
1. ✅ **Collaboration Management Endpoints** - POST & DELETE `/collaborations`
2. ✅ **Collaborator Access** - Kolaborator dapat mengelola lagu dalam playlist
3. ✅ **Updated Authorization Logic** - Owner OR Collaborator dapat mengakses playlist
4. ✅ **Database Table** - Tabel `collaborations` dengan foreign keys

---

## 🗄️ Database Schema

### **New Table: `collaborations`**

```sql
CREATE TABLE collaborations (
  id VARCHAR(50) PRIMARY KEY,
  playlist_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  UNIQUE (playlist_id, user_id)
);

-- Foreign Keys
ALTER TABLE collaborations
  ADD CONSTRAINT fk_collaborations.playlist_id_playlists.id
  FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE;

ALTER TABLE collaborations
  ADD CONSTRAINT fk_collaborations.user_id_users.id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

**Schema Details:**
- `id` - Primary key, format: `collab-{nanoid}`
- `playlist_id` - Foreign key ke `playlists.id` (CASCADE DELETE)
- `user_id` - Foreign key ke `users.id` (CASCADE DELETE)
- `UNIQUE (playlist_id, user_id)` - Mencegah duplikasi kolaborator

**Migration File:** `migrations/1760973650120_create-table-collaborations.js`

---

## 🔗 New API Endpoints

### **1. POST /collaborations** (Add Collaborator)

**Description:** Menambahkan kolaborator ke playlist (hanya owner yang bisa menambahkan)

**Authentication:** Required (JWT)

**Request:**
```json
POST /collaborations
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "playlistId": "playlist-xxx",
  "userId": "user-yyy"
}
```

**Authorization Check:**
- ✅ User harus authenticated
- ✅ **CRITICAL:** User harus OWNER dari playlist
- ✅ userId yang ditambahkan harus exist di database

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "collaborationId": "collab-Qbax5Oy7L8WKf74l"
  }
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "status": "fail",
  "message": "Gagal menambahkan kolaborator. Mohon isi playlistId dan userId"
}
```

**400 - Duplicate Collaborator:**
```json
{
  "status": "fail",
  "message": "Kolaborator sudah ditambahkan"
}
```

**401 - No Token:**
```json
{
  "status": "fail",
  "message": "Missing authentication"
}
```

**403 - Not Owner:**
```json
{
  "status": "fail",
  "message": "Anda tidak berhak mengakses resource ini"
}
```

**404 - User Not Found:**
```json
{
  "status": "fail",
  "message": "User tidak ditemukan"
}
```

**404 - Playlist Not Found:**
```json
{
  "status": "fail",
  "message": "Playlist tidak ditemukan"
}
```

---

### **2. DELETE /collaborations** (Remove Collaborator)

**Description:** Menghapus kolaborator dari playlist (hanya owner yang bisa menghapus)

**Authentication:** Required (JWT)

**Request:**
```json
DELETE /collaborations
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "playlistId": "playlist-xxx",
  "userId": "user-yyy"
}
```

**Authorization Check:**
- ✅ User harus authenticated
- ✅ **CRITICAL:** User harus OWNER dari playlist

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Kolaborator berhasil dihapus."
}
```

**Error Responses:**

**400 - Collaborator Not Found:**
```json
{
  "status": "fail",
  "message": "Kolaborator gagal dihapus"
}
```

**401 - No Token:**
```json
{
  "status": "fail",
  "message": "Missing authentication"
}
```

**403 - Not Owner:**
```json
{
  "status": "fail",
  "message": "Anda tidak berhak mengakses resource ini"
}
```

---

## 🔄 Updated Existing Endpoints

### **Modified Authorization Logic:**

The following playlist endpoints now accept **OWNER OR COLLABORATOR** access:

1. ✅ **POST /playlists/{id}/songs** - Add song to playlist
2. ✅ **GET /playlists/{id}/songs** - Get songs from playlist
3. ✅ **DELETE /playlists/{id}/songs** - Remove song from playlist

**DELETE /playlists/{id}** - Still **OWNER ONLY** (collaborators cannot delete playlists)

---

### **GET /playlists** (Modified)

**Description:** Mengembalikan playlists dimana user adalah OWNER **ATAU** COLLABORATOR

**Before:**
```sql
-- Only owner's playlists
SELECT * FROM playlists WHERE owner = $1
```

**After (UNION):**
```sql
-- Owner's playlists UNION collaborator's playlists
SELECT playlists.id, playlists.name, users.username 
FROM playlists 
LEFT JOIN users ON users.id = playlists.owner 
WHERE playlists.owner = $1
UNION
SELECT playlists.id, playlists.name, users.username 
FROM playlists 
LEFT JOIN users ON users.id = playlists.owner
INNER JOIN collaborations ON collaborations.playlist_id = playlists.id
WHERE collaborations.user_id = $1
```

**Request:**
```json
GET /playlists
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "playlists": [
      {
        "id": "playlist-own1",
        "name": "My Playlist",
        "username": "johndoe"
      },
      {
        "id": "playlist-collab1",
        "name": "Shared Playlist",
        "username": "janedoe"
      }
    ]
  }
}
```

---

### **POST /playlists/{id}/songs** (Modified)

**Authorization:** Changed from `verifyPlaylistOwner` to `verifyPlaylistAccess`

**Before:**
```javascript
// Only owner can add songs
await this._playlistsService.verifyPlaylistOwner(id, userId);
```

**After:**
```javascript
// Owner OR collaborator can add songs
await this._playlistsService.verifyPlaylistAccess(id, userId);
```

---

### **GET /playlists/{id}/songs** (Modified)

**Authorization:** Changed from `verifyPlaylistOwner` to `verifyPlaylistAccess`

**Before:**
```javascript
// Only owner can view songs
await this._playlistsService.verifyPlaylistOwner(id, userId);
```

**After:**
```javascript
// Owner OR collaborator can view songs
await this._playlistsService.verifyPlaylistAccess(id, userId);
```

---

### **DELETE /playlists/{id}/songs** (Modified)

**Authorization:** Changed from `verifyPlaylistOwner` to `verifyPlaylistAccess`

**Before:**
```javascript
// Only owner can delete songs
await this._playlistsService.verifyPlaylistOwner(id, userId);
```

**After:**
```javascript
// Owner OR collaborator can delete songs
await this._playlistsService.verifyPlaylistAccess(id, userId);
```

---

## 🏗️ Implementation Details

### **1. CollaborationsService**

**File:** `src/services/CollaborationsService.js`

```javascript
class CollaborationsService extends DatabaseService {
  async addCollaborator(playlistId, userId) {
    // 1. Verify user exists
    await this.verifyUserExists(userId);
    
    // 2. Check if collaboration already exists
    // 3. Insert new collaboration
    // 4. Return collaboration id
  }

  async deleteCollaborator(playlistId, userId) {
    // Delete collaboration record
  }

  async verifyCollaborator(playlistId, userId) {
    // Verify collaboration exists
  }

  async verifyUserExists(userId) {
    // Check if user exists in database
  }
}
```

**Key Features:**
- ✅ Prevents duplicate collaborations
- ✅ Validates user existence before adding
- ✅ Uses nanoid for ID generation
- ✅ Throws appropriate errors

---

### **2. CollaborationsValidator**

**File:** `src/validator/collaborations.js`

```javascript
const CollaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const { playlistId, userId } = payload;

    // Check required fields
    if (!playlistId || !userId) {
      throw new InvariantError('Gagal menambahkan kolaborator. Mohon isi playlistId dan userId');
    }

    // Check data types
    if (typeof playlistId !== 'string' || typeof userId !== 'string') {
      throw new InvariantError('Gagal menambahkan kolaborator. Tipe data tidak sesuai');
    }
  },
};
```

**Validation Rules:**
- ✅ `playlistId` - required, string
- ✅ `userId` - required, string

---

### **3. CollaborationsHandler**

**File:** `src/api/collaborations/handler.js`

```javascript
class CollaborationsHandler {
  async postCollaborationHandler(request, h) {
    // 1. Validate payload
    CollaborationsValidator.validateCollaborationPayload(request.payload);
    
    // 2. Extract data
    const { playlistId, userId } = request.payload;
    const { userId: ownerId } = request.auth.credentials;

    // 3. CRITICAL: Verify authenticated user is playlist OWNER
    await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);

    // 4. Add collaborator
    const collaborationId = await this._collaborationsService.addCollaborator(playlistId, userId);

    // 5. Return response
  }

  async deleteCollaborationHandler(request, h) {
    // Similar flow with owner verification
  }
}
```

**Key Points:**
- ✅ **CRITICAL:** Uses `verifyPlaylistOwner` (NOT `verifyPlaylistAccess`)
- ✅ Only playlist owners can add/remove collaborators
- ✅ Collaborators CANNOT add other collaborators

---

### **4. Updated PlaylistsService**

**File:** `src/services/PlaylistsService.js`

**New Method: `verifyPlaylistAccess`**

```javascript
async verifyPlaylistAccess(playlistId, userId) {
  // 1. Check if playlist exists
  const playlistQuery = {
    text: 'SELECT * FROM playlists WHERE id = $1',
    values: [playlistId],
  };
  const playlistResult = await this.query(playlistQuery.text, playlistQuery.values);

  if (!playlistResult.rows.length) {
    throw new NotFoundError('Playlist tidak ditemukan');
  }

  // 2. Check if user is owner OR collaborator (UNION)
  const query = {
    text: `SELECT playlists.id 
           FROM playlists 
           WHERE playlists.id = $1 AND playlists.owner = $2
           UNION
           SELECT playlists.id 
           FROM playlists
           INNER JOIN collaborations ON collaborations.playlist_id = playlists.id
           WHERE playlists.id = $1 AND collaborations.user_id = $2`,
    values: [playlistId, userId],
  };

  const result = await this.query(query.text, query.values);

  if (!result.rows.length) {
    throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }
}
```

**Logic:**
1. ✅ First check playlist exists → throw `NotFoundError` if not
2. ✅ Then check access (owner OR collaborator) → throw `AuthorizationError` if no access
3. ✅ Uses SQL UNION to check both conditions

**Updated Method: `getPlaylists`**

```javascript
async getPlaylists(userId) {
  const query = {
    text: `SELECT playlists.id, playlists.name, users.username 
           FROM playlists 
           LEFT JOIN users ON users.id = playlists.owner 
           WHERE playlists.owner = $1
           UNION
           SELECT playlists.id, playlists.name, users.username 
           FROM playlists 
           LEFT JOIN users ON users.id = playlists.owner
           INNER JOIN collaborations ON collaborations.playlist_id = playlists.id
           WHERE collaborations.user_id = $1`,
    values: [userId],
  };

  const result = await this.query(query.text, query.values);
  return result.rows;
}
```

**Logic:**
- ✅ Returns playlists where user is owner
- ✅ **UNION** with playlists where user is collaborator
- ✅ Combines both result sets

---

## 🔐 Authorization Matrix

| Endpoint | Owner | Collaborator | Other Users |
|----------|-------|--------------|-------------|
| POST /playlists | ✅ Create | ❌ | ❌ |
| GET /playlists | ✅ See owned | ✅ See collaborated | ❌ |
| DELETE /playlists/{id} | ✅ Delete | ❌ Cannot delete | ❌ |
| POST /playlists/{id}/songs | ✅ Add | ✅ Add | ❌ |
| GET /playlists/{id}/songs | ✅ View | ✅ View | ❌ |
| DELETE /playlists/{id}/songs | ✅ Remove | ✅ Remove | ❌ |
| POST /collaborations | ✅ Add collaborator | ❌ Cannot add | ❌ |
| DELETE /collaborations | ✅ Remove collaborator | ❌ Cannot remove | ❌ |

---

## 🧪 Testing Scenarios

### **Scenario 1: Add Collaborator (Success)**

**Step 1: User A creates playlist**
```json
POST /playlists
Authorization: Bearer <userA-token>
{
  "name": "Rock Classics"
}

Response (201):
{
  "status": "success",
  "data": {
    "playlistId": "playlist-abc123"
  }
}
```

**Step 2: User A adds User B as collaborator**
```json
POST /collaborations
Authorization: Bearer <userA-token>
{
  "playlistId": "playlist-abc123",
  "userId": "user-xyz789"
}

Response (201):
{
  "status": "success",
  "data": {
    "collaborationId": "collab-def456"
  }
}
```

**Step 3: User B can now add songs**
```json
POST /playlists/playlist-abc123/songs
Authorization: Bearer <userB-token>
{
  "songId": "song-ghi789"
}

Response (201):
{
  "status": "success",
  "message": "Lagu berhasil ditambahkan ke playlist."
}
```

---

### **Scenario 2: Collaborator Tries to Add Another Collaborator (Fail)**

```json
POST /collaborations
Authorization: Bearer <userB-token>  // User B is collaborator
{
  "playlistId": "playlist-abc123",
  "userId": "user-newuser"
}

Response (403):
{
  "status": "fail",
  "message": "Anda tidak berhak mengakses resource ini"
}
```

**Reason:** Only OWNER can add/remove collaborators

---

### **Scenario 3: Get Playlists (UNION)**

**User B is:**
- Owner of: `playlist-own1`
- Collaborator of: `playlist-abc123` (owned by User A)

```json
GET /playlists
Authorization: Bearer <userB-token>

Response (200):
{
  "status": "success",
  "data": {
    "playlists": [
      {
        "id": "playlist-own1",
        "name": "My Playlist",
        "username": "userB"
      },
      {
        "id": "playlist-abc123",
        "name": "Rock Classics",
        "username": "userA"
      }
    ]
  }
}
```

---

### **Scenario 4: Remove Collaborator**

```json
DELETE /collaborations
Authorization: Bearer <userA-token>  // Owner
{
  "playlistId": "playlist-abc123",
  "userId": "user-xyz789"
}

Response (200):
{
  "status": "success",
  "message": "Kolaborator berhasil dihapus."
}
```

**Result:** User B can no longer access playlist-abc123

---

### **Scenario 5: Duplicate Collaborator (Fail)**

```json
POST /collaborations
Authorization: Bearer <userA-token>
{
  "playlistId": "playlist-abc123",
  "userId": "user-xyz789"  // Already a collaborator
}

Response (400):
{
  "status": "fail",
  "message": "Kolaborator sudah ditambahkan"
}
```

---

### **Scenario 6: Add Non-Existent User (Fail)**

```json
POST /collaborations
Authorization: Bearer <userA-token>
{
  "playlistId": "playlist-abc123",
  "userId": "user-notexist"
}

Response (404):
{
  "status": "fail",
  "message": "User tidak ditemukan"
}
```

---

## 📁 File Structure

```
migrations/
  └── 1760973650120_create-table-collaborations.js  ✅ New

src/
  ├── services/
  │   ├── CollaborationsService.js                  ✅ New
  │   └── PlaylistsService.js                       ✅ Modified
  │
  ├── validator/
  │   └── collaborations.js                         ✅ New
  │
  ├── api/
  │   ├── collaborations/
  │   │   ├── handler.js                            ✅ New
  │   │   └── routes.js                             ✅ New
  │   │
  │   └── playlists/
  │       └── handler.js                            ✅ Modified
  │
  └── server.js                                     ✅ Modified
```

---

## ✅ Checklist

- [x] ✅ **Database Migration** - Created `collaborations` table with FKs
- [x] ✅ **CollaborationsService** - Implemented add/delete/verify methods
- [x] ✅ **CollaborationsValidator** - Payload validation (playlistId, userId)
- [x] ✅ **CollaborationsHandler** - POST & DELETE endpoints
- [x] ✅ **CollaborationsRoutes** - Route configuration with JWT auth
- [x] ✅ **PlaylistsService.verifyPlaylistAccess** - Owner OR Collaborator check
- [x] ✅ **PlaylistsService.getPlaylists** - UNION query for owned + collaborated
- [x] ✅ **Updated playlist handlers** - Use `verifyPlaylistAccess` for song operations
- [x] ✅ **Server.js registration** - Added CollaborationsService and routes
- [x] ✅ **Migration executed** - Table created successfully
- [x] ✅ **Git commit** - Committed with proper message

---

## 🎯 Key Implementation Points

### **1. CRITICAL Authorization Distinction**

**Adding/Removing Collaborators:** OWNER ONLY
```javascript
// Uses verifyPlaylistOwner (strict owner check)
await this._playlistsService.verifyPlaylistOwner(playlistId, ownerId);
```

**Managing Songs in Playlist:** OWNER OR COLLABORATOR
```javascript
// Uses verifyPlaylistAccess (owner OR collaborator)
await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
```

### **2. SQL UNION Pattern**

```sql
-- Pattern for checking owner OR collaborator
SELECT playlists.id FROM playlists WHERE owner = $1
UNION
SELECT playlists.id FROM playlists 
INNER JOIN collaborations ON collaborations.playlist_id = playlists.id
WHERE collaborations.user_id = $1
```

### **3. Error Handling**

- ✅ `NotFoundError` (404) - Playlist/User tidak ditemukan
- ✅ `AuthorizationError` (403) - Tidak punya akses
- ✅ `InvariantError` (400) - Validation errors, duplicate collaborator

### **4. Cascade Delete**

When playlist is deleted → all collaborations are deleted (CASCADE)
When user is deleted → all collaborations are deleted (CASCADE)

---

## 🚀 Kesimpulan

**STATUS: ✅ OPTIONAL CRITERIA 1 FULLY IMPLEMENTED!**

Fitur kolaborasi playlist sudah terimplementasi dengan lengkap:

1. ✅ **2 new endpoints** untuk manajemen kolaborator
2. ✅ **Database table** dengan proper foreign keys dan constraints
3. ✅ **Authorization logic** yang membedakan owner vs collaborator
4. ✅ **UNION query** untuk menggabungkan owned dan collaborated playlists
5. ✅ **Complete validation** dan error handling
6. ✅ **Proper separation of concerns** (owner-only vs owner+collaborator actions)

**Features Working:**
- ✅ Owner dapat menambahkan/menghapus kolaborator
- ✅ Kolaborator dapat mengelola lagu dalam playlist
- ✅ Kolaborator tidak dapat delete playlist atau add/remove kolaborator lain
- ✅ GET /playlists mengembalikan owned + collaborated playlists
- ✅ Semua endpoint dengan proper authentication dan authorization

**Tidak ada yang perlu ditambahkan!** 🎉
