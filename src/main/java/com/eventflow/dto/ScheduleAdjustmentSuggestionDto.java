package com.eventflow.dto;

import java.util.List;

public record ScheduleAdjustmentSuggestionDto(
    Long eventId,
    String reasonCode,
    String headline,
    String description,
    String currentWindow,
    String suggestedWindow,
    List<Long> impactedTaskIds) {

  public ScheduleAdjustmentSuggestionDto {
    impactedTaskIds = DtoCollections.copyOf(impactedTaskIds);
  }
}