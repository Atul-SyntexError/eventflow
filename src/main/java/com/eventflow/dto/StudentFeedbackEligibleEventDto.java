package com.eventflow.dto;

import java.time.Instant;

public record StudentFeedbackEligibleEventDto(
    Long eventId,
    String eventName,
    Instant checkedInAt,
    String prompt) {
}