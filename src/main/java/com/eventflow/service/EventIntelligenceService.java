package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventIntelligenceDao;
import com.eventflow.dto.EventHealthSnapshotDto;
import com.eventflow.dto.FeedbackAnalysisDto;
import com.eventflow.mapper.AdminDtoMapper;
import com.eventflow.mapper.ReportingDtoMapper;
import com.eventflow.model.EventMetric;
import com.eventflow.model.HealthTrend;
import com.eventflow.model.RiskLevel;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public final class EventIntelligenceService {

  private static final BigDecimal ZERO_RATIO = new BigDecimal("0.00");
  private static final BigDecimal FULL_RATIO = new BigDecimal("1.00");
  private static final BigDecimal NEUTRAL_ENGAGEMENT = new BigDecimal("0.50");
  private static final BigDecimal ATTENDANCE_WEIGHT = new BigDecimal("45.00");
  private static final BigDecimal ENGAGEMENT_WEIGHT = new BigDecimal("25.00");
  private static final BigDecimal VOLUNTEER_WEIGHT = new BigDecimal("30.00");
  private static final BigDecimal TREND_DELTA = new BigDecimal("2.00");
  private static final BigDecimal VOLUNTEER_COVERAGE_WEIGHT = new BigDecimal("0.45");
  private static final BigDecimal VOLUNTEER_MOMENTUM_WEIGHT = new BigDecimal("0.35");
  private static final BigDecimal VOLUNTEER_RELIABILITY_WEIGHT = new BigDecimal("0.20");

  private final ConnectionManager connectionManager;
  private final EventIntelligenceDao eventIntelligenceDao;
  private final ReportingDtoMapper reportingDtoMapper;
  private final AdminDtoMapper adminDtoMapper;

  public EventIntelligenceService(
      ConnectionManager connectionManager,
      EventIntelligenceDao eventIntelligenceDao,
      ReportingDtoMapper reportingDtoMapper,
      AdminDtoMapper adminDtoMapper) {
    this.connectionManager = connectionManager;
    this.eventIntelligenceDao = eventIntelligenceDao;
    this.reportingDtoMapper = reportingDtoMapper;
    this.adminDtoMapper = adminDtoMapper;
  }

  public FeedbackAnalysisDto analyzeFeedback(long eventId) {
    return withConnection("analyze feedback", connection -> analyzeFeedback(connection, eventId));
  }

  public EventHealthSnapshotDto loadEventHealthSnapshot(long eventId) {
    return withConnection("load event health snapshot", connection -> loadEventHealthSnapshot(connection, eventId));
  }

  public EventHealthSnapshotDto refreshEventHealth(long eventId) {
    return withConnection("refresh event health", connection -> refreshEventHealth(connection, eventId));
  }

  FeedbackAnalysisDto analyzeFeedback(Connection connection, long eventId) throws SQLException {
    EventIntelligenceDao.FeedbackAggregate aggregate = eventIntelligenceDao.loadFeedbackAggregate(connection, eventId);
    List<String> topComments = eventIntelligenceDao.findTopComments(connection, eventId, 3);
    BigDecimal averageMoodScore = normalizeRatio(
        aggregate.averageMoodScore() == null ? NEUTRAL_ENGAGEMENT : aggregate.averageMoodScore());

    return reportingDtoMapper.toFeedbackAnalysisDto(
        eventId,
        aggregate.positiveCount(),
        aggregate.neutralCount(),
        aggregate.negativeCount(),
        averageMoodScore,
        topComments);
  }

  EventHealthSnapshotDto refreshEventHealth(Connection connection, long eventId) throws SQLException {
    EventIntelligenceDao.HealthInputs inputs = eventIntelligenceDao.findHealthInputs(connection, eventId)
        .orElseThrow(() -> new ApplicationException(
            "Event was not found.",
            404,
            ErrorCode.RESOURCE_NOT_FOUND,
            false,
            null));

    FeedbackAnalysisDto feedbackAnalysis = analyzeFeedback(connection, eventId);
    BigDecimal attendanceRatio = computeAttendanceRatio(inputs);
    BigDecimal engagementScore = normalizeRatio(
        feedbackAnalysis.averageMoodScore() == null ? NEUTRAL_ENGAGEMENT : feedbackAnalysis.averageMoodScore());
    BigDecimal volunteerEfficiencyScore = computeVolunteerEfficiency(inputs);
    BigDecimal healthScore = attendanceRatio.multiply(ATTENDANCE_WEIGHT)
        .add(engagementScore.multiply(ENGAGEMENT_WEIGHT))
        .add(volunteerEfficiencyScore.multiply(VOLUNTEER_WEIGHT))
        .setScale(2, RoundingMode.HALF_UP);
    RiskLevel riskLevel = deriveRiskLevel(healthScore);

    Optional<EventMetric> previousMetric = eventIntelligenceDao.findLatestMetric(connection, eventId);
    EventMetric snapshot = new EventMetric(
        null,
        eventId,
        Instant.now(),
        inputs.registeredCount(),
        inputs.checkedInCount(),
        attendanceRatio,
        engagementScore,
        volunteerEfficiencyScore,
        healthScore,
        riskLevel);
    eventIntelligenceDao.insertEventMetric(connection, snapshot);

    return adminDtoMapper.toEventHealthSnapshotDto(
        snapshot,
        deriveTrend(previousMetric.map(EventMetric::healthScore).orElse(null), healthScore));
  }

  EventHealthSnapshotDto loadEventHealthSnapshot(Connection connection, long eventId) throws SQLException {
    List<EventMetric> recentMetrics = eventIntelligenceDao.findRecentMetrics(connection, eventId, 2);
    if (recentMetrics.isEmpty()) {
      return refreshEventHealth(connection, eventId);
    }

    EventMetric currentMetric = recentMetrics.get(0);
    EventMetric previousMetric = recentMetrics.size() > 1 ? recentMetrics.get(1) : null;
    return adminDtoMapper.toEventHealthSnapshotDto(
        currentMetric,
        deriveTrend(previousMetric == null ? null : previousMetric.healthScore(), currentMetric.healthScore()));
  }

  private BigDecimal computeAttendanceRatio(EventIntelligenceDao.HealthInputs inputs) {
    int expectedAttendance = inputs.expectedAttendance() == null ? 0 : inputs.expectedAttendance();
    int checkedInCount = inputs.checkedInCount() == null ? 0 : inputs.checkedInCount();
    return ratio(checkedInCount, expectedAttendance, ZERO_RATIO);
  }

  private BigDecimal computeVolunteerEfficiency(EventIntelligenceDao.HealthInputs inputs) {
    int requiredVolunteers = inputs.requiredVolunteers() == null ? 0 : inputs.requiredVolunteers();
    int activeAssignments = inputs.activeAssignments() == null ? 0 : inputs.activeAssignments();
    int activeTaskCount = inputs.activeTaskCount() == null ? 0 : inputs.activeTaskCount();
    int assignedTaskCount = inputs.assignedTaskCount() == null ? 0 : inputs.assignedTaskCount();
    int inProgressTaskCount = inputs.inProgressTaskCount() == null ? 0 : inputs.inProgressTaskCount();
    int completedTaskCount = inputs.completedTaskCount() == null ? 0 : inputs.completedTaskCount();
    int blockedTaskCount = inputs.blockedTaskCount() == null ? 0 : inputs.blockedTaskCount();
    int overdueTaskCount = inputs.overdueTaskCount() == null ? 0 : inputs.overdueTaskCount();

    BigDecimal coverageScore = requiredVolunteers <= 0
        ? FULL_RATIO
        : ratio(activeAssignments, requiredVolunteers, FULL_RATIO);

    BigDecimal momentumScore = activeTaskCount <= 0
        ? FULL_RATIO
        : ratio(assignedTaskCount + inProgressTaskCount + completedTaskCount, activeTaskCount, ZERO_RATIO);

    BigDecimal reliabilityScore;
    if (activeTaskCount <= 0) {
      reliabilityScore = FULL_RATIO;
    } else {
      BigDecimal blockedRatio = ratio(blockedTaskCount, activeTaskCount, ZERO_RATIO);
      BigDecimal overdueRatio = ratio(overdueTaskCount, activeTaskCount, ZERO_RATIO);
      BigDecimal averagePenalty = blockedRatio.add(overdueRatio)
          .divide(new BigDecimal("2.00"), 4, RoundingMode.HALF_UP);
      reliabilityScore = normalizeRatio(FULL_RATIO.subtract(averagePenalty));
    }

    return normalizeRatio(
        coverageScore.multiply(VOLUNTEER_COVERAGE_WEIGHT)
            .add(momentumScore.multiply(VOLUNTEER_MOMENTUM_WEIGHT))
            .add(reliabilityScore.multiply(VOLUNTEER_RELIABILITY_WEIGHT)));
  }

  private BigDecimal ratio(int numerator, int denominator, BigDecimal zeroValue) {
    if (denominator <= 0) {
      return normalizeRatio(zeroValue);
    }

    BigDecimal raw = BigDecimal.valueOf(numerator)
        .divide(BigDecimal.valueOf(denominator), 4, RoundingMode.HALF_UP);
    if (raw.compareTo(FULL_RATIO) > 0) {
      raw = FULL_RATIO;
    }
    if (raw.compareTo(ZERO_RATIO) < 0) {
      raw = ZERO_RATIO;
    }
    return normalizeRatio(raw);
  }

  private BigDecimal normalizeRatio(BigDecimal value) {
    BigDecimal normalized = value == null ? ZERO_RATIO : value;
    if (normalized.compareTo(FULL_RATIO) > 0) {
      normalized = FULL_RATIO;
    }
    if (normalized.compareTo(ZERO_RATIO) < 0) {
      normalized = ZERO_RATIO;
    }
    return normalized.setScale(2, RoundingMode.HALF_UP);
  }

  private RiskLevel deriveRiskLevel(BigDecimal healthScore) {
    if (healthScore.compareTo(new BigDecimal("40.00")) < 0) {
      return RiskLevel.CRITICAL;
    }
    if (healthScore.compareTo(new BigDecimal("60.00")) < 0) {
      return RiskLevel.HIGH;
    }
    if (healthScore.compareTo(new BigDecimal("80.00")) < 0) {
      return RiskLevel.MEDIUM;
    }
    return RiskLevel.LOW;
  }

  private HealthTrend deriveTrend(BigDecimal previousHealthScore, BigDecimal currentHealthScore) {
    if (previousHealthScore == null) {
      return HealthTrend.STABLE;
    }

    BigDecimal delta = currentHealthScore.subtract(previousHealthScore);
    if (delta.compareTo(TREND_DELTA) >= 0) {
      return HealthTrend.UP;
    }
    if (delta.compareTo(TREND_DELTA.negate()) <= 0) {
      return HealthTrend.DOWN;
    }
    return HealthTrend.STABLE;
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