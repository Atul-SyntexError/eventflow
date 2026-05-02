package com.eventflow.dto;

import com.eventflow.model.HealthTrend;
import java.math.BigDecimal;
import java.time.Instant;

public record EventHealthSnapshotDto(
    Long eventId,
    BigDecimal healthScore,
    BigDecimal attendanceRatio,
    BigDecimal engagementScore,
    BigDecimal volunteerEfficiencyScore,
    HealthTrend trend,
    Instant snapshotAt) {
}