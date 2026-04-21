package com.smartcampus.models;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    @NotBlank(message = "Message is required")
    private String message;

    private Role targetRole;
    private boolean isRead;
    private Date createdAt;

    public Notification() {
        this.createdAt = new Date();
        this.isRead = false;
    }

    public Notification(String message, Role targetRole) {
        this.message = message;
        this.targetRole = targetRole;
        this.createdAt = new Date();
        this.isRead = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Role getTargetRole() { return targetRole; }
    public void setTargetRole(Role targetRole) { this.targetRole = targetRole; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
