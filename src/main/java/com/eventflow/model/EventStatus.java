package com.eventflow.model;

public enum EventStatus {
  DRAFT,
  PLANNED,
  REGISTRATION_OPEN,
  REGISTRATION_CLOSED,
  LIVE,
  COMPLETED,
  CANCELLED;

  public boolean canTransitionTo(EventStatus nextStatus) {
    if (nextStatus == null) {
      return false;
    }
    return switch (this) {
      case DRAFT -> nextStatus == PLANNED || nextStatus == CANCELLED;
      case PLANNED -> nextStatus == REGISTRATION_OPEN || nextStatus == CANCELLED;
      case REGISTRATION_OPEN ->
          nextStatus == REGISTRATION_CLOSED || nextStatus == LIVE || nextStatus == CANCELLED;
      case REGISTRATION_CLOSED -> nextStatus == LIVE || nextStatus == CANCELLED;
      case LIVE -> nextStatus == COMPLETED || nextStatus == CANCELLED;
      case COMPLETED, CANCELLED -> false;
    };
  }

  public boolean isTerminal() {
    return this == COMPLETED || this == CANCELLED;
  }
}