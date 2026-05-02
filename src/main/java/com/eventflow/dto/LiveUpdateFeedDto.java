package com.eventflow.dto;

import java.time.Instant;
import java.util.List;

public record LiveUpdateFeedDto(Long eventId, List<LiveUpdateItemDto> updates, Instant generatedAt) {

  public LiveUpdateFeedDto {
    updates = DtoCollections.copyOf(updates);
  }
}