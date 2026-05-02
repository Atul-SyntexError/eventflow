package com.eventflow.model;

import java.time.Instant;

public record EventScheduleAdjustment(
    Long eventScheduleAdjustmentId,
    Long eventId,
    Long proposedBy,
    String reasonCode,
    String description,
    Instant currentStartAt,
    Instant currentEndAt,
    Instant suggestedStartAt,
    Instant suggestedEndAt,
    AdjustmentStatus adjustmentStatus,
    Instant appliedAt) {

  public boolean isTerminal() {
    return adjustmentStatus != null && adjustmentStatus.isTerminal();
  }
}