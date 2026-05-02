package com.eventflow.dto;

import com.eventflow.model.RegistrationStatus;
import java.time.Instant;

public record StudentRegistrationItemDto(
    Long eventId,
    Long studentId,
    String eventName,
    String venue,
    String startAt,
    String endAt,
    RegistrationStatus status,
    Instant registeredAt,
    Instant checkedInAt) {
}