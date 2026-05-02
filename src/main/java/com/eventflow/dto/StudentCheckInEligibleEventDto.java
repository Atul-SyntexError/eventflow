package com.eventflow.dto;

import com.eventflow.model.RegistrationStatus;

public record StudentCheckInEligibleEventDto(
    Long eventId,
    String eventName,
    String venue,
    String startAt,
    String endAt,
    RegistrationStatus status,
    String confirmationCodeHint) {
}