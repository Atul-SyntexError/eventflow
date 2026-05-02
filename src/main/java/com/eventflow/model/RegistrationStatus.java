package com.eventflow.model;

public enum RegistrationStatus {
  REGISTERED,
  WAITLISTED,
  CHECKED_IN,
  CANCELLED,
  NO_SHOW;

  public boolean canTransitionTo(RegistrationStatus nextStatus) {
    if (nextStatus == null) {
      return false;
    }
    return switch (this) {
      case REGISTERED ->
          nextStatus == CHECKED_IN || nextStatus == CANCELLED || nextStatus == NO_SHOW;
      case WAITLISTED -> nextStatus == REGISTERED || nextStatus == CANCELLED;
      case CHECKED_IN, CANCELLED, NO_SHOW -> false;
    };
  }

  public boolean isTerminal() {
    return this == CHECKED_IN || this == CANCELLED || this == NO_SHOW;
  }
}