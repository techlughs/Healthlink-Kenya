package com.healthlink.backend.repository;

import com.healthlink.backend.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByActorEmailOrderByTimestampDesc(String actorEmail);
}