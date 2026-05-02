package com.eventflow.dto;

import com.eventflow.model.EventStatus;
import java.time.Instant;
import java.util.List;

public record EventFormRequestDto(
    String name,
    String description,
    String category,
    String venue,
    Instant startAt,
    Instant endAt,
    Instant registrationOpenAt,
    Instant registrationCloseAt,
    Integer expectedAttendance,
    List<ResourceRequirementDto> resourcePlan,
    EventStatus status) {

  public EventFormRequestDto {
    resourcePlan = DtoCollections.copyOf(resourcePlan);
  }
}