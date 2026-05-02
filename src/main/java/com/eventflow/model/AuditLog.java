package com.eventflow.model;

import java.time.Instant;

public record AuditLog(
    Long auditLogId,
    Long actorUserId,
    String entityType,
    Long entityId,
    String actionType,
    String payloadBeforeJson,
    String payloadAfterJson,
    Instant createdAt) {
}