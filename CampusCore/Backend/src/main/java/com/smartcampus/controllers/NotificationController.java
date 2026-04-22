package com.smartcampus.controllers;

import com.smartcampus.models.Notification;
import com.smartcampus.models.Role;
import com.smartcampus.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // GET all alerts (for Admin primarily) or limit by role natively on frontend
    @GetMapping
    public List<Notification> getAllNotifications(@RequestParam(required = false) String role) {
        if (role != null) {
            return notificationService.getNotificationsByRole(Role.valueOf(role.toUpperCase()));
        }
        return notificationService.getAllNotifications();
    }

    // POST create notification (ADMIN only)
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Notification createNotification(@Valid @RequestBody Notification notification) {
        return notificationService.createNotification(notification);
    }

    // PUT modify read status
    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable String id, @RequestBody Notification details) {
        return notificationService.updateNotification(id, details)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return notificationService.markAsRead(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE notification (ADMIN only)
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        if (notificationService.deleteNotification(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
