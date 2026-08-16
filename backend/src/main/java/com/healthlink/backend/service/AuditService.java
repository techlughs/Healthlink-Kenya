package com.healthlink.backend.service;

import com.healthlink.backend.model.AuditLog;
import com.healthlink.backend.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String actorEmail, String action, String details, String ipAddress) {
        try {
            AuditLog entry = new AuditLog(
                    null,
                    actorEmail,
                    action,
                    details,
                    ipAddress,
                    LocalDateTime.now()
            );
            auditLogRepository.save(entry);
        } catch (Exception ex) {
            // Never let audit logging break the actual request
            logger.error("Failed to write audit log for action {} by {}", action, actorEmail, ex);
        }
    }
}