# OpenMusic API - Complete Example Workflow

This document demonstrates a complete workflow using the OpenMusic API.

## Scenario: Managing Queen's Discography

### Step 1: Create Albums

```powershell
# Create "A Night at the Opera" album
$album1 = @{
    name = "A Night at the Opera"
    year = 1975
} | ConvertTo-Json

$result1 = Invoke-RestMethod -Uri "http://localhost:5000/albums" -Method Post -Body $album1 -ContentType "application/json"
$albumId1 = $result1.data.albumId
Write-Host "Created Album ID: $albumId1"

# Create "The Game" album
$album2 = @{
    name = "The Game"
    year = 1980
} | ConvertTo-Json

$result2 = Invoke-RestMethod -Uri "http://localhost:5000/albums" -Method Post -Body $album2 -ContentType "application/json"
$albumId2 = $result2.data.albumId
Write-Host "Created Album ID: $albumId2"
```

### Step 2: Add Songs to Albums

```powershell
# Add songs to "A Night at the Opera"
$song1 = @{
    title = "Bohemian Rhapsody"
    year = 1975
    genre = "Progressive Rock"
    performer = "Queen"
    duration = 354
    albumId = $albumId1
} | ConvertTo-Json

$songResult1 = Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Post -Body $song1 -ContentType "application/json"
Write-Host "Created Song: Bohemian Rhapsody"

$song2 = @{
    title = "Love of My Life"
    year = 1975
    genre = "Rock Ballad"
    performer = "Queen"
    duration = 213
    albumId = $albumId1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Post -Body $song2 -ContentType "application/json"
Write-Host "Created Song: Love of My Life"

# Add songs to "The Game"
$song3 = @{
    title = "Another One Bites the Dust"
    year = 1980
    genre = "Funk Rock"
    performer = "Queen"
    duration = 215
    albumId = $albumId2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Post -Body $song3 -ContentType "application/json"
Write-Host "Created Song: Another One Bites the Dust"

$song4 = @{
    title = "Crazy Little Thing Called Love"
    year = 1980
    genre = "Rockabilly"
    performer = "Queen"
    duration = 163
    albumId = $albumId2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Post -Body $song4 -ContentType "application/json"
Write-Host "Created Song: Crazy Little Thing Called Love"

# Add a song without album (standalone single)
$song5 = @{
    title = "Under Pressure"
    year = 1981
    genre = "Rock"
    performer = "Queen & David Bowie"
    duration = 248
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Post -Body $song5 -ContentType "application/json"
Write-Host "Created Song: Under Pressure (standalone)"
```

### Step 3: Retrieve Album with Songs

```powershell
# Get "A Night at the Opera" with all its songs
$album = Invoke-RestMethod -Uri "http://localhost:5000/albums/$albumId1" -Method Get
Write-Host "`nAlbum: $($album.data.album.name) ($($album.data.album.year))"
Write-Host "Songs in this album:"
$album.data.album.songs | ForEach-Object {
    Write-Host "  - $($_.title) by $($_.performer)"
}
```

Expected output:
```
Album: A Night at the Opera (1975)
Songs in this album:
  - Bohemian Rhapsody by Queen
  - Love of My Life by Queen
```

### Step 4: Search for Songs

```powershell
# Search by title
Write-Host "`nSearching for songs with 'Love' in title:"
$searchTitle = Invoke-RestMethod -Uri "http://localhost:5000/songs?title=Love" -Method Get
$searchTitle.data.songs | ForEach-Object {
    Write-Host "  - $($_.title) by $($_.performer)"
}

# Search by performer
Write-Host "`nSearching for songs by 'Queen':"
$searchPerformer = Invoke-RestMethod -Uri "http://localhost:5000/songs?performer=Queen" -Method Get
$searchPerformer.data.songs | ForEach-Object {
    Write-Host "  - $($_.title) by $($_.performer)"
}

# Combined search
Write-Host "`nSearching for songs by 'Queen' with 'Another' in title:"
$searchCombined = Invoke-RestMethod -Uri "http://localhost:5000/songs?title=Another&performer=Queen" -Method Get
$searchCombined.data.songs | ForEach-Object {
    Write-Host "  - $($_.title) by $($_.performer)"
}
```

### Step 5: Get All Songs

```powershell
Write-Host "`nAll songs in database:"
$allSongs = Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Get
$allSongs.data.songs | ForEach-Object {
    Write-Host "  - $($_.title) by $($_.performer)"
}
```

### Step 6: Update Data

```powershell
# Update album year (correction)
$updateAlbum = @{
    name = "A Night at the Opera"
    year = 1975
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/albums/$albumId1" -Method Put -Body $updateAlbum -ContentType "application/json"
Write-Host "`nAlbum updated successfully"

# Update song (add duration that was missing)
$updateSong = @{
    title = "Bohemian Rhapsody"
    year = 1975
    genre = "Progressive Rock"
    performer = "Queen"
    duration = 354
    albumId = $albumId1
} | ConvertTo-Json

$songId = $songResult1.data.songId
Invoke-RestMethod -Uri "http://localhost:5000/songs/$songId" -Method Put -Body $updateSong -ContentType "application/json"
Write-Host "Song updated successfully"
```

### Step 7: Error Handling Examples

```powershell
# Test validation error (missing required field)
Write-Host "`nTesting validation error..."
try {
    $invalidAlbum = @{
        name = "Test Album"
        # year is missing
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/albums" -Method Post -Body $invalidAlbum -ContentType "application/json"
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error (Expected): $($error.message)"
}

# Test not found error
Write-Host "`nTesting not found error..."
try {
    Invoke-RestMethod -Uri "http://localhost:5000/albums/invalid-id" -Method Get
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "Error (Expected): $($error.message)"
}
```

### Step 8: Cleanup (Optional)

```powershell
# Delete individual songs
Write-Host "`nDeleting standalone song..."
# Get song ID first, then delete
# Invoke-RestMethod -Uri "http://localhost:5000/songs/{songId}" -Method Delete

# Delete album (this will also delete associated songs due to CASCADE)
Write-Host "Deleting album (will also delete associated songs)..."
# Invoke-RestMethod -Uri "http://localhost:5000/albums/$albumId1" -Method Delete
# Invoke-RestMethod -Uri "http://localhost:5000/albums/$albumId2" -Method Delete
```

## Complete PowerShell Script

Save this as `test-api.ps1`:

```powershell
# Test OpenMusic API

$baseUrl = "http://localhost:5000"

Write-Host "=== OpenMusic API Test ===" -ForegroundColor Green

# Create Album
Write-Host "`n1. Creating album..." -ForegroundColor Yellow
$album = @{
    name = "Test Album"
    year = 2024
} | ConvertTo-Json

$albumResult = Invoke-RestMethod -Uri "$baseUrl/albums" -Method Post -Body $album -ContentType "application/json"
$albumId = $albumResult.data.albumId
Write-Host "Album created: $albumId" -ForegroundColor Green

# Create Songs
Write-Host "`n2. Creating songs..." -ForegroundColor Yellow
$song1 = @{
    title = "Test Song 1"
    year = 2024
    genre = "Rock"
    performer = "Test Artist"
    duration = 180
    albumId = $albumId
} | ConvertTo-Json

$songResult1 = Invoke-RestMethod -Uri "$baseUrl/songs" -Method Post -Body $song1 -ContentType "application/json"
Write-Host "Song 1 created: $($songResult1.data.songId)" -ForegroundColor Green

$song2 = @{
    title = "Test Song 2"
    year = 2024
    genre = "Pop"
    performer = "Test Artist"
    duration = 200
    albumId = $albumId
} | ConvertTo-Json

$songResult2 = Invoke-RestMethod -Uri "$baseUrl/songs" -Method Post -Body $song2 -ContentType "application/json"
Write-Host "Song 2 created: $($songResult2.data.songId)" -ForegroundColor Green

# Get Album with Songs
Write-Host "`n3. Getting album with songs..." -ForegroundColor Yellow
$getAlbum = Invoke-RestMethod -Uri "$baseUrl/albums/$albumId" -Method Get
Write-Host "Album: $($getAlbum.data.album.name)" -ForegroundColor Green
Write-Host "Songs count: $($getAlbum.data.album.songs.Count)" -ForegroundColor Green

# Search Songs
Write-Host "`n4. Searching songs..." -ForegroundColor Yellow
$searchResult = Invoke-RestMethod -Uri "$baseUrl/songs?performer=Test" -Method Get
Write-Host "Found $($searchResult.data.songs.Count) songs" -ForegroundColor Green

Write-Host "`n=== Test Completed ===" -ForegroundColor Green
```

Run with: `.\test-api.ps1`
