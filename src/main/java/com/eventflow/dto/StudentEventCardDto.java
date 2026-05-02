package com.eventflow.dto;

import java.time.Instant;

public record StudentEventCardDto(
    Long eventId,
    String name,
    String category,
    String venue,
    Instant startAt,
    Instant endAt,
    String registrationStatus,
    String capacityState,
    String highlightBadge) {
}