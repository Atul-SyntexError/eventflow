package com.eventflow.model;

import java.math.BigDecimal;
import java.time.Instant;

public record TaskAssignment(
    Long taskAssignmentId,
    Long taskId,
    Long volunteerId,
    Long assignedBy,
    BigDecimal assignmentScore,
    String assignmentReason,
    boolean active,
    Instant assignedAt) {
}