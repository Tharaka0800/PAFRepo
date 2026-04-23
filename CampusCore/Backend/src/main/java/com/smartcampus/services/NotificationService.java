package com.smartcampus.services;

import com.smartcampus.models.Notification;
import com.smartcampus.models.Role;
import com.smartcampus.repositories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        if (saved.getRecipientUserId() != null && !saved.getRecipientUserId().isBlank()) {
            messagingTemplate.convertAndSend("/topic/notifications/user/" + saved.getRecipientUserId(), saved);
        } else if (saved.getTargetRole() != null) {
            messagingTemplate.convertAndSend("/topic/notifications/" + saved.getTargetRole(), saved);
        }
        return saved;
    }

    public List<Notification> getNotificationsByRole(Role role) {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role);
    }
    
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<Notification> getNotificationsForUser(Role role, String userId) {
        List<Notification> notifications = new ArrayList<>();

        if (role != null) {
            notifications.addAll(notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role));
        }
        if (userId != null && !userId.isBlank()) {
            notifications.addAll(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId));
        }

        notifications = notifications.stream()
                .collect(java.util.stream.Collectors.toMap(Notification::getId, notification -> notification, (first, second) -> first))
                .values()
                .stream()
                .toList();
        notifications.sort(Comparator.comparing(Notification::getCreatedAt).reversed());
        return notifications;
    }

    public Optional<Notification> updateNotification(String id, Notification notificationDetails) {
        return notificationRepository.findById(id).map(existing -> {
            existing.setMessage(notificationDetails.getMessage());
            existing.setTargetRole(notificationDetails.getTargetRole());
            existing.setRecipientUserId(notificationDetails.getRecipientUserId());
            existing.setTitle(notificationDetails.getTitle());
            existing.setRead(notificationDetails.isRead());
            return notificationRepository.save(existing);
        });
    }
    
    public Optional<Notification> markAsRead(String id) {
        return notificationRepository.findById(id).map(existing -> {
            existing.setRead(true);
            return notificationRepository.save(existing);
        });
    }

    public boolean deleteNotification(String id) {
        if (notificationRepository.existsById(id)) {
            notificationRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
