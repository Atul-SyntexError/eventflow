package com.eventflow.dto;

import com.eventflow.model.TaskPriority;
import com.eventflow.model.TaskStatus;
import java.time.Instant;
import java.util.List;

public record TaskDetailDto(
    Long taskId,
    Long eventId,
    String title,
    String description,
    TaskPriority priority,
    TaskStatus status,
    List<String> requiredSkills,
    List<String> dependencies,
    String assignedVolunteer,
    Instant deadlineAt,
    List<ActivityFeedItemDto> activityFeed) {

  public TaskDetailDto {
    requiredSkills = DtoCollections.copyOf(requiredSkills);
    dependencies = DtoCollections.copyOf(dependencies);
    activityFeed = DtoCollections.copyOf(activityFeed);
  }
}