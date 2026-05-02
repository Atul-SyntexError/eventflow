package com.eventflow.model;

import java.time.Instant;

public record Notification(
    Long notificationId,
    Long recipientUserId,
    Long eventId,
    Long taskId,
    NotificationType notificationType,
    NotificationSeverity severity,
    String title,
    String body,
    String linkPath,
    boolean read,
    Instant createdAt,
    Instant readAt) {
}