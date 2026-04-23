package com.smartcampus.repositories;

import com.smartcampus.models.Notification;
import com.smartcampus.models.Role;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(Role targetRole);
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);
}
