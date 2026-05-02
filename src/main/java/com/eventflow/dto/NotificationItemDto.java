package com.eventflow.dto;

import com.eventflow.model.NotificationSeverity;
import com.eventflow.model.NotificationType;
import java.time.Instant;

public record NotificationItemDto(
    Long notificationId,
    NotificationType type,
    String title,
    String body,
    String link,
    NotificationSeverity severity,
    Instant createdAt,
    boolean read) {
}