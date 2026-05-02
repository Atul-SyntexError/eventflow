package com.eventflow.dto;

import java.util.List;

public record StudentDashboardDto(
    List<EventRecommendationDto> recommendedEvents,
    List<RegistrationStatusDto> upcomingRegistrations,
    List<LiveUpdateItemDto> liveUpdates) {

  public StudentDashboardDto {
    recommendedEvents = DtoCollections.copyOf(recommendedEvents);
    upcomingRegistrations = DtoCollections.copyOf(upcomingRegistrations);
    liveUpdates = DtoCollections.copyOf(liveUpdates);
  }
}