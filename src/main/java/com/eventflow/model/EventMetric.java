package com.eventflow.model;

import java.math.BigDecimal;
import java.time.Instant;

public record EventMetric(
    Long eventMetricId,
    Long eventId,
    Instant snapshotAt,
    Integer registeredCount,
    Integer checkedInCount,
    BigDecimal attendanceRatio,
    BigDecimal engagementScore,
    BigDecimal volunteerEfficiencyScore,
    BigDecimal healthScore,
    RiskLevel riskLevel) {
}