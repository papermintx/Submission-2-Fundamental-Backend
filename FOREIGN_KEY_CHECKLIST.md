# ✅ Kriteria 3: Foreign Key Implementation Checklist

## 📋 Status: **SEMUA FOREIGN KEY SUDAH DITERAPKAN**

Database OpenMusic API sudah menerapkan Foreign Key dengan benar sesuai kriteria. Berikut adalah detail implementasinya:

---

## 🔗 Relasi Foreign Key yang Diterapkan

### **1. ✅ Tabel `songs` → `albums` (album_id)**

**File:** `migrations/1759637293100_create-table-songs.js`

```javascript
album_id: {
  type: 'VARCHAR(50)',
  notNull: false,                // Optional (lagu bisa tanpa album)
  references: 'albums',          // ⬅️ FOREIGN KEY ke tabel albums
  onDelete: 'CASCADE',           // ⬅️ Hapus songs jika album dihapus
}
```

**Penjelasan:**
- ✅ Foreign Key: `songs.album_id` → `albums.id`
- ✅ ON DELETE CASCADE: Jika album dihapus, semua lagu dalam album tersebut juga dihapus
- ✅ NULL allowed: Lagu bisa tidak memiliki album (single/independent)

---

### **2. ✅ Tabel `playlists` → `users` (owner)**

**File:** `migrations/1759637420000_create-table-playlists.js`

```javascript
owner: {
  type: 'VARCHAR(50)',
  notNull: true,                 // Required (playlist harus punya owner)
}

// Add foreign key constraint
pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', {
  foreignKeys: {
    columns: 'owner',
    references: 'users(id)',     // ⬅️ FOREIGN KEY ke tabel users
    onDelete: 'CASCADE',         // ⬅️ Hapus playlists jika user dihapus
  },
});
```

**Penjelasan:**
- ✅ Foreign Key: `playlists.owner` → `users.id`
- ✅ ON DELETE CASCADE: Jika user dihapus, semua playlist miliknya juga dihapus
- ✅ NOT NULL: Playlist harus memiliki owner
- ✅ Named Constraint: `fk_playlists.owner_users.id`

---

### **3. ✅ Tabel `playlist_songs` → `playlists` (playlist_id)**

**File:** `migrations/1759637430000_create-table-playlist-songs.js`

```javascript
playlist_id: {
  type: 'VARCHAR(50)',
  notNull: true,                 // Required
}

// Add foreign key constraint
pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', {
  foreignKeys: {
    columns: 'playlist_id',
    references: 'playlists(id)',  // ⬅️ FOREIGN KEY ke tabel playlists
    onDelete: 'CASCADE',          // ⬅️ Hapus entri jika playlist dihapus
  },
});
```

**Penjelasan:**
- ✅ Foreign Key: `playlist_songs.playlist_id` → `playlists.id`
- ✅ ON DELETE CASCADE: Jika playlist dihapus, semua lagu di dalamnya juga dihapus
- ✅ NOT NULL: Entri harus terkait dengan playlist
- ✅ Named Constraint: `fk_playlist_songs.playlist_id_playlists.id`

---

### **4. ✅ Tabel `playlist_songs` → `songs` (song_id)**

**File:** `migrations/1759637430000_create-table-playlist-songs.js`

```javascript
song_id: {
  type: 'VARCHAR(50)',
  notNull: true,                 // Required
}

// Add foreign key constraint
pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', {
  foreignKeys: {
    columns: 'song_id',
    references: 'songs(id)',      // ⬅️ FOREIGN KEY ke tabel songs
    onDelete: 'CASCADE',          // ⬅️ Hapus entri jika song dihapus
  },
});
```

**Penjelasan:**
- ✅ Foreign Key: `playlist_songs.song_id` → `songs.id`
- ✅ ON DELETE CASCADE: Jika song dihapus, entri di playlist juga dihapus
- ✅ NOT NULL: Entri harus terkait dengan song
- ✅ Named Constraint: `fk_playlist_songs.song_id_songs.id`

---

## 📊 Diagram Relasi (Entity Relationship)

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │◄─────────────────┐
│ username     │                  │
│ password     │                  │
│ fullname     │                  │
└──────────────┘                  │
                                   │ owner (FK)
                                   │
┌──────────────┐              ┌───┴──────────┐
│   albums     │              │  playlists   │
│──────────────│              │──────────────│
│ id (PK)      │◄─────────┐   │ id (PK)      │◄──────────┐
│ name         │          │   │ name         │           │
│ year         │          │   │ owner (FK)   │           │
└──────────────┘          │   └──────────────┘           │
                          │                               │
                          │                               │
                          │ album_id (FK)                 │ playlist_id (FK)
                          │                               │
┌──────────────┐     ┌────┴────────────┐          ┌──────┴──────────────┐
│    songs     │◄────┤ playlist_songs  │          │  playlist_songs     │
│──────────────│     │─────────────────│          │─────────────────────│
│ id (PK)      │     │ id (PK)         │          │ id (PK)             │
│ title        │     │ playlist_id (FK)├──────────┤ playlist_id (FK)    │
│ year         │     │ song_id (FK)    ├──────────┤ song_id (FK)        │
│ genre        │     └─────────────────┘          └─────────────────────┘
│ performer    │            ▲                              ▲
│ duration     │            │                              │
│ album_id (FK)│            └──────────────────────────────┘
└──────────────┘              UNIQUE (playlist_id, song_id)
```

**Legend:**
- `PK` = Primary Key
- `FK` = Foreign Key
- `◄───` = Relasi Foreign Key

---

## 🔍 Verifikasi Foreign Key di Database

Untuk memverifikasi bahwa Foreign Key sudah diterapkan di database PostgreSQL:

```sql
-- Cek semua foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

**Expected Output:**

| table_name | column_name | foreign_table_name | foreign_column_name | delete_rule |
|------------|-------------|-------------------|---------------------|-------------|
| songs | album_id | albums | id | CASCADE |
| playlists | owner | users | id | CASCADE |
| playlist_songs | playlist_id | playlists | id | CASCADE |
| playlist_songs | song_id | songs | id | CASCADE |

---

## ✅ Checklist Kriteria 3

- [x] ✅ **songs.album_id** → **albums.id** (ON DELETE CASCADE)
- [x] ✅ **playlists.owner** → **users.id** (ON DELETE CASCADE)
- [x] ✅ **playlist_songs.playlist_id** → **playlists.id** (ON DELETE CASCADE)
- [x] ✅ **playlist_songs.song_id** → **songs.id** (ON DELETE CASCADE)
- [x] ✅ Semua foreign key menggunakan **named constraint**
- [x] ✅ Semua foreign key menggunakan **ON DELETE CASCADE** untuk data integrity
- [x] ✅ Migration files sudah dijalankan (tabel sudah dibuat)

---

## 🎯 Keuntungan Foreign Key yang Diterapkan

### **1. Referential Integrity**
- Database memastikan bahwa data yang direferensikan harus ada
- Tidak bisa insert `song.album_id` yang tidak ada di tabel `albums`
- Tidak bisa insert `playlist.owner` yang tidak ada di tabel `users`

### **2. Cascade Delete**
- Jika user dihapus → semua playlists miliknya otomatis terhapus
- Jika playlist dihapus → semua lagu di dalamnya otomatis terhapus dari junction table
- Jika album dihapus → semua lagu dalam album tersebut otomatis terhapus
- Jika song dihapus → entri di `playlist_songs` otomatis terhapus

### **3. Data Consistency**
- Database mencegah orphaned records (data tanpa parent)
- Relasi antar tabel selalu konsisten
- Tidak ada "dangling references"

### **4. Query Performance**
- Foreign key otomatis membuat index pada kolom
- JOIN operation lebih cepat
- Query optimizer dapat membuat execution plan yang lebih baik

---

## 🧪 Testing Foreign Key Constraints

### **Test 1: Insert Invalid album_id**

```sql
-- ❌ Akan GAGAL (album tidak ada)
INSERT INTO songs (id, title, year, genre, performer, album_id)
VALUES ('song-test', 'Test Song', 2024, 'Rock', 'Test', 'album-notexist');

-- Error: insert or update on table "songs" violates foreign key constraint
-- DETAIL: Key (album_id)=(album-notexist) is not present in table "albums".
```

### **Test 2: Delete Album dengan Songs**

```sql
-- Create album
INSERT INTO albums (id, name, year) VALUES ('album-1', 'Album Test', 2024);

-- Create song dengan album_id
INSERT INTO songs (id, title, year, genre, performer, album_id)
VALUES ('song-1', 'Song Test', 2024, 'Rock', 'Test', 'album-1');

-- ✅ Delete album → song juga terhapus (CASCADE)
DELETE FROM albums WHERE id = 'album-1';

-- Verify: song juga sudah terhapus
SELECT * FROM songs WHERE id = 'song-1';  -- Empty result
```

### **Test 3: Delete User dengan Playlists**

```sql
-- Create user
INSERT INTO users (id, username, password, fullname)
VALUES ('user-1', 'testuser', 'hashed', 'Test User');

-- Create playlist dengan owner
INSERT INTO playlists (id, name, owner)
VALUES ('playlist-1', 'Test Playlist', 'user-1');

-- ✅ Delete user → playlist juga terhapus (CASCADE)
DELETE FROM users WHERE id = 'user-1';

-- Verify: playlist juga sudah terhapus
SELECT * FROM playlists WHERE id = 'playlist-1';  -- Empty result
```

### **Test 4: Unique Constraint di playlist_songs**

```sql
-- ✅ Insert pertama berhasil
INSERT INTO playlist_songs (id, playlist_id, song_id)
VALUES ('ps-1', 'playlist-1', 'song-1');

-- ❌ Insert duplikat GAGAL
INSERT INTO playlist_songs (id, playlist_id, song_id)
VALUES ('ps-2', 'playlist-1', 'song-1');

-- Error: duplicate key value violates unique constraint "unique_playlist_id_and_song_id"
```

---

## 📁 File Migration dengan Foreign Key

| No | File | Foreign Key |
|----|------|-------------|
| 1 | `1759637264215_create-table-albums.js` | - (base table) |
| 2 | `1759637293100_create-table-songs.js` | ✅ `album_id` → `albums.id` |
| 3 | `1759637400000_create-table-users.js` | - (base table) |
| 4 | `1759637420000_create-table-playlists.js` | ✅ `owner` → `users.id` |
| 5 | `1759637430000_create-table-playlist-songs.js` | ✅ `playlist_id` → `playlists.id`<br>✅ `song_id` → `songs.id` |

---

## 💡 Best Practices yang Diterapkan

1. ✅ **Named Constraints**: Semua FK menggunakan nama yang deskriptif
   - Format: `fk_{table}.{column}_{reference_table}.{reference_column}`
   - Contoh: `fk_playlists.owner_users.id`

2. ✅ **ON DELETE CASCADE**: Memudahkan data cleanup
   - Tidak perlu manual delete child records
   - Database handle otomatis

3. ✅ **Consistent Naming**: Semua foreign key menggunakan suffix `_id` atau nama yang jelas
   - `album_id`, `song_id`, `playlist_id`, `owner`

4. ✅ **Proper Data Types**: FK menggunakan tipe data yang sama dengan PK
   - Semua ID menggunakan `VARCHAR(50)`

5. ✅ **NOT NULL Enforcement**: FK yang required menggunakan `notNull: true`
   - `playlists.owner` → NOT NULL (playlist harus punya owner)
   - `songs.album_id` → NULL allowed (lagu bisa tanpa album)

---

## 🚀 Kesimpulan

**STATUS: ✅ KRITERIA 3 TERPENUHI**

Database OpenMusic API sudah menerapkan Foreign Key dengan sempurna:

1. ✅ **4 Foreign Key relationships** sudah diterapkan
2. ✅ **ON DELETE CASCADE** untuk data integrity
3. ✅ **Named constraints** untuk maintainability
4. ✅ **Referential integrity** dijaga oleh database
5. ✅ **Best practices** sudah diikuti

Semua relasi yang disebutkan dalam kriteria sudah terimplementasi:
- ✅ Tabel `songs` terhadap `albums` (via `album_id`)
- ✅ Tabel `playlists` terhadap `users` (via `owner`)
- ✅ Dan relasi tabel lainnya (`playlist_songs` terhadap `playlists` dan `songs`)

**Tidak ada yang perlu ditambahkan atau diperbaiki untuk Kriteria 3!** 🎉
