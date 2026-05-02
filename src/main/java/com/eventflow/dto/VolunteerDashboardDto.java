package com.eventflow.dto;

import java.util.List;

public record VolunteerDashboardDto(
    List<TaskSummaryDto> assignedTasks,
    Integer dueSoonCount,
    Integer overdueCount,
    VolunteerPerformanceDto performanceSummary,
    List<NotificationItemDto> recentNotifications) {

  public VolunteerDashboardDto {
    assignedTasks = DtoCollections.copyOf(assignedTasks);
    recentNotifications = DtoCollections.copyOf(recentNotifications);
  }
}