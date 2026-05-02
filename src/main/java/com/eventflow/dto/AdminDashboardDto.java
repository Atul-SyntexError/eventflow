package com.eventflow.dto;

import java.util.List;

public record AdminDashboardDto(
    Integer activeEvents,
    Integer liveEvents,
    Integer totalUsers,
    String volunteerCoverage,
    List<EventHealthSnapshotDto> healthOverview,
    List<RiskPredictionDto> riskAlerts,
    List<NotificationItemDto> recentNotifications) {

  public AdminDashboardDto {
    healthOverview = DtoCollections.copyOf(healthOverview);
    riskAlerts = DtoCollections.copyOf(riskAlerts);
    recentNotifications = DtoCollections.copyOf(recentNotifications);
  }
}