package com.eventflow.dto;

import java.util.List;

public record OrganizerDashboardDto(
    Integer openTasks,
    Integer inProgressTasks,
    Integer blockedTasks,
    Integer availableVolunteers,
    List<DelayAlertDto> delayAlerts,
    List<TaskSummaryDto> recentAssignments) {

  public OrganizerDashboardDto {
    delayAlerts = DtoCollections.copyOf(delayAlerts);
    recentAssignments = DtoCollections.copyOf(recentAssignments);
  }
}