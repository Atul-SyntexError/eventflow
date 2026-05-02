package com.eventflow.service;

import com.eventflow.dao.EventIntelligenceDao;
import com.eventflow.dao.RiskPredictionDao;
import com.eventflow.model.Event;
import com.eventflow.model.RiskLevel;
import com.eventflow.model.RiskPrediction;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class RiskPredictionService {

  private static final BigDecimal ZERO = new BigDecimal("0.00");
  private static final BigDecimal ONE = new BigDecimal("1.00");
  private static final BigDecimal HUNDRED = new BigDecimal("100.00");
  private static final BigDecimal MEDIUM_RISK_THRESHOLD = new BigDecimal("45.00");

  private final EventIntelligenceDao eventIntelligenceDao;
  private final RiskPredictionDao riskPredictionDao;

  public RiskPredictionService(
      EventIntelligenceDao eventIntelligenceDao,
      RiskPredictionDao riskPredictionDao) {
    this.eventIntelligenceDao = eventIntelligenceDao;
    this.riskPredictionDao = riskPredictionDao;
  }

  public List<RiskPrediction> refreshPredictions(Connection connection, Event event) throws SQLException {
    EventIntelligenceDao.HealthInputs inputs = eventIntelligenceDao.findHealthInputs(connection, event.eventId())
        .orElseThrow(() -> new SQLException("Health inputs were not found for event " + event.eventId()));

    List<RiskPrediction> predictions = new ArrayList<>();
    addIfActionable(predictions, buildAttendanceRisk(event, inputs));
    addIfActionable(predictions, buildVolunteerShortageRisk(event, inputs));
    addIfActionable(predictions, buildScheduleConflictRisk(event, inputs));

    riskPredictionDao.replaceForEvent(connection, event.eventId(), predictions);
    return predictions;
  }

  private void addIfActionable(List<RiskPrediction> predictions, RiskPrediction prediction) {
    if (prediction != null && prediction.riskLevel() != RiskLevel.LOW) {
      predictions.add(prediction);
    }
  }

  private RiskPrediction buildAttendanceRisk(Event event, EventIntelligenceDao.HealthInputs inputs) {
    Integer expectedAttendance = inputs.expectedAttendance();
    if (expectedAttendance == null || expectedAttendance <= 0) {
      return null;
    }

    Instant now = Instant.now();
    int liveCount;
    String actionWindow;
    if (event.startAt() != null && now.isBefore(event.startAt())) {
      liveCount = defaultZero(inputs.registeredCount());
      actionWindow = "registration pace";
    } else {
      liveCount = defaultZero(inputs.checkedInCount());
      actionWindow = "live attendance pace";
    }

    BigDecimal progressRatio = ratio(liveCount, expectedAttendance);
    BigDecimal score = ONE.subtract(progressRatio)
        .multiply(HUNDRED)
        .setScale(2, RoundingMode.HALF_UP);
    RiskLevel riskLevel = deriveRiskLevel(score);

    return new RiskPrediction(
        null,
        event.eventId(),
        "LOW_ATTENDANCE",
        riskLevel,
        score,
        "Attendance is below the current planning target",
        "The event currently has " + liveCount + " confirmed participants against an expected attendance of " + expectedAttendance
            + ", so the " + actionWindow + " is below target.",
        "Increase promotion or adjust staffing and room plans to match the current attendance outlook.",
        Instant.now());
  }

  private RiskPrediction buildVolunteerShortageRisk(Event event, EventIntelligenceDao.HealthInputs inputs) {
    int requiredVolunteers = defaultZero(inputs.requiredVolunteers());
    if (requiredVolunteers <= 0) {
      return null;
    }

    int activeAssignments = defaultZero(inputs.activeAssignments());
    BigDecimal coverageRatio = ratio(activeAssignments, requiredVolunteers);
    BigDecimal score = ONE.subtract(coverageRatio)
        .multiply(HUNDRED)
        .setScale(2, RoundingMode.HALF_UP);
    RiskLevel riskLevel = deriveRiskLevel(score);

    return new RiskPrediction(
        null,
        event.eventId(),
        "VOLUNTEER_SHORTAGE",
        riskLevel,
        score,
        "Volunteer coverage is below task demand",
        "The event currently has " + activeAssignments + " active task assignments against " + requiredVolunteers
            + " required volunteer slots across organizer tasks.",
        "Confirm more volunteers or reduce concurrent task demand before the event window tightens.",
        Instant.now());
  }

  private RiskPrediction buildScheduleConflictRisk(Event event, EventIntelligenceDao.HealthInputs inputs) {
    int activeTaskCount = defaultZero(inputs.activeTaskCount());
    if (activeTaskCount <= 0) {
      return null;
    }

    int blockedTaskCount = defaultZero(inputs.blockedTaskCount());
    int overdueTaskCount = defaultZero(inputs.overdueTaskCount());
    int conflictCount = blockedTaskCount + overdueTaskCount;
    BigDecimal conflictRatio = ratio(conflictCount, activeTaskCount);
    BigDecimal score = conflictRatio.multiply(HUNDRED).setScale(2, RoundingMode.HALF_UP);
    RiskLevel riskLevel = deriveRiskLevel(score);

    return new RiskPrediction(
        null,
        event.eventId(),
        "SCHEDULE_CONFLICT",
        riskLevel,
        score,
        "Task timing conflicts are building around the event plan",
        "The event currently has " + blockedTaskCount + " blocked tasks and " + overdueTaskCount
            + " overdue tasks across " + activeTaskCount + " active organizer tasks.",
        "Resequence blocked work, reassign overdue tasks, or narrow the operational window before more dependencies slip.",
        Instant.now());
  }

  private int defaultZero(Integer value) {
    return value == null ? 0 : value;
  }

  private BigDecimal ratio(int numerator, int denominator) {
    if (denominator <= 0) {
      return ZERO;
    }

    BigDecimal raw = BigDecimal.valueOf(numerator)
        .divide(BigDecimal.valueOf(denominator), 4, RoundingMode.HALF_UP);
    if (raw.compareTo(ONE) > 0) {
      return ONE;
    }
    if (raw.compareTo(ZERO) < 0) {
      return ZERO;
    }
    return raw.setScale(2, RoundingMode.HALF_UP);
  }

  private RiskLevel deriveRiskLevel(BigDecimal score) {
    if (score.compareTo(new BigDecimal("90.00")) >= 0) {
      return RiskLevel.CRITICAL;
    }
    if (score.compareTo(new BigDecimal("70.00")) >= 0) {
      return RiskLevel.HIGH;
    }
    if (score.compareTo(MEDIUM_RISK_THRESHOLD) >= 0) {
      return RiskLevel.MEDIUM;
    }
    return RiskLevel.LOW;
  }
}