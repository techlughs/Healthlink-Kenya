package com.healthlink.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String recipientUserId;   
    private String type;              
    private String message;           
    private String relatedAppointmentId;
    private boolean read = false;
    private Instant createdAt = Instant.now();

    public Notification() {}

    public Notification(String recipientUserId, String type, String message, String relatedAppointmentId) {
        this.recipientUserId = recipientUserId;
        this.type = type;
        this.message = message;
        this.relatedAppointmentId = relatedAppointmentId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(String recipientUserId) { this.recipientUserId = recipientUserId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getRelatedAppointmentId() { return relatedAppointmentId; }
    public void setRelatedAppointmentId(String relatedAppointmentId) { this.relatedAppointmentId = relatedAppointmentId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}