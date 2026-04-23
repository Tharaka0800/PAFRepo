package com.smartcampus.controllers;

import com.smartcampus.models.Role;
import com.smartcampus.models.User;
import com.smartcampus.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    private Map<String, Object> toSafeUser(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("photoUrl", user.getPhotoUrl());
        return response;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous_user") String username) {
        try {
            return ResponseEntity.ok(toSafeUser(userService.getUserByUsername(username)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        try {
            Role role = Role.valueOf(body.get("role"));
            User updatedUser = userService.updateUserRole(id, role);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", defaultValue = "admin_default") String adminUserId) {
        try {
            userService.deleteUser(id, adminUserId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCurrentUser(
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous_user") String username,
            @RequestBody Map<String, String> body) {
        try {
            User updatedUser = userService.updateCurrentUserProfile(username, body.get("email"));
            return ResponseEntity.ok(toSafeUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCurrentUserPassword(
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous_user") String username,
            @RequestBody Map<String, String> body) {
        try {
            userService.updateCurrentUserPassword(username, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/me/photo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateCurrentUserPhoto(
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous_user") String username,
            @RequestPart("photo") MultipartFile photo) {
        try {
            User updatedUser = userService.updateCurrentUserPhoto(username, photo);
            return ResponseEntity.ok(toSafeUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
