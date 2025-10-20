# Authentication Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     OpenMusic API Authentication Flow                   │
└─────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════╗
║                        1. USER REGISTRATION FLOW                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

  Client                   API Handler              Validator           Service              Database
    │                          │                        │                  │                    │
    │  POST /users             │                        │                  │                    │
    │  {username, password}    │                        │                  │                    │
    ├─────────────────────────>│                        │                  │                    │
    │                          │  Validate payload      │                  │                    │
    │                          ├───────────────────────>│                  │                    │
    │                          │                        │                  │                    │
    │                          │  ✅ Validation OK      │                  │                    │
    │                          │<───────────────────────┤                  │                    │
    │                          │                        │                  │                    │
    │                          │  addUser()             │                  │                    │
    │                          ├────────────────────────┼─────────────────>│                    │
    │                          │                        │                  │  Check username    │
    │                          │                        │                  ├───────────────────>│
    │                          │                        │                  │  SELECT            │
    │                          │                        │                  │<───────────────────┤
    │                          │                        │                  │  ✅ Unique         │
    │                          │                        │                  │                    │
    │                          │                        │                  │  Hash password     │
    │                          │                        │                  │  (bcrypt, 10 salt) │
    │                          │                        │                  │                    │
    │                          │                        │                  │  INSERT user       │
    │                          │                        │                  ├───────────────────>│
    │                          │                        │                  │  RETURNING id      │
    │                          │                        │                  │<───────────────────┤
    │                          │  Return userId         │                  │                    │
    │                          │<───────────────────────┼──────────────────┤                    │
    │                          │                        │                  │                    │
    │  201 Created             │                        │                  │                    │
    │  {userId}                │                        │                  │                    │
    │<─────────────────────────┤                        │                  │                    │


╔═══════════════════════════════════════════════════════════════════════════╗
║                           2. LOGIN FLOW                                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

  Client                   API Handler              Service           TokenManager        Database
    │                          │                        │                  │                    │
    │  POST /authentications   │                        │                  │                    │
    │  {username, password}    │                        │                  │                    │
    ├─────────────────────────>│                        │                  │                    │
    │                          │  Validate payload      │                  │                    │
    │                          │  ✅                    │                  │                    │
    │                          │                        │                  │                    │
    │                          │  verifyUserCredential()│                  │                    │
    │                          ├───────────────────────>│                  │                    │
    │                          │                        │  SELECT user     │                    │
    │                          │                        ├─────────────────┼───────────────────>│
    │                          │                        │  + password hash │                    │
    │                          │                        │<─────────────────┼────────────────────┤
    │                          │                        │                  │                    │
    │                          │                        │  bcrypt.compare()│                    │
    │                          │                        │  ✅ Match        │                    │
    │                          │                        │                  │                    │
    │                          │  Return userId         │                  │                    │
    │                          │<───────────────────────┤                  │                    │
    │                          │                        │                  │                    │
    │                          │  Generate tokens       │                  │                    │
    │                          ├────────────────────────┼─────────────────>│                    │
    │                          │                        │  JWT.sign()      │                    │
    │                          │                        │  {userId}        │                    │
    │                          │  accessToken           │                  │                    │
    │                          │  refreshToken          │                  │                    │
    │                          │<───────────────────────┼──────────────────┤                    │
    │                          │                        │                  │                    │
    │                          │  Store refreshToken    │                  │                    │
    │                          ├───────────────────────>│  INSERT token    │                    │
    │                          │                        ├─────────────────┼───────────────────>│
    │                          │                        │                  │                    │
    │  201 Created             │                        │                  │                    │
    │  {accessToken,           │                        │                  │                    │
    │   refreshToken}          │                        │                  │                    │
    │<─────────────────────────┤                        │                  │                    │


╔═══════════════════════════════════════════════════════════════════════════╗
║                        3. TOKEN REFRESH FLOW                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

  Client                   API Handler              Service           TokenManager        Database
    │                          │                        │                  │                    │
    │  PUT /authentications    │                        │                  │                    │
    │  {refreshToken}          │                        │                  │                    │
    ├─────────────────────────>│                        │                  │                    │
    │                          │  Validate payload      │                  │                    │
    │                          │  ✅                    │                  │                    │
    │                          │                        │                  │                    │
    │                          │  verifyRefreshToken()  │                  │                    │
    │                          ├───────────────────────>│  SELECT token    │                    │
    │                          │                        ├─────────────────┼───────────────────>│
    │                          │                        │  WHERE token=    │                    │
    │                          │                        │<─────────────────┼────────────────────┤
    │                          │                        │  ✅ Exists       │                    │
    │                          │                        │                  │                    │
    │                          │  Verify signature      │                  │                    │
    │                          ├────────────────────────┼─────────────────>│                    │
    │                          │                        │  JWT.verify()    │                    │
    │                          │  Extract userId        │  ✅ Valid        │                    │
    │                          │<───────────────────────┼──────────────────┤                    │
    │                          │                        │                  │                    │
    │                          │  Generate new access   │                  │                    │
    │                          ├────────────────────────┼─────────────────>│                    │
    │                          │  token                 │  JWT.sign()      │                    │
    │                          │<───────────────────────┼──────────────────┤                    │
    │                          │                        │                  │                    │
    │  200 OK                  │                        │                  │                    │
    │  {accessToken}           │                        │                  │                    │
    │<─────────────────────────┤                        │                  │                    │


╔═══════════════════════════════════════════════════════════════════════════╗
║                          4. LOGOUT FLOW                                   ║
╚═══════════════════════════════════════════════════════════════════════════╝

  Client                   API Handler              Service                                Database
    │                          │                        │                                      │
    │  DELETE /authentications │                        │                                      │
    │  {refreshToken}          │                        │                                      │
    ├─────────────────────────>│                        │                                      │
    │                          │  Validate payload      │                                      │
    │                          │  ✅                    │                                      │
    │                          │                        │                                      │
    │                          │  verifyRefreshToken()  │                                      │
    │                          ├───────────────────────>│  SELECT token                        │
    │                          │                        ├─────────────────────────────────────>│
    │                          │                        │  ✅ Exists                           │
    │                          │                        │<─────────────────────────────────────┤
    │                          │                        │                                      │
    │                          │  deleteRefreshToken()  │                                      │
    │                          ├───────────────────────>│  DELETE FROM authentications         │
    │                          │                        ├─────────────────────────────────────>│
    │                          │                        │  WHERE token=                        │
    │                          │                        │  ✅ Deleted                          │
    │                          │  ✅ Success            │<─────────────────────────────────────┤
    │                          │<───────────────────────┤                                      │
    │                          │                        │                                      │
    │  200 OK                  │                        │                                      │
    │  {message}               │                        │                                      │
    │<─────────────────────────┤                        │                                      │


╔═══════════════════════════════════════════════════════════════════════════╗
║                    5. PROTECTED ROUTE ACCESS                              ║
╚═══════════════════════════════════════════════════════════════════════════╝

  Client                  Hapi Auth Strategy          API Handler                    
    │                          │                        │                    
    │  GET /playlists          │                        │                    
    │  Authorization: Bearer   │                        │                    
    │  {accessToken}           │                        │                    
    ├─────────────────────────>│                        │                    
    │                          │  Verify JWT signature  │                    
    │                          │  Check expiration      │                    
    │                          │  Extract userId        │                    
    │                          │  ✅ Valid              │                    
    │                          │                        │                    
    │                          │  Set credentials       │                    
    │                          │  {userId}              │                    
    │                          ├───────────────────────>│                    
    │                          │                        │  Access userId     
    │                          │                        │  via               
    │                          │                        │  request.auth      
    │                          │                        │  .credentials      
    │                          │                        │                    
    │  200 OK                  │                        │                    
    │  {playlists}             │                        │                    
    │<─────────────────────────┴────────────────────────┤                    


═══════════════════════════════════════════════════════════════════════════

                            DATABASE SCHEMA

┌──────────────────────────────────────┐
│             USERS                    │
├──────────────────────────────────────┤
│ id         VARCHAR(50)  PK           │
│ username   VARCHAR(50)  UNIQUE       │
│ password   TEXT         (hashed)     │
│ fullname   TEXT                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│        AUTHENTICATIONS               │
├──────────────────────────────────────┤
│ token      TEXT                      │
└──────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

                         TOKEN STRUCTURE

┌────────────────────────────────────────────────────────────────────┐
│  Access Token (Short-lived: 30 minutes)                            │
├────────────────────────────────────────────────────────────────────┤
│  Header:                                                           │
│  {                                                                 │
│    "alg": "HS256",                                                 │
│    "typ": "JWT"                                                    │
│  }                                                                 │
│                                                                    │
│  Payload:                                                          │
│  {                                                                 │
│    "userId": "user-xxxxxxxxxxxxxxxx"                               │
│  }                                                                 │
│                                                                    │
│  Signature:                                                        │
│  HMACSHA256(base64UrlEncode(header) + "." +                       │
│              base64UrlEncode(payload), ACCESS_TOKEN_KEY)          │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  Refresh Token (Long-lived: No expiration)                         │
├────────────────────────────────────────────────────────────────────┤
│  Same structure as Access Token                                    │
│  Signed with REFRESH_TOKEN_KEY                                     │
│  Stored in database for validation                                 │
└────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════

                        SECURITY FEATURES

✓ Passwords hashed with bcrypt (10 salt rounds)
✓ Username uniqueness enforced at database level
✓ Separate keys for access and refresh tokens
✓ Token signature verification on every request
✓ Refresh tokens stored in database for revocation
✓ Access tokens short-lived (30 minutes)
✓ Refresh tokens used only for obtaining new access tokens
✓ Logout invalidates refresh token immediately
✓ JWT authentication strategy configured in Hapi
✓ Error handling with proper HTTP status codes

═══════════════════════════════════════════════════════════════════════════
```
