package com.eventflow.dto;

import java.math.BigDecimal;
import java.util.List;

public record EventRecommendationDto(
    Long eventId,
    String name,
    BigDecimal score,
    List<String> reasonTags,
    String headline) {

  public EventRecommendationDto {
    reasonTags = DtoCollections.copyOf(reasonTags);
  }
}