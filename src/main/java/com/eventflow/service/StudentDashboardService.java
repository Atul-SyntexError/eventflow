package com.eventflow.service;

import com.eventflow.dto.LiveUpdateItemDto;
import com.eventflow.dto.NotificationItemDto;
import com.eventflow.dto.RegistrationStatusDto;
import com.eventflow.dto.StudentDashboardDto;
import com.eventflow.mapper.StudentDtoMapper;
import com.eventflow.model.RegistrationStatus;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class StudentDashboardService {

  private static final int LIVE_UPDATE_LIMIT = 6;
  private static final Pattern EVENT_PATH_PATTERN = Pattern.compile(".*/student/events/([0-9]+)(?:/)?(?:\\?.*)?$");
  private static final Pattern EVENT_QUERY_PATTERN = Pattern.compile("[?&]eventId=([0-9]+)(?:&|$)");

  private final StudentRecommendationService studentRecommendationService;
  private final RegistrationService registrationService;
  private final NotificationService notificationService;
  private final StudentDtoMapper studentDtoMapper;

  public StudentDashboardService(
      StudentRecommendationService studentRecommendationService,
      RegistrationService registrationService,
      NotificationService notificationService,
      StudentDtoMapper studentDtoMapper) {
    this.studentRecommendationService = studentRecommendationService;
    this.registrationService = registrationService;
    this.notificationService = notificationService;
    this.studentDtoMapper = studentDtoMapper;
  }

  public StudentDashboardDto getDashboard(long studentId) {
    List<RegistrationStatusDto> upcomingRegistrations = registrationService.listUserRegistrations(studentId).stream()
        .filter(this::includeOnDashboard)
        .toList();

    List<LiveUpdateItemDto> liveUpdates = notificationService.getFeed(studentId).items().stream()
        .limit(LIVE_UPDATE_LIMIT)
        .map(this::toLiveUpdateItem)
        .toList();

    return studentDtoMapper.toDashboardDto(
        studentRecommendationService.listRecommendations(studentId),
        upcomingRegistrations,
        liveUpdates);
  }

  private boolean includeOnDashboard(RegistrationStatusDto registration) {
    RegistrationStatus status = registration.status();
    return status != RegistrationStatus.CANCELLED && status != RegistrationStatus.NO_SHOW;
  }

  private LiveUpdateItemDto toLiveUpdateItem(NotificationItemDto notification) {
    return studentDtoMapper.toLiveUpdateItemDto(
        resolveEventId(notification.link()),
        notification.title(),
        notification.type() == null ? "GENERAL_ANNOUNCEMENT" : notification.type().name(),
        notification.body(),
        notification.createdAt());
  }

  private Long resolveEventId(String link) {
    if (link == null || link.isBlank()) {
      return null;
    }

    Matcher pathMatcher = EVENT_PATH_PATTERN.matcher(link);
    if (pathMatcher.matches()) {
      return parseLong(pathMatcher.group(1));
    }

    Matcher queryMatcher = EVENT_QUERY_PATTERN.matcher(link);
    if (queryMatcher.find()) {
      return parseLong(queryMatcher.group(1));
    }

    return null;
  }

  private Long parseLong(String value) {
    try {
      return Long.valueOf(value);
    } catch (NumberFormatException exception) {
      return null;
    }
  }
}