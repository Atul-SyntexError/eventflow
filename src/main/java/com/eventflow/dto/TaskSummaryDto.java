package com.eventflow.dto;

import com.eventflow.model.TaskPriority;
import com.eventflow.model.TaskStatus;
import java.time.Instant;

public record TaskSummaryDto(
    Long taskId,
    Long eventId,
    String eventName,
    String title,
    TaskPriority priority,
    TaskStatus status,
    Instant deadlineAt,
    String assignedVolunteerName,
    boolean delayFlag) {
}