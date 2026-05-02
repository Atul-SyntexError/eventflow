package com.eventflow.dto;

import com.eventflow.model.EventStatus;
import com.eventflow.model.RiskLevel;
import java.math.BigDecimal;
import java.time.Instant;

public record EventSummaryDto(
    Long eventId,
    String code,
    String name,
    String category,
    EventStatus status,
    String venue,
    Instant startAt,
    Instant endAt,
    Integer expectedAttendance,
    Integer registeredCount,
    Integer checkedInCount,
    BigDecimal healthScore,
    RiskLevel riskLevel) {
}