package com.eventflow.dto;

import com.eventflow.model.EventStatus;
import java.time.Instant;
import java.util.List;

public record EventDetailDto(
    Long eventId,
    String code,
    String name,
    String description,
    String category,
    EventStatus status,
    String venue,
    Instant startAt,
    Instant endAt,
    Instant registrationOpenAt,
    Instant registrationCloseAt,
    Integer expectedAttendance,
    List<ResourceRequirementDto> resourcePlan,
    EventHealthSnapshotDto healthSnapshot,
    List<RiskPredictionDto> riskPredictions,
    List<TimelineItemDto> timeline) {

  public EventDetailDto {
    resourcePlan = DtoCollections.copyOf(resourcePlan);
    riskPredictions = DtoCollections.copyOf(riskPredictions);
    timeline = DtoCollections.copyOf(timeline);
  }
}