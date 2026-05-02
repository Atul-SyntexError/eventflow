package com.eventflow.dto;

import com.eventflow.model.TaskPriority;
import com.eventflow.model.TaskStatus;
import java.time.Instant;
import java.util.List;

public record TaskFormRequestDto(
    Long eventId,
    String title,
    String description,
    TaskPriority priority,
    List<String> requiredSkills,
    List<Long> dependencyTaskIds,
    Instant requiredStartAt,
    Instant deadlineAt,
    TaskStatus status) {

  public TaskFormRequestDto {
    requiredSkills = DtoCollections.copyOf(requiredSkills);
    dependencyTaskIds = DtoCollections.copyOf(dependencyTaskIds);
  }
}