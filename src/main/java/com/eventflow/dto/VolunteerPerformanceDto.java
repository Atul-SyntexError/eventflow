package com.eventflow.dto;

import java.math.BigDecimal;
import java.util.List;

public record VolunteerPerformanceDto(
    BigDecimal completionRate,
    BigDecimal onTimeRate,
    Integer activeTaskCount,
    Integer completedTaskCount,
    List<RecentEventPerformanceDto> recentEvents) {

  public VolunteerPerformanceDto {
    recentEvents = DtoCollections.copyOf(recentEvents);
  }
}