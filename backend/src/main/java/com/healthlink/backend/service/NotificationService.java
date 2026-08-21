package com.healthlink.backend.service;

import com.healthlink.backend.model.Notification;
import com.healthlink.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void notify(String recipientUserId, String type, String message, String relatedAppointmentId) {
        Notification saved = notificationRepository.save(
                new Notification(recipientUserId, type, message, relatedAppointmentId)
        );

        messagingTemplate.convertAndSendToUser(recipientUserId, "/queue/notifications", saved);
    }

    public List<Notification> getForUser(String userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(String userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByRecipientUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}