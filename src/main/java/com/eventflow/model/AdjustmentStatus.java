package com.eventflow.model;

public enum AdjustmentStatus {
  SUGGESTED,
  APPROVED,
  APPLIED,
  REJECTED;

  public boolean canTransitionTo(AdjustmentStatus nextStatus) {
    if (nextStatus == null) {
      return false;
    }
    return switch (this) {
      case SUGGESTED -> nextStatus == APPROVED || nextStatus == REJECTED;
      case APPROVED -> nextStatus == APPLIED || nextStatus == REJECTED;
      case APPLIED, REJECTED -> false;
    };
  }

  public boolean isTerminal() {
    return this == APPLIED || this == REJECTED;
  }
}