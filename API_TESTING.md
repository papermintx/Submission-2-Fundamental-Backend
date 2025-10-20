# API Testing Guide

## Prerequisites
Make sure the server is running: `npm run start`

## Test Using PowerShell

### 1. Create an Album
```powershell
$body = @{
    name = "Bohemian Rhapsody Album"
    year = 1975
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/albums" -Method Post -Body $body -ContentType "application/json"
```

### 2. Get Album by ID (replace {albumId} with actual ID from step 1)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/albums/{albumId}" -Method Get
```

### 3. Create a Song
```powershell
$body = @{
    title = "Bohemian Rhapsody"
    year = 1975
    genre = "Rock"
    performer = "Queen"
    duration = 354
    albumId = "{albumId}"  # Replace with actual album ID
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Post -Body $body -ContentType "application/json"
```

### 4. Get All Songs
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/songs" -Method Get
```

### 5. Search Songs by Title
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/songs?title=Bohemian" -Method Get
```

### 6. Search Songs by Performer
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/songs?performer=Queen" -Method Get
```

### 7. Get Song by ID (replace {songId} with actual ID)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/songs/{songId}" -Method Get
```

### 8. Update Album
```powershell
$body = @{
    name = "A Night at the Opera"
    year = 1975
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/albums/{albumId}" -Method Put -Body $body -ContentType "application/json"
```

### 9. Update Song
```powershell
$body = @{
    title = "Bohemian Rhapsody (Remastered)"
    year = 1975
    genre = "Progressive Rock"
    performer = "Queen"
    duration = 354
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/songs/{songId}" -Method Put -Body $body -ContentType "application/json"
```

### 10. Delete Song
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/songs/{songId}" -Method Delete
```

### 11. Delete Album
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/albums/{albumId}" -Method Delete
```

## Test Validation Errors

### Missing required field (should return 400 error)
```powershell
$body = @{
    name = "Test Album"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/albums" -Method Post -Body $body -ContentType "application/json"
```

### Invalid data type (should return 400 error)
```powershell
$body = @{
    name = "Test Album"
    year = "not a number"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/albums" -Method Post -Body $body -ContentType "application/json"
```

### Get non-existent resource (should return 404 error)
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/albums/invalid-id" -Method Get
```

## Alternative: Using curl

If you have curl installed, you can also use these commands:

### Create Album
```bash
curl -X POST http://localhost:5000/albums -H "Content-Type: application/json" -d "{\"name\":\"Test Album\",\"year\":2024}"
```

### Get Album
```bash
curl http://localhost:5000/albums/{albumId}
```

### Create Song
```bash
curl -X POST http://localhost:5000/songs -H "Content-Type: application/json" -d "{\"title\":\"Test Song\",\"year\":2024,\"genre\":\"Rock\",\"performer\":\"Test Artist\"}"
```

### Search Songs
```bash
curl "http://localhost:5000/songs?title=Test&performer=Artist"
```
