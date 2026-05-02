package com.eventflow.dto;

import java.math.BigDecimal;
import java.util.List;

public record VolunteerPerformanceReportDto(
    Long eventId,
    List<VolunteerLeaderboardItemDto> topVolunteers,
    BigDecimal coverageRate,
    BigDecimal completionRate) {

  public VolunteerPerformanceReportDto {
    topVolunteers = DtoCollections.copyOf(topVolunteers);
  }
}