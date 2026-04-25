# Seed Admin and Technician Accounts

Since admin and technician accounts cannot be created through registration, you need to manually insert them into your MongoDB database.

## Option 1: Using MongoDB Compass or MongoDB Shell

Connect to your database and insert these documents into the `users` collection:

### Admin Account
```json
{
  "username": "admin",
  "password": "$2a$10$YourBcryptHashedPasswordHere",
  "email": "admin@campuscore.com",
  "role": "ADMIN",
  "photoUrl": null
}
```

### Technician Account
```json
{
  "username": "technician",
  "password": "$2a$10$YourBcryptHashedPasswordHere",
  "email": "technician@campuscore.com",
  "role": "TECHNICIAN",
  "photoUrl": null
}
```

## Option 2: Create a Temporary Registration Endpoint

You can temporarily enable registration for admin/technician roles:

1. Modify `AuthService.java` to accept role parameter
2. Use Postman/curl to create accounts
3. Remove the temporary code

### Example curl commands:

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

## Option 3: Use the Registration Endpoint Temporarily

Modify `AuthService.java` temporarily to allow role specification:

```java
public User registerUser(User user) {
    if (userRepository.findByUsername(user.getUsername()).isPresent()) {
        throw new RuntimeException("Username already exists");
    }
    if (user.getEmail() != null && !user.getEmail().isBlank() && userRepository.findByEmail(user.getEmail()).isPresent()) {
        throw new RuntimeException("Email already exists");
    }
    
    // Temporarily allow role from request (remove after seeding)
    // if (user.getRole() == null) {
    //     user.setRole(Role.STUDENT);
    // }
    
    user.setPassword(passwordEncoder.encode(user.getPassword()));
    return userRepository.save(user);
}
```

After creating the accounts, revert this change to prevent unauthorized role assignment.

## Recommended Credentials

- **Admin**: username: `admin`, password: `Admin@123`
- **Technician**: username: `technician`, password: `Tech@123`
- **Student**: Can self-register through the UI

## Security Note

Make sure to use strong passwords in production and never commit credentials to version control.
