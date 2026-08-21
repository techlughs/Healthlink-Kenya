package com.healthlink.backend.controller;

import com.healthlink.backend.model.Notification;
import com.healthlink.backend.repository.NotificationRepository;
import com.healthlink.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getMyNotifications(Authentication auth) {
        String email = resolveUserId(auth);
        return notificationService.getForUser(email);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication auth) {
        String email = resolveUserId(auth);
        return Map.of("count", notificationService.unreadCount(email));
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable String id, Authentication auth) {
        String email = resolveUserId(auth);
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getRecipientUserId().equals(email)) {
            throw new SecurityException("Not your notification");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @PostMapping("/read-all")
    public void markAllRead(Authentication auth) {
        String email = resolveUserId(auth);
        notificationService.markAllAsRead(email);
    }

    private String resolveUserId(Authentication auth) {
        return auth.getName();
    }
}