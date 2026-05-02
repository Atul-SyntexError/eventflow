package com.eventflow.mapper;

import com.eventflow.dto.AdminDashboardDto;
import com.eventflow.dto.EventDetailDto;
import com.eventflow.dto.EventHealthSnapshotDto;
import com.eventflow.dto.EventSummaryDto;
import com.eventflow.dto.NotificationItemDto;
import com.eventflow.dto.ResourceRequirementDto;
import com.eventflow.dto.RiskPredictionDto;
import com.eventflow.dto.TimelineItemDto;
import com.eventflow.dto.UserDetailDto;
import com.eventflow.dto.UserSummaryDto;
import com.eventflow.model.Event;
import com.eventflow.model.EventMetric;
import com.eventflow.model.EventResource;
import com.eventflow.model.HealthTrend;
import com.eventflow.model.Notification;
import com.eventflow.model.RiskLevel;
import com.eventflow.model.RiskPrediction;
import com.eventflow.model.User;
import java.math.BigDecimal;
import java.util.List;

public final class AdminDtoMapper {

  private final NotificationMapper notificationMapper = new NotificationMapper();

  public AdminDashboardDto toDashboardDto(
      int activeEvents,
      int liveEvents,
      int totalUsers,
      String volunteerCoverage,
      List<EventHealthSnapshotDto> healthOverview,
      List<RiskPredictionDto> riskAlerts,
      List<NotificationItemDto> recentNotifications) {
    return new AdminDashboardDto(
        activeEvents,
        liveEvents,
        totalUsers,
        volunteerCoverage,
        healthOverview,
        riskAlerts,
        recentNotifications);
  }

  public EventSummaryDto toEventSummaryDto(
      Event event,
      int registeredCount,
      int checkedInCount,
      BigDecimal healthScore,
      RiskLevel riskLevel) {
    return new EventSummaryDto(
        event.eventId(),
        event.code(),
        event.name(),
        event.category(),
        event.eventStatus(),
        event.venue(),
        event.startAt(),
        event.endAt(),
        event.expectedAttendance(),
        registeredCount,
        checkedInCount,
        healthScore,
        riskLevel);
  }

  public EventDetailDto toEventDetailDto(
      Event event,
      List<EventResource> resources,
      EventHealthSnapshotDto healthSnapshot,
      List<RiskPrediction> riskPredictions,
      List<TimelineItemDto> timeline) {
    return new EventDetailDto(
        event.eventId(),
        event.code(),
        event.name(),
        event.description(),
        event.category(),
        event.eventStatus(),
        event.venue(),
        event.startAt(),
        event.endAt(),
        event.registrationOpenAt(),
        event.registrationCloseAt(),
        event.expectedAttendance(),
        resources == null ? List.of() : resources.stream().map(this::toResourceRequirementDto).toList(),
        healthSnapshot,
        riskPredictions == null ? List.of() : riskPredictions.stream().map(this::toRiskPredictionDto).toList(),
        timeline);
  }

  public ResourceRequirementDto toResourceRequirementDto(EventResource resource) {
    return new ResourceRequirementDto(
        resource.resourceName(),
        resource.quantityRequired(),
        resource.quantityAllocated(),
        resource.notes());
  }

  public RiskPredictionDto toRiskPredictionDto(RiskPrediction prediction) {
    return new RiskPredictionDto(
        prediction.riskType(),
        prediction.riskLevel(),
        prediction.score(),
        prediction.headline(),
        prediction.description(),
        prediction.recommendedAction());
  }

  public EventHealthSnapshotDto toEventHealthSnapshotDto(EventMetric metric, HealthTrend trend) {
    return new EventHealthSnapshotDto(
        metric.eventId(),
        metric.healthScore(),
        metric.attendanceRatio(),
        metric.engagementScore(),
        metric.volunteerEfficiencyScore(),
        trend,
        metric.snapshotAt());
  }

  public UserSummaryDto toUserSummaryDto(User user, List<String> skills) {
    return new UserSummaryDto(
        user.userId(),
        user.fullName(),
        user.email(),
        user.role(),
        user.isActive(),
        user.availabilityStatus(),
        user.performanceScore(),
        skills);
  }

  public UserDetailDto toUserDetailDto(
      User user,
      List<String> skills,
      List<String> recentAssignments,
      List<String> registeredEvents) {
    return new UserDetailDto(
        user.userId(),
        user.fullName(),
        user.email(),
        user.role(),
        user.isActive(),
        user.availabilityStatus(),
        user.performanceScore(),
        skills,
        recentAssignments,
        registeredEvents);
  }

  public List<NotificationItemDto> toNotificationItems(List<Notification> notifications) {
    return notifications == null
        ? List.of()
        : notifications.stream().map(notificationMapper::toItem).toList();
  }
}