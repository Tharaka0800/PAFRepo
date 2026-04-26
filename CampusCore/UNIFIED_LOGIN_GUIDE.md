# Unified Login Implementation Guide

## Overview
Your application now has a **single login page** that automatically routes users to the appropriate dashboard based on their role.

## How It Works

### 1. Single Login Endpoint
- **URL**: `/login`
- All users (students, technicians, admins) use the same login page
- Old role-specific login routes (`/student/login`, `/admin/login`, `/technician/login`) redirect to `/login`

### 2. Role-Based Routing
When a user logs in:
1. Backend validates credentials
2. Backend returns: `{ token, role, username }`
3. Frontend automatically redirects to the appropriate dashboard:
   - **ADMIN** → `/admin/dashboard`
   - **TECHNICIAN** → `/technician/dashboard`
   - **STUDENT** → `/student/dashboard`

### 3. Account Creation Rules
- **Students**: Can self-register through the login page
- **Technicians**: Cannot self-register (admin-managed)
- **Admins**: Cannot self-register (admin-managed)

## Backend Changes

### AuthService.java
```java
// Now returns Map with token, role, and username
public Map<String, String> login(String username, String password) {
    // ... validation logic ...
    Map<String, String> response = new HashMap<>();
    response.put("token", token);
    response.put("role", user.getRole().name());
    response.put("username", user.getUsername());
    return response;
}
```

### AuthController.java
```java
// Updated to return the full response map
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
    Map<String, String> loginResponse = authService.login(username, password);
    return ResponseEntity.ok(loginResponse);
}
```

## Frontend Changes

### New Component: UnifiedLogin.jsx
- Single login form for all roles
- Handles student registration
- Shows appropriate messages for each role
- Automatically routes based on backend response

### Updated App.jsx
- Single `/login` route
- Redirects old role-specific routes
- Simplified authentication flow

## Setting Up Admin and Technician Accounts

Since these roles cannot self-register, you need to create them manually. See `seed-accounts.md` for detailed instructions.

### Quick Method (Using Registration Endpoint Temporarily)

1. Temporarily modify `AuthService.java` to accept role from request
2. Use curl or Postman to create accounts:

```bash
# Create Admin
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123",
    "email": "admin@campuscore.com",
    "role": "ADMIN"
  }'

# Create Technician
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "technician",
    "password": "Tech@123",
    "email": "technician@campuscore.com",
    "role": "TECHNICIAN"
  }'
```

3. Revert the AuthService changes

## Testing the Implementation

### Test Student Flow
1. Go to `/login`
2. Click "Create Account"
3. Fill in student details
4. Register and login
5. Should redirect to `/student/dashboard`

### Test Admin Flow
1. Go to `/login`
2. Enter admin credentials
3. Should redirect to `/admin/dashboard`

### Test Technician Flow
1. Go to `/login`
2. Enter technician credentials
3. Should redirect to `/technician/dashboard`

### Test Role Protection
1. Login as student
2. Try to access `/admin/dashboard` directly
3. Should redirect back to `/student/dashboard`

## Security Features

✅ Role-based access control
✅ Protected routes
✅ Automatic redirection based on role
✅ JWT token authentication
✅ Password encryption
✅ Prevents unauthorized role assignment

## User Experience

- **Simplified**: One login page for everyone
- **Intuitive**: Automatic routing to correct dashboard
- **Secure**: Role verification on both frontend and backend
- **Clear**: Informative messages about account types

## Next Steps

1. Create admin and technician accounts (see `seed-accounts.md`)
2. Test all three user flows
3. Update any hardcoded login links in your application
4. Consider adding "Forgot Password" functionality
5. Add rate limiting for login attempts (security enhancement)
