package com.eventflow.model;

public enum TaskStatus {
  TODO,
  ASSIGNED,
  IN_PROGRESS,
  BLOCKED,
  COMPLETED,
  CANCELLED;

  public boolean canTransitionTo(TaskStatus nextStatus) {
    if (nextStatus == null) {
      return false;
    }
    return switch (this) {
      case TODO -> nextStatus == ASSIGNED || nextStatus == CANCELLED;
      case ASSIGNED ->
          nextStatus == IN_PROGRESS || nextStatus == BLOCKED || nextStatus == CANCELLED;
      case IN_PROGRESS ->
          nextStatus == BLOCKED || nextStatus == COMPLETED || nextStatus == CANCELLED;
      case BLOCKED ->
          nextStatus == ASSIGNED || nextStatus == IN_PROGRESS || nextStatus == CANCELLED;
      case COMPLETED, CANCELLED -> false;
    };
  }

  public boolean isTerminal() {
    return this == COMPLETED || this == CANCELLED;
  }
}