package com.eventflow.dto;

import com.eventflow.model.RegistrationStatus;
import java.time.Instant;

public record RegistrationStatusDto(
    Long eventId,
    Long studentId,
    RegistrationStatus status,
    Instant registeredAt,
    Instant checkedInAt) {
}