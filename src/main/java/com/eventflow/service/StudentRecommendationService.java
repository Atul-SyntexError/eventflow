package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.EventIntelligenceDao;
import com.eventflow.dao.StudentRecommendationSnapshotDao;
import com.eventflow.dto.EventRecommendationDto;
import com.eventflow.mapper.StudentDtoMapper;
import com.eventflow.model.Event;
import com.eventflow.model.EventMetric;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

public final class StudentRecommendationService {

  private static final BigDecimal DEFAULT_HEALTH_RATIO = new BigDecimal("0.55");
  private static final BigDecimal AVAILABLE_BONUS = new BigDecimal("0.15");
  private static final BigDecimal SOON_BONUS = new BigDecimal("0.05");
  private static final BigDecimal OPEN_BONUS = new BigDecimal("0.10");
  private static final BigDecimal FULL_PENALTY = new BigDecimal("0.25");
  private static final BigDecimal MAX_SCORE = new BigDecimal("0.99");
  private static final BigDecimal MIN_SCORE = new BigDecimal("0.05");
  private static final int MAX_RECOMMENDATIONS = 3;

  private final ConnectionManager connectionManager;
  private final EventDao eventDao;
  private final EventIntelligenceDao eventIntelligenceDao;
  private final StudentRecommendationSnapshotDao studentRecommendationSnapshotDao;
  private final StudentDtoMapper studentDtoMapper;

  public StudentRecommendationService(
      ConnectionManager connectionManager,
      EventDao eventDao,
      EventIntelligenceDao eventIntelligenceDao,
      StudentRecommendationSnapshotDao studentRecommendationSnapshotDao,
      StudentDtoMapper studentDtoMapper) {
    this.connectionManager = connectionManager;
    this.eventDao = eventDao;
    this.eventIntelligenceDao = eventIntelligenceDao;
    this.studentRecommendationSnapshotDao = studentRecommendationSnapshotDao;
    this.studentDtoMapper = studentDtoMapper;
  }

  public List<EventRecommendationDto> listRecommendations(long studentId) {
    return withConnection("load student recommendations", connection -> {
      List<EventRecommendationDto> recommendations = new ArrayList<>();
      for (EventDao.StudentDiscoveryEventRow row : eventDao.findStudentDiscoveryEvents(connection, studentId)) {
        toRecommendation(connection, row).ifPresent(recommendations::add);
      }

      List<EventRecommendationDto> orderedRecommendations = recommendations.stream()
          .sorted(Comparator.comparing(EventRecommendationDto::score).reversed())
          .limit(MAX_RECOMMENDATIONS)
          .toList();
      studentRecommendationSnapshotDao.replaceForStudent(connection, studentId, orderedRecommendations);
      return orderedRecommendations;
    });
  }

  private Optional<EventRecommendationDto> toRecommendation(
      Connection connection,
      EventDao.StudentDiscoveryEventRow row) throws SQLException {
    String registrationStatus = resolveRegistrationStatus(row.studentRegistrationStatus());
    if (!"OPEN".equals(registrationStatus)) {
      return Optional.empty();
    }

    String capacityState = resolveCapacityState(row.confirmedCount(), row.event().expectedAttendance());
    if ("FULL".equals(capacityState)) {
      return Optional.empty();
    }

    Optional<EventMetric> latestMetric = eventIntelligenceDao.findLatestMetric(connection, row.event().eventId());
    BigDecimal score = computeScore(row.event(), registrationStatus, capacityState, latestMetric.orElse(null));

    return Optional.of(studentDtoMapper.toEventRecommendationDto(
        row.event().eventId(),
        row.event().name(),
        score,
        buildReasonTags(row.event(), capacityState, latestMetric.orElse(null)),
        buildHeadline(row.event(), capacityState, latestMetric.orElse(null))));
  }

  private BigDecimal computeScore(
      Event event,
      String registrationStatus,
      String capacityState,
      EventMetric metric) {
    BigDecimal score = metric == null
        ? DEFAULT_HEALTH_RATIO
        : metric.healthScore().divide(new BigDecimal("100.00"), 4, RoundingMode.HALF_UP);

    if ("OPEN".equals(registrationStatus)) {
      score = score.add(OPEN_BONUS);
    }

    if ("AVAILABLE".equals(capacityState)) {
      score = score.add(AVAILABLE_BONUS);
    } else {
      score = score.subtract(FULL_PENALTY);
    }

    if (event.startAt() != null) {
      Instant soonCutoff = Instant.now().plus(21, ChronoUnit.DAYS);
      if (event.startAt().isBefore(soonCutoff)) {
        score = score.add(SOON_BONUS);
      }
    }

    if (score.compareTo(MAX_SCORE) > 0) {
      score = MAX_SCORE;
    }
    if (score.compareTo(MIN_SCORE) < 0) {
      score = MIN_SCORE;
    }
    return score.setScale(2, RoundingMode.HALF_UP);
  }

  private List<String> buildReasonTags(Event event, String capacityState, EventMetric metric) {
    List<String> tags = new ArrayList<>(deriveCategoryTags(event.category()));
    tags.add("AVAILABLE".equals(capacityState) ? "open seats" : "limited seats");

    if (metric != null && metric.healthScore() != null) {
      if (metric.healthScore().compareTo(new BigDecimal("80.00")) >= 0) {
        tags.add("healthy event");
      } else if (metric.healthScore().compareTo(new BigDecimal("60.00")) >= 0) {
        tags.add("stable delivery");
      } else {
        tags.add("watch schedule");
      }
    } else {
      tags.add("newly opened");
    }

    return tags.stream().distinct().limit(3).toList();
  }

  private List<String> deriveCategoryTags(String category) {
    String normalized = category == null ? "event" : category.toLowerCase(Locale.ROOT);
    if (normalized.contains("innovation") || normalized.contains("startup")) {
      return List.of("innovation", "demos", "networking");
    }
    if (normalized.contains("research")) {
      return List.of("research", "talks", "mentoring");
    }
    if (normalized.contains("design")) {
      return List.of("design", "hands-on", "portfolio");
    }
    if (normalized.contains("campus") || normalized.contains("showcase")) {
      return List.of("campus showcase", "networking", "student-facing");
    }
    return List.of(normalized, "open registration");
  }

  private String buildHeadline(Event event, String capacityState, EventMetric metric) {
    String category = event.category() == null ? "event" : event.category().toLowerCase(Locale.ROOT);
    if (metric != null && metric.healthScore() != null && metric.healthScore().compareTo(new BigDecimal("80.00")) >= 0) {
      return "Open registration and a strong health snapshot make this " + category + " event a reliable pick.";
    }
    if ("AVAILABLE".equals(capacityState)) {
      return "This " + category + " event is open and currently has room for new registrations.";
    }
    return "This " + category + " event still looks viable, but you should register soon before capacity tightens.";
  }

  private String resolveRegistrationStatus(String persistedStatus) {
    if (persistedStatus == null || persistedStatus.isBlank()) {
      return "OPEN";
    }
    return persistedStatus;
  }

  private String resolveCapacityState(int confirmedCount, Integer expectedAttendance) {
    if (expectedAttendance == null || expectedAttendance <= 0) {
      return "FULL";
    }
    return confirmedCount >= expectedAttendance ? "FULL" : "AVAILABLE";
  }

  private <T> T withConnection(String operation, SqlWork<T> work) {
    try (Connection connection = connectionManager.getConnection()) {
      try {
        T result = work.execute(connection);
        connection.commit();
        return result;
      } catch (SQLException exception) {
        rollbackQuietly(connection);
        throw new DaoException("Failed to " + operation + ".", exception);
      } catch (RuntimeException exception) {
        rollbackQuietly(connection);
        throw exception;
      }
    } catch (SQLException exception) {
      throw new DaoException("Failed to open connection for " + operation + ".", exception);
    }
  }

  private void rollbackQuietly(Connection connection) {
    try {
      connection.rollback();
    } catch (SQLException ignored) {
      // Ignore rollback failures to preserve the original exception.
    }
  }

  @FunctionalInterface
  private interface SqlWork<T> {
    T execute(Connection connection) throws SQLException;
  }
}