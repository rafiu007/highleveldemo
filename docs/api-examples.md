# API Examples

## User Controller Endpoints

### Get User by Phone Number
Retrieves user details using their phone number
```bash
curl -X GET \
  'http://localhost:3000/users/1234567890' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Update User Profile
Updates the authenticated user's profile information
```bash
curl -X PUT \
  'http://localhost:3000/users/profile' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "profilePicture": "http://example.com/pic.jpg",
    "linkedinUrl": "http://linkedin.com/in/johndoe",
    "otherSocialMedia": "http://twitter.com/johndoe"
}'
```

## Auth Controller Endpoints

### Sign Up
Register a new user
```bash
curl -X POST \
  'http://localhost:3000/auth/signup' \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "1234567890",
    "name": "John Doe"
}'
```

### Send Verification Code
Sends a verification code to the provided phone number
```bash
curl -X POST \
  'http://localhost:3000/auth/send-verification' \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "1234567890"
}'
```

### Verify Code and Complete Signup
Verifies the code and completes the signup process
```bash
curl -X POST \
  'http://localhost:3000/auth/verify' \
  -H 'Content-Type: application/json' \
  -d '{
    "phoneNumber": "1234567890",
    "code": "123456"
}'
```

### Refresh Token
Get new access token using refresh token
```bash
curl -X POST \
  'http://localhost:3000/auth/refresh' \
  -H 'Content-Type: application/json' \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
}'
```

## Like Controller Endpoints

### Create Like
Creates a new like for a user
```bash
curl -X POST \
  'http://localhost:3000/likes' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "toUserId": "+918668930364",
    "qualities": ["helpful", "knowledgeable"],
    "message": "Great work!",
    "isEndorsed": false
}'
```

### Get Received Likes
Get all likes received by the authenticated user
```bash
curl -X GET \
  'http://localhost:3000/likes/received' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Unlike
Remove a like
```bash
curl -X DELETE \
  'http://localhost:3000/likes/unlike/like123' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Endorse Like
Endorse a received like
```bash
curl -X PUT \
  'http://localhost:3000/likes/endorse/like123' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Unendorse Like
Remove endorsement from a like
```bash
curl -X PUT \
  'http://localhost:3000/likes/unEndorse/like123' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Get Received Like History
Get history of received likes
```bash
curl -X GET \
  'http://localhost:3000/likes/history/received' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Get Sent Like History
Get history of sent likes
```bash
curl -X GET \
  'http://localhost:3000/likes/history/sent' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## App Controller Endpoints

### Get Hello
Basic health check endpoint
```bash
curl -X GET 'http://localhost:3000'
```

Note: Replace `YOUR_JWT_TOKEN` with an actual JWT token, and adjust the localhost URL and port according to your environment.
