package com.eventflow.dto;

import java.time.Instant;

public record LiveUpdateItemDto(
    Long eventId,
    String title,
    String type,
    String meta,
    Instant occurredAt) {
}