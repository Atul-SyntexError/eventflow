package com.eventflow.dto;

import java.math.BigDecimal;

public record VolunteerLeaderboardItemDto(
    Long volunteerId,
    String volunteerName,
    BigDecimal completionRate,
    BigDecimal onTimeRate,
    BigDecimal performanceScore,
    Integer completedTaskCount) {
}