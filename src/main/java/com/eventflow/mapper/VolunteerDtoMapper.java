package com.eventflow.mapper;

import com.eventflow.dto.NotificationItemDto;
import com.eventflow.dto.RecentEventPerformanceDto;
import com.eventflow.dto.TaskSummaryDto;
import com.eventflow.dto.VolunteerDashboardDto;
import com.eventflow.dto.VolunteerLeaderboardItemDto;
import com.eventflow.dto.VolunteerPerformanceDto;
import com.eventflow.dto.VolunteerPerformanceReportDto;
import java.math.BigDecimal;
import java.util.List;

public final class VolunteerDtoMapper {

  public VolunteerDashboardDto toDashboardDto(
      List<TaskSummaryDto> assignedTasks,
      int dueSoonCount,
      int overdueCount,
      VolunteerPerformanceDto performanceSummary,
      List<NotificationItemDto> recentNotifications) {
    return new VolunteerDashboardDto(
        assignedTasks,
        dueSoonCount,
        overdueCount,
        performanceSummary,
        recentNotifications);
  }

  public VolunteerPerformanceDto toPerformanceDto(
      BigDecimal completionRate,
      BigDecimal onTimeRate,
      int activeTaskCount,
      int completedTaskCount,
      List<RecentEventPerformanceDto> recentEvents) {
    return new VolunteerPerformanceDto(
        completionRate,
        onTimeRate,
        activeTaskCount,
        completedTaskCount,
        recentEvents);
  }

  public RecentEventPerformanceDto toRecentEventPerformanceDto(
      Long eventId,
      String eventName,
      String roleLabel,
      int completedTasks,
      BigDecimal onTimeRate,
      BigDecimal completionRate,
      String highlight) {
    return new RecentEventPerformanceDto(
        eventId,
        eventName,
        roleLabel,
        completedTasks,
        onTimeRate,
        completionRate,
        highlight);
  }

  public VolunteerPerformanceReportDto toPerformanceReportDto(
      Long eventId,
      List<VolunteerLeaderboardItemDto> topVolunteers,
      BigDecimal coverageRate,
      BigDecimal completionRate) {
    return new VolunteerPerformanceReportDto(eventId, topVolunteers, coverageRate, completionRate);
  }

  public VolunteerLeaderboardItemDto toLeaderboardItem(
      Long volunteerId,
      String volunteerName,
      BigDecimal completionRate,
      BigDecimal onTimeRate,
      BigDecimal performanceScore,
      Integer completedTaskCount) {
    return new VolunteerLeaderboardItemDto(
        volunteerId,
        volunteerName,
        completionRate,
        onTimeRate,
        performanceScore,
        completedTaskCount);
  }
}