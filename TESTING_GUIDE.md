# Quick Test Guide for Authentication

This guide will help you quickly test all authentication endpoints.

## Prerequisites

1. **Setup `.env` file** with these variables:
```env
HOST=localhost
PORT=5000
PGUSER=your_db_user
PGHOST=localhost
PGPASSWORD=your_db_password
PGDATABASE=openmusic
PGPORT=5432
ACCESS_TOKEN_KEY=your_access_token_secret
REFRESH_TOKEN_KEY=your_refresh_token_secret
ACCESS_TOKEN_AGE=1800
```

2. **Run migrations:**
```bash
npm run migrate up
```

3. **Start the server:**
```bash
npm start
```

---

## Test Scenarios

### ✅ Test 1: User Registration

**Request:**
```http
POST http://localhost:5000/users
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123",
  "fullname": "Test User"
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

**Test duplicate username:**
```http
POST http://localhost:5000/users
Content-Type: application/json

{
  "username": "testuser",
  "password": "password456",
  "fullname": "Another User"
}
```

**Expected Response (400):**
```json
{
  "status": "fail",
  "message": "Gagal menambahkan user. Username sudah digunakan."
}
```

---

### ✅ Test 2: Login (POST /authentications)

**Request:**
```http
POST http://localhost:5000/authentications
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
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

**Save both tokens for next tests!**

**Test wrong credentials:**
```http
POST http://localhost:5000/authentications
Content-Type: application/json

{
  "username": "testuser",
  "password": "wrongpassword"
}
```

**Expected Response (400):**
```json
{
  "status": "fail",
  "message": "Kredensial yang Anda berikan salah"
}
```

---

### ✅ Test 3: Refresh Token (PUT /authentications)

**Request:**
```http
PUT http://localhost:5000/authentications
Content-Type: application/json

{
  "refreshToken": "paste_your_refresh_token_here"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Test invalid refresh token:**
```http
PUT http://localhost:5000/authentications
Content-Type: application/json

{
  "refreshToken": "invalid_token"
}
```

**Expected Response (400):**
```json
{
  "status": "fail",
  "message": "Refresh token tidak valid"
}
```

---

### ✅ Test 4: Logout (DELETE /authentications)

**Request:**
```http
DELETE http://localhost:5000/authentications
Content-Type: application/json

{
  "refreshToken": "paste_your_refresh_token_here"
}
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Refresh token berhasil dihapus"
}
```

**Test logout again with same token:**
```http
DELETE http://localhost:5000/authentications
Content-Type: application/json

{
  "refreshToken": "same_refresh_token"
}
```

**Expected Response (400):**
```json
{
  "status": "fail",
  "message": "Refresh token tidak valid"
}
```

---

## Using cURL Commands

If you prefer cURL:

**Register:**
```bash
curl -X POST http://localhost:5000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","fullname":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/authentications \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

**Refresh Token:**
```bash
curl -X PUT http://localhost:5000/authentications \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

**Logout:**
```bash
curl -X DELETE http://localhost:5000/authentications \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

---

## Using Postman

1. Import the collection or create requests manually
2. Set `Content-Type: application/json` header
3. For testing refresh/logout, save tokens as environment variables
4. Use `{{refreshToken}}` in request body

---

## Database Verification

Check if data is stored correctly:

**Check users table:**
```sql
SELECT * FROM users;
```

**Check authentications table:**
```sql
SELECT * FROM authentications;
```

**After logout, authentications table should be empty or without that token.**

---

## Troubleshooting

### ❌ "Cannot connect to database"
- Check PostgreSQL is running
- Verify `.env` database credentials
- Ensure database exists: `CREATE DATABASE openmusic;`

### ❌ "Relation does not exist"
- Run migrations: `npm run migrate up`

### ❌ "Invalid token"
- Check `ACCESS_TOKEN_KEY` and `REFRESH_TOKEN_KEY` in `.env`
- Ensure tokens are not expired
- Verify token hasn't been deleted from database

### ❌ "Username already exists"
- This is expected behavior for duplicate registrations
- Use a different username

---

## Expected Flow

1. **Register** → Get `userId`
2. **Login** → Get `accessToken` and `refreshToken`
3. **Use accessToken** for protected routes (when implemented)
4. **When accessToken expires** → Use `refreshToken` to get new `accessToken`
5. **Logout** → Delete `refreshToken` from database

---

## Success Criteria

✅ Can register new users
✅ Cannot register duplicate usernames
✅ Can login with correct credentials
✅ Cannot login with wrong credentials
✅ Can refresh access token
✅ Cannot refresh with invalid token
✅ Can logout successfully
✅ Cannot use token after logout

---

**All tests passing? Congratulations! Your authentication system is working correctly! 🎉**
