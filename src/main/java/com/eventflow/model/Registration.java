package com.eventflow.model;

import java.time.Instant;

public record Registration(
    Long registrationId,
    Long eventId,
    Long studentId,
    RegistrationStatus registrationStatus,
    Instant registeredAt,
    Instant checkedInAt) {

  public boolean isTerminal() {
    return registrationStatus != null && registrationStatus.isTerminal();
  }
}