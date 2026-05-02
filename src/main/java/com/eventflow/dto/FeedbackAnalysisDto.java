package com.eventflow.dto;

import java.math.BigDecimal;
import java.util.List;

public record FeedbackAnalysisDto(
    Long eventId,
    Integer positiveCount,
    Integer neutralCount,
    Integer negativeCount,
    BigDecimal averageMoodScore,
    List<String> topComments) {

  public FeedbackAnalysisDto {
    topComments = DtoCollections.copyOf(topComments);
  }
}