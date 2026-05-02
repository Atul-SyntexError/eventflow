package com.eventflow.dto;

import java.math.BigDecimal;

public record RecentEventPerformanceDto(
    Long eventId,
    String eventName,
    String roleLabel,
    Integer completedTasks,
    BigDecimal onTimeRate,
    BigDecimal completionRate,
    String highlight) {
}