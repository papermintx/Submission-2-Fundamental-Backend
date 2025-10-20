# Database Setup Instructions

## Step 1: Install PostgreSQL

If you haven't installed PostgreSQL yet:
1. Download from: https://www.postgresql.org/download/windows/
2. Install and remember your postgres user password
3. Add PostgreSQL to your PATH if not done automatically

## Step 2: Create Database

Open PowerShell or Command Prompt and run:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE openmusic;

# Exit psql
\q
```

Or use a single command:
```powershell
psql -U postgres -c "CREATE DATABASE openmusic;"
```

## Step 3: Configure .env file

Edit the `.env` file in the project root and update the database credentials:

```
HOST=localhost
PORT=5000

PGUSER=postgres
PGPASSWORD=your_actual_password_here
PGDATABASE=openmusic
PGHOST=localhost
PGPORT=5432
```

## Step 4: Run Migrations

In the project directory:

```powershell
npm run migrate up
```

This will create the `albums` and `songs` tables in your database.

## Step 5: Verify Setup

You can verify the tables were created by connecting to the database:

```powershell
psql -U postgres -d openmusic

# List tables
\dt

# View albums table structure
\d albums

# View songs table structure
\d songs

# Exit
\q
```

## Step 6: Start the Server

```powershell
npm run start
```

You should see:
```
Server running on http://localhost:5000
```

## Troubleshooting

### Error: "database openmusic does not exist"
Run: `psql -U postgres -c "CREATE DATABASE openmusic;"`

### Error: "password authentication failed"
Update the PGPASSWORD in your .env file with the correct password

### Error: "ECONNREFUSED"
Make sure PostgreSQL service is running:
```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL if not running
Start-Service postgresql-x64-XX  # Replace XX with your version
```

### Migration errors
If migrations fail, you can rollback:
```powershell
npm run migrate down
```

Then try running up again:
```powershell
npm run migrate up
```

## Manual Table Creation (Alternative)

If migrations don't work, you can create tables manually:

```sql
-- Connect to database
psql -U postgres -d openmusic

-- Create albums table
CREATE TABLE albums (
    id VARCHAR(50) PRIMARY KEY,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create songs table
CREATE TABLE songs (
    id VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    performer TEXT NOT NULL,
    duration INTEGER,
    album_id VARCHAR(50) REFERENCES albums(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```
