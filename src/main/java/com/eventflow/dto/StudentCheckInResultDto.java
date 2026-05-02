package com.eventflow.dto;

import com.eventflow.model.RegistrationStatus;

public record StudentCheckInResultDto(
    Long eventId,
    String eventName,
    RegistrationStatus status,
    String checkedInAt,
    String note) {
}