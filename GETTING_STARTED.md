# OpenMusic API - Quick Start Guide

## 🎯 What You Have

A complete RESTful API built with **Hapi.js** and **PostgreSQL** that manages music albums and songs with full CRUD operations, search functionality, and proper data validation.

## 📋 Prerequisites Before Running

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
3. **npm** (comes with Node.js)

## 🚀 Quick Setup (5 Steps)

### Step 1: Install PostgreSQL & Create Database
```powershell
# After installing PostgreSQL, create the database:
psql -U postgres -c "CREATE DATABASE openmusic;"
```

### Step 2: Configure Environment Variables
Edit the `.env` file and update with your PostgreSQL credentials:
```
PGUSER=postgres
PGPASSWORD=your_actual_password_here
PGDATABASE=openmusic
PGHOST=localhost
PGPORT=5432
```

### Step 3: Install Dependencies (Already Done)
```powershell
npm install
```
✅ This was already done during setup!

### Step 4: Run Database Migrations
```powershell
npm run migrate up
```
This creates the `albums` and `songs` tables.

### Step 5: Start the Server
```powershell
npm run start
```
You should see: `Server running on http://localhost:5000`

## ✅ Testing Your API

### Simple Test in PowerShell:

```powershell
# Create an album
$album = @{
    name = "My First Album"
    year = 2024
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/albums" -Method Post -Body $album -ContentType "application/json"
```

If successful, you'll get:
```json
{
  "status": "success",
  "data": {
    "albumId": "album-xxxxxxxxxxxxxxxx"
  }
}
```

## 📚 Documentation Files

- **README.md** - Complete project documentation
- **DATABASE_SETUP.md** - Detailed database setup instructions
- **API_TESTING.md** - How to test all API endpoints
- **EXAMPLES.md** - Complete usage examples
- **REQUIREMENTS_CHECKLIST.md** - All requirements verification

## 🎵 API Endpoints Summary

### Albums
- `POST /albums` - Create album
- `GET /albums/{id}` - Get album with songs
- `PUT /albums/{id}` - Update album
- `DELETE /albums/{id}` - Delete album

### Songs
- `POST /songs` - Create song
- `GET /songs` - Get all songs (supports ?title=... &performer=...)
- `GET /songs/{id}` - Get song by ID
- `PUT /songs/{id}` - Update song
- `DELETE /songs/{id}` - Delete song

## 🔧 Project Structure

```
sub1/
├── src/
│   ├── api/                # API handlers and routes
│   ├── exceptions/         # Custom error classes
│   ├── services/           # Business logic
│   ├── validator/          # Input validation
│   └── server.js           # Main server file
├── migrations/             # Database migrations
├── .env                    # Environment configuration
└── package.json            # Dependencies and scripts
```

## ⚙️ Available npm Scripts

```powershell
npm run start              # Start the server
npm run migrate up         # Run database migrations
npm run migrate down       # Rollback migrations
npm run migrate create name # Create new migration
```

## 🐛 Troubleshooting

### Error: "database openmusic does not exist"
**Solution:** Run `psql -U postgres -c "CREATE DATABASE openmusic;"`

### Error: "password authentication failed"
**Solution:** Update `PGPASSWORD` in `.env` file

### Error: "ECONNREFUSED"
**Solution:** Make sure PostgreSQL service is running

### Migration fails
**Solution:**
```powershell
npm run migrate down    # Rollback
npm run migrate up      # Try again
```

## ✨ Features Implemented

✅ Hapi.js framework only
✅ Full CRUD for Albums & Songs
✅ PostgreSQL with raw SQL (no ORMs)
✅ Database migrations with node-pg-migrate
✅ Environment variables with dotenv
✅ Data validation on all inputs
✅ Comprehensive error handling (400, 404, 500)
✅ Album-Song relationships
✅ Song search by title and performer
✅ Correct response formats
✅ HOST and PORT configuration
✅ npm run start script

## 📖 Next Steps

1. **Run the database setup** (Step 1-4 above)
2. **Start the server** (Step 5)
3. **Test with PowerShell** commands from `API_TESTING.md`
4. **Read EXAMPLES.md** for complete workflows
5. **Explore the code** in the `src/` directory

## 💡 Tips

- All endpoints return JSON
- Validation errors return 400 status
- Not found errors return 404 status
- Server errors return 500 status
- Songs can be searched by partial title/performer match
- Getting an album includes all its songs
- Deleting an album also deletes its songs (CASCADE)

## 🎓 Learning Resources

The code includes:
- Clean architecture (separation of concerns)
- Error handling patterns
- SQL query examples
- REST API best practices
- Environment configuration
- Database migrations

## 📞 Need Help?

1. Check `DATABASE_SETUP.md` for database issues
2. Check `API_TESTING.md` for API usage
3. Check `EXAMPLES.md` for complete examples
4. Check `REQUIREMENTS_CHECKLIST.md` for implementation details

---

**You're all set! Happy coding! 🎵**

Run `npm run start` and your OpenMusic API will be live! 🚀
