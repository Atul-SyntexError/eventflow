package com.eventflow.dto;

import java.math.BigDecimal;
import java.util.List;

public record TaskAssignmentSuggestionDto(
    Long volunteerId,
    String volunteerName,
    BigDecimal skillMatchScore,
    BigDecimal availabilityScore,
    BigDecimal performanceScore,
    BigDecimal totalScore,
    List<String> explanation) {

  public TaskAssignmentSuggestionDto {
    explanation = DtoCollections.copyOf(explanation);
  }
}