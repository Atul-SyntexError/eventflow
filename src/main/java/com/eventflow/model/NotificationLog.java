package com.eventflow.model;

import java.time.Instant;

public record NotificationLog(
    Long notificationLogId,
    Long notificationId,
    NotificationChannel channel,
    DeliveryStatus deliveryStatus,
    String recipientAddress,
    String errorMessage,
    Instant attemptedAt) {
}