package com.healthlink.backend.controller;

import com.healthlink.backend.model.AuditLog;
import com.healthlink.backend.repository.AuditLogRepository;
import com.healthlink.backend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/me")
    public ResponseEntity<List<AuditLog>> getMyActivity() {
        String email = SecurityUtils.getCurrentEmail();
        return ResponseEntity.ok(auditLogRepository.findByActorEmailOrderByTimestampDesc(email));
    }
}