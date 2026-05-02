package com.eventflow.model;

import java.time.Instant;

public record Event(
    Long eventId,
    String code,
    String name,
    String description,
    String category,
    String venue,
    Instant startAt,
    Instant endAt,
    Instant registrationOpenAt,
    Instant registrationCloseAt,
    Integer expectedAttendance,
    EventStatus eventStatus,
    Long createdBy,
    Long updatedBy,
    Instant createdAt,
    Instant updatedAt) {

  public boolean isTerminal() {
    return eventStatus != null && eventStatus.isTerminal();
  }
}