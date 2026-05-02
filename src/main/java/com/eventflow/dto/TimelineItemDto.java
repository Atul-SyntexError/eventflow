package com.eventflow.dto;

import java.time.Instant;
import java.util.List;

public record TimelineItemDto(
    Long timelineItemId,
    String label,
    Instant startAt,
    Instant endAt,
    String status,
    List<Long> relatedTaskIds) {

  public TimelineItemDto {
    relatedTaskIds = DtoCollections.copyOf(relatedTaskIds);
  }
}