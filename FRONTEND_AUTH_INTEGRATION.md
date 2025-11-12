# Frontend Auth Integration - Complete Guide

## ✅ Frontend-Backend Integration Complete

### Overview

The frontend has been fully integrated with the backend's enhanced authentication system, including:
- ✅ HTTP-only cookie-based refresh token management
- ✅ Token revocation with persistence
- ✅ Centralized telemetry logging
- ✅ Production-ready session management
- ✅ Enhanced error handling

## Key Changes

### 1. **Token Management**

#### Access Token
- **Storage:** localStorage (needed for Authorization header)
- **Purpose:** Sent in `Authorization: Bearer <token>` header
- **Expiration:** Tracked from JWT payload (more accurate)

#### Refresh Token
- **Storage:** HTTP-only cookie (managed by backend)
- **Purpose:** Automatically sent with requests via cookies
- **Security:** Not accessible to JavaScript (XSS protection)
- **Rotation:** Backend automatically rotates on refresh

### 2. **Updated Auth Functions**

#### Login (`Frontend/src/api/auth.js`)
```javascript
export const login = async (credentials) => {
  // Backend handles:
  // 1. Authentication
  // 2. Token generation (access + refresh)
  // 3. Setting refresh token in HTTP-only cookie
  // 4. Telemetry logging
  const response = await api.post('/auth/login', credentials, { withCredentials: true });
  
  // Store access token only (refresh token in cookie)
  setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
  return response.data;
};
```

**Key Points:**
- ✅ Uses `withCredentials: true` for cookie handling
- ✅ Only stores access token in localStorage
- ✅ Refresh token automatically in HTTP-only cookie
- ✅ Backend handles telemetry logging

#### Token Refresh (`Frontend/src/api/auth.js`)
```javascript
export const refreshAuthToken = async (retryCount = 0) => {
  // Cookie-based refresh - refresh token automatically sent
  const response = await api.post('/auth/refresh-token', {}, { withCredentials: true });
  
  // Backend handles:
  // - Token rotation
  // - Telemetry logging
  // - Revocation of old tokens
  
  setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
  return token;
};
```

**Key Points:**
- ✅ No need to send refresh token (it's in cookie)
- ✅ Backend automatically rotates tokens
- ✅ Handles `NO_REFRESH_TOKEN` error code
- ✅ Retry logic for network errors

#### Logout (`Frontend/src/api/auth.js`)
```javascript
export const logout = async (allDevices = false) => {
  // Backend revokes tokens and returns count
  const response = await api.post('/auth/logout', { allDevices }, { withCredentials: true });
  
  // Response includes: { tokensRevoked: 3 }
  // Backend handles:
  // - Token revocation
  // - Cookie clearing
  // - Telemetry logging
  
  // Clean up local state
  removeTokens();
  return response.data;
};
```

**Key Points:**
- ✅ Supports `allDevices: true` to logout from all devices
- ✅ Backend returns count of revoked tokens
- ✅ Backend handles cookie clearing
- ✅ Always cleans up local state

### 3. **Auth Context Updates** (`Frontend/src/context/AuthContext.jsx`)

#### Enhanced Sign Out
```javascript
const signOut = async (allDevices = false) => {
  // Call server logout with allDevices flag
  const response = await api.post('/auth/logout', { allDevices }, { withCredentials: true });
  
  // Log token revocation info
  if (response.data?.tokensRevoked) {
    console.log(`Logged out successfully. ${response.data.tokensRevoked} token(s) revoked.`);
  }
  
  // Always clean up local state
  handleAuthExpired();
};
```

#### Token Refresh Integration
- ✅ Uses `refreshAuthToken` from `auth.js`
- ✅ Handles token expiration proactively
- ✅ Automatic refresh every 4 minutes when authenticated
- ✅ Retry logic with exponential backoff

### 4. **Axios Configuration** (`Frontend/src/api/axios.js`)

#### Global Settings
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // ✅ Critical for cookies
  timeout: 30000,
});
```

**Key Points:**
- ✅ `withCredentials: true` set globally
- ✅ All requests automatically include cookies
- ✅ Refresh token automatically sent with requests

#### Interceptor Updates
- ✅ Handles `NO_REFRESH_TOKEN` error code
- ✅ Proper error handling for token refresh failures
- ✅ Queue management for concurrent refresh requests
- ✅ Enhanced retry logic

### 5. **Error Handling**

#### Specific Error Codes
```javascript
// NO_REFRESH_TOKEN - Session expired
if (error.response?.data?.code === 'NO_REFRESH_TOKEN') {
  removeTokens();
  window.dispatchEvent(new Event('auth:expired'));
  throw new Error('Session expired. Please log in again.');
}
```

#### Network Errors
- ✅ Retry logic with exponential backoff
- ✅ Connection status tracking
- ✅ Event emission for UI handling

### 6. **Storage Management** (`Frontend/src/utils/storage.js`)

#### Token Storage
- ✅ Access token in localStorage
- ✅ Token expiration extracted from JWT payload
- ✅ No refresh token storage (in HTTP-only cookie)

#### Cleanup
- ✅ `removeTokens()` clears access token
- ✅ Backend handles refresh token cookie clearing
- ✅ Google token cleanup for OAuth users

## Authentication Flow

### Login Flow
1. User submits credentials
2. Frontend calls `/auth/login` with `withCredentials: true`
3. Backend:
   - Validates credentials
   - Generates access token (with jti)
   - Generates refresh token
   - Sets refresh token in HTTP-only cookie
   - Logs telemetry event
   - Returns access token + user data
4. Frontend:
   - Stores access token in localStorage
   - Updates auth context
   - Redirects to dashboard

### Token Refresh Flow
1. Access token expires or is about to expire
2. Frontend calls `/auth/refresh-token` with `withCredentials: true`
3. Backend:
   - Reads refresh token from cookie
   - Validates refresh token
   - Generates new access token
   - Rotates refresh token (revokes old, creates new)
   - Sets new refresh token in cookie
   - Logs telemetry event
   - Returns new access token
4. Frontend:
   - Updates access token in localStorage
   - Continues with original request

### Logout Flow
1. User clicks logout (optionally: "Logout from all devices")
2. Frontend calls `/auth/logout` with `{ allDevices: false/true }`
3. Backend:
   - Reads refresh token from cookie
   - Revokes token(s) using revocation service
   - Clears cookies
   - Logs telemetry event
   - Returns `{ tokensRevoked: count }`
4. Frontend:
   - Cleans up local state
   - Clears access token
   - Redirects to login

## Production-Ready Features

### 1. **Security**
- ✅ HTTP-only cookies (XSS protection)
- ✅ Secure flag for HTTPS
- ✅ SameSite=None for cross-domain
- ✅ Token rotation on refresh
- ✅ Token reuse detection
- ✅ Automatic token revocation

### 2. **Reliability**
- ✅ Retry logic with exponential backoff
- ✅ Connection status tracking
- ✅ Queue management for concurrent requests
- ✅ Graceful error handling
- ✅ Automatic token refresh

### 3. **Observability**
- ✅ Telemetry logging (backend)
- ✅ Error event emission
- ✅ Connection event tracking
- ✅ Token revocation tracking

### 4. **User Experience**
- ✅ Automatic session refresh
- ✅ Seamless token rotation
- ✅ Clear error messages
- ✅ Toast notifications
- ✅ Cross-tab logout sync

## API Endpoints Used

### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout (with allDevices support)
- `GET /auth/me` - Get current user

### Registration
- `POST /auth/signup` - Register new user
- `POST /auth/signup/client` - Register client
- `GET /auth/verify-email/:token` - Verify email

### OAuth
- `POST /auth/google` - Google OAuth
- `POST /auth/google/client` - Google OAuth (client)

## Environment Variables

### Frontend
```env
VITE_API_URL=https://your-backend.vercel.app/api/v1
```

### Backend (Vercel)
```env
NODE_ENV=production
COOKIE_SAMESITE=none
# COOKIE_DOMAIN should NOT be set for cross-domain
```

## Testing Checklist

- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Token refresh on expiration
- [ ] Logout from single device
- [ ] Logout from all devices
- [ ] Session persistence across page reloads
- [ ] Cross-tab logout sync
- [ ] Error handling (network errors, expired tokens)
- [ ] Token rotation on refresh
- [ ] Cookie handling in production

## Troubleshooting

### Cookies Not Being Sent
1. Check `withCredentials: true` is set
2. Verify CORS allows credentials
3. Check cookie SameSite settings
4. Verify domain settings

### Token Refresh Fails
1. Check refresh token cookie exists
2. Verify backend cookie settings
3. Check CORS configuration
4. Review telemetry logs

### Session Expires Unexpectedly
1. Check token expiration times
2. Verify refresh token rotation
3. Review revocation history
4. Check telemetry for errors

## Best Practices

1. **Always use `withCredentials: true`** for auth endpoints
2. **Never store refresh token** in localStorage
3. **Handle `NO_REFRESH_TOKEN` error** gracefully
4. **Use telemetry** for debugging production issues
5. **Implement retry logic** for network errors
6. **Track token revocation** for security audits

## Summary

✅ **Complete Integration:**
- Frontend fully integrated with backend auth system
- HTTP-only cookie-based refresh tokens
- Token revocation with persistence
- Telemetry logging
- Production-ready error handling
- Enhanced security features

The frontend now works seamlessly with the backend's enhanced authentication system, providing a secure, reliable, and production-ready authentication experience.

