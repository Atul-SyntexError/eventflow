package com.eventflow.model;

import java.time.Instant;

public record Task(
    Long taskId,
    Long eventId,
    String title,
    String description,
    TaskPriority taskPriority,
    TaskStatus taskStatus,
    Instant requiredStartAt,
    Instant deadlineAt,
    Integer requiredVolunteers,
    Long createdBy,
    Long updatedBy,
    Instant createdAt,
    Instant updatedAt) {

  public boolean isTerminal() {
    return taskStatus != null && taskStatus.isTerminal();
  }
}