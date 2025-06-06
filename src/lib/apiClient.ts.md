# API Client - Authentication and HTTP Management

## Overview

The API client is a centralized Axios configuration that handles all HTTP communication with the Observer backend, including JWT token authentication, automatic token refresh, and error handling.

## Core Configuration

### Base Setup
```typescript
const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_API}`,
  timeout: 5000,
});
```

**Key Settings:**
- **Base URL**: Configurable via environment variable
- **Timeout**: 5-second request timeout to prevent hanging requests
- **Environment**: Uses `NEXT_PUBLIC_BACKEND_API` for client-side access

## Authentication System

### Request Interceptor
Automatically attaches JWT tokens to all requests:
```typescript
apiClient.interceptors.request.use((config) => {
  const accessToken = Cookies.get("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

**Features:**
- Reads access token from secure cookies
- Adds Bearer token to Authorization header
- Applies to all outgoing requests
- Handles missing token gracefully

### Response Interceptor - Token Refresh
Implements automatic token refresh on 401 errors:

**Process Flow:**
1. **401 Detection**: Catches unauthorized responses
2. **Retry Prevention**: Uses `_retry` flag to prevent infinite loops
3. **Token Refresh**: Calls refresh endpoint with refresh token
4. **Token Update**: Stores new access token in cookies
5. **Request Retry**: Re-attempts original request with new token
6. **Fallback**: Redirects to login on refresh failure

### Token Storage
- **Secure Cookies**: Stores tokens with `secure: true` flag
- **Automatic Cleanup**: Removes tokens on logout or refresh failure
- **Cross-Request Persistence**: Maintains authentication across app sessions

## Error Handling

### Network Errors
- **Timeout Handling**: 5-second timeout prevents indefinite waiting
- **Connection Failures**: Graceful degradation for network issues
- **Request Cancellation**: Proper cleanup of cancelled requests

### Authentication Failures
- **Token Expiration**: Automatic refresh attempts
- **Invalid Credentials**: Redirects to login page
- **Refresh Failures**: Complete logout and redirect

### Response Validation
- **Status Code Handling**: Proper HTTP status interpretation
- **Data Validation**: Ensures response data integrity
- **Error Propagation**: Maintains error context for debugging

## Security Features

### Token Security
- **HTTP-Only Cookies**: Prevents XSS token theft (when properly configured)
- **Secure Flag**: Ensures HTTPS-only transmission
- **Automatic Expiration**: Removes expired tokens

### Request Security
- **CORS Handling**: Proper cross-origin request management
- **Header Validation**: Ensures proper authentication headers
- **Timeout Protection**: Prevents resource exhaustion

## Environment Configuration

### Required Environment Variables
```bash
NEXT_PUBLIC_BACKEND_API=http://127.0.0.1:8000/api/v1
```

**Considerations:**
- `NEXT_PUBLIC_` prefix enables client-side access
- Should point to backend API base URL
- Include API version in base URL for consistency

## Usage Patterns

### Standard API Calls
```typescript
// GET request
const response = await apiClient.get('/public/patients/');

// POST request with data
const response = await apiClient.post('/auth/token/', {
  username,
  password
});
```

### Authentication Endpoints
- **Login**: `POST /auth/token/` - Obtain access/refresh tokens
- **Refresh**: `POST /auth/token/refresh/` - Refresh access token
- **Logout**: `POST /auth/logout/` - Invalidate refresh token
- **Verify**: `POST /auth/token/verify/` - Validate access token

## Integration with Components

### AuthContext Integration
- Used by AuthContext for login/logout operations
- Provides centralized authentication state management
- Handles token lifecycle automatically

### Dashboard Data Fetching
- Server-side components use direct axios calls
- Client-side components use apiClient for consistency
- Public endpoints don't require authentication

## Development Considerations

- **Currently Disabled**: Authentication middleware is disabled for this release
- **Testing**: Token refresh flow can be tested by manipulating token expiration
- **Debugging**: All authentication errors are logged to console
- **Performance**: Automatic token refresh minimizes user interruption

## Production Readiness

The API client is designed for production use with:
- Comprehensive error handling
- Security best practices
- Automatic recovery mechanisms
- Proper cleanup procedures
- Environment-based configuration