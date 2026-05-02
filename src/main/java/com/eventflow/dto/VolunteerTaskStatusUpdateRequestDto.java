package com.eventflow.dto;

import com.eventflow.model.TaskStatus;

public record VolunteerTaskStatusUpdateRequestDto(TaskStatus status, String blockerNote) {
}