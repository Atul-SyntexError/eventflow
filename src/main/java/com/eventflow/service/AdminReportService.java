package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.EventIntelligenceDao;
import com.eventflow.dto.AttendanceSummaryDto;
import com.eventflow.dto.EventHealthSnapshotDto;
import com.eventflow.dto.FeedbackAnalysisDto;
import com.eventflow.dto.ReportInsightDto;
import com.eventflow.dto.ReportSummaryDto;
import com.eventflow.mapper.ReportingDtoMapper;
import com.eventflow.model.Event;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.SQLException;

public final class AdminReportService {

  private static final BigDecimal ZERO_RATIO = new BigDecimal("0.00");
  private static final BigDecimal FULL_RATIO = new BigDecimal("1.00");

  private final ConnectionManager connectionManager;
  private final EventDao eventDao;
  private final EventIntelligenceDao eventIntelligenceDao;
  private final EventIntelligenceService eventIntelligenceService;
  private final ReportingDtoMapper reportingDtoMapper;

  public AdminReportService(
      ConnectionManager connectionManager,
      EventDao eventDao,
      EventIntelligenceDao eventIntelligenceDao,
      EventIntelligenceService eventIntelligenceService,
      ReportingDtoMapper reportingDtoMapper) {
    this.connectionManager = connectionManager;
    this.eventDao = eventDao;
    this.eventIntelligenceDao = eventIntelligenceDao;
    this.eventIntelligenceService = eventIntelligenceService;
    this.reportingDtoMapper = reportingDtoMapper;
  }

  public ReportSummaryDto getReportSummary(long eventId) {
    return withConnection("load admin report summary", connection -> {
      Event event = eventDao.findById(connection, eventId)
          .orElseThrow(() -> new ApplicationException(
              "Event was not found.",
              404,
              ErrorCode.RESOURCE_NOT_FOUND,
              false,
              null));
      EventIntelligenceDao.HealthInputs inputs = eventIntelligenceDao.findHealthInputs(connection, eventId)
          .orElseThrow(() -> new ApplicationException(
              "Event was not found.",
              404,
              ErrorCode.RESOURCE_NOT_FOUND,
              false,
              null));

      FeedbackAnalysisDto feedbackAnalysis = eventIntelligenceService.analyzeFeedback(connection, eventId);
      EventHealthSnapshotDto healthSummary = eventIntelligenceService.loadEventHealthSnapshot(connection, eventId);

      return reportingDtoMapper.toReportSummaryDto(
          eventId,
          buildAttendanceSummary(event, inputs),
          buildFeedbackSummary(feedbackAnalysis),
          buildVolunteerSummary(inputs),
          healthSummary);
    });
  }

  private AttendanceSummaryDto buildAttendanceSummary(Event event, EventIntelligenceDao.HealthInputs inputs) {
    int expectedAttendance = zeroSafe(inputs.expectedAttendance());
    int registeredCount = zeroSafe(inputs.registeredCount());
    int checkedInCount = zeroSafe(inputs.checkedInCount());
    BigDecimal fillRate = ratio(registeredCount, expectedAttendance, ZERO_RATIO);
    BigDecimal volunteerCoverage = ratio(
        zeroSafe(inputs.activeAssignments()),
        zeroSafe(inputs.requiredVolunteers()),
        FULL_RATIO);

    String note;
    if (registeredCount < expectedAttendance) {
      note = "Registrations are below the attendance plan by " + (expectedAttendance - registeredCount) + ".";
    } else if (checkedInCount < registeredCount) {
      note = "Check-in is trailing confirmed registrations by " + (registeredCount - checkedInCount) + ".";
    } else {
      note = "Attendance is currently aligned with the event plan for " + event.name() + ".";
    }

    return reportingDtoMapper.toAttendanceSummaryDto(
        formatPercent(fillRate),
        Math.max(expectedAttendance - registeredCount, 0),
      formatPercent(ratio(Math.max(registeredCount - expectedAttendance, 0), Math.max(registeredCount, 1), ZERO_RATIO)),
        formatPercent(volunteerCoverage),
        note);
  }

  private ReportInsightDto buildFeedbackSummary(FeedbackAnalysisDto feedbackAnalysis) {
    String trend = deriveFeedbackTrend(feedbackAnalysis.averageMoodScore());
    String summary = "%d positive, %d neutral, and %d negative responses. Average mood score is %s."
        .formatted(
            zeroSafe(feedbackAnalysis.positiveCount()),
            zeroSafe(feedbackAnalysis.neutralCount()),
            zeroSafe(feedbackAnalysis.negativeCount()),
            formatRatio(feedbackAnalysis.averageMoodScore() == null ? ZERO_RATIO : feedbackAnalysis.averageMoodScore()));
    return reportingDtoMapper.toReportInsightDto("Feedback summary", summary, trend);
  }

  private ReportInsightDto buildVolunteerSummary(EventIntelligenceDao.HealthInputs inputs) {
    BigDecimal coverageRate = ratio(
        zeroSafe(inputs.activeAssignments()),
        zeroSafe(inputs.requiredVolunteers()),
        FULL_RATIO);
    BigDecimal completionRate = ratio(
        zeroSafe(inputs.completedTaskCount()),
        Math.max(zeroSafe(inputs.activeTaskCount()), 1),
        ZERO_RATIO);
    String summary = "%s volunteer coverage with %s task completion across the active event workload."
        .formatted(formatPercent(coverageRate), formatPercent(completionRate));
    return reportingDtoMapper.toReportInsightDto(
        "Volunteer performance",
        summary,
        deriveVolunteerTrend(coverageRate, completionRate));
  }

  private String deriveFeedbackTrend(BigDecimal averageMoodScore) {
    BigDecimal normalized = averageMoodScore == null ? ZERO_RATIO : averageMoodScore;
    if (normalized.compareTo(new BigDecimal("0.75")) >= 0) {
      return "POSITIVE";
    }
    if (normalized.compareTo(new BigDecimal("0.45")) >= 0) {
      return "MIXED";
    }
    return "NEGATIVE";
  }

  private String deriveVolunteerTrend(BigDecimal coverageRate, BigDecimal completionRate) {
    if (coverageRate.compareTo(new BigDecimal("0.90")) >= 0
        && completionRate.compareTo(new BigDecimal("0.75")) >= 0) {
      return "ON_TRACK";
    }
    if (coverageRate.compareTo(new BigDecimal("0.60")) >= 0
        && completionRate.compareTo(new BigDecimal("0.50")) >= 0) {
      return "WATCH";
    }
    return "AT_RISK";
  }

  private BigDecimal ratio(int numerator, int denominator, BigDecimal zeroValue) {
    if (denominator <= 0) {
      return zeroValue.setScale(4, RoundingMode.HALF_UP);
    }

    BigDecimal value = BigDecimal.valueOf(numerator)
        .divide(BigDecimal.valueOf(denominator), 4, RoundingMode.HALF_UP);
    if (value.compareTo(FULL_RATIO) > 0) {
      value = FULL_RATIO;
    }
    if (value.compareTo(ZERO_RATIO) < 0) {
      value = ZERO_RATIO;
    }
    return value.setScale(4, RoundingMode.HALF_UP);
  }

  private String formatPercent(BigDecimal ratio) {
    BigDecimal normalized = ratio == null ? ZERO_RATIO : ratio;
    BigDecimal percentage = normalized.multiply(new BigDecimal("100"))
        .setScale(1, RoundingMode.HALF_UP)
        .stripTrailingZeros();
    return percentage.toPlainString() + "%";
  }

  private String formatRatio(BigDecimal value) {
    BigDecimal normalized = value == null ? ZERO_RATIO : value;
    return normalized.setScale(2, RoundingMode.HALF_UP).toPlainString();
  }

  private int zeroSafe(Integer value) {
    return value == null ? 0 : value;
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