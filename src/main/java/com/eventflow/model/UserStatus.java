package com.eventflow.model;

public enum UserStatus {
  ACTIVE,
  INACTIVE,
  SUSPENDED;

  public boolean canTransitionTo(UserStatus nextStatus) {
    if (nextStatus == null) {
      return false;
    }
    return switch (this) {
      case ACTIVE -> nextStatus == INACTIVE || nextStatus == SUSPENDED;
      case INACTIVE -> nextStatus == ACTIVE;
      case SUSPENDED -> nextStatus == ACTIVE || nextStatus == INACTIVE;
    };
  }
}