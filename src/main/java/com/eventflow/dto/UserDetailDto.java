package com.eventflow.dto;

import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import java.math.BigDecimal;
import java.util.List;

public record UserDetailDto(
    Long userId,
    String fullName,
    String email,
    RoleType role,
    boolean active,
    AvailabilityStatus availabilityStatus,
    BigDecimal performanceScore,
    List<String> skills,
    List<String> recentAssignments,
    List<String> registeredEvents) {

  public UserDetailDto {
    skills = DtoCollections.copyOf(skills);
    recentAssignments = DtoCollections.copyOf(recentAssignments);
    registeredEvents = DtoCollections.copyOf(registeredEvents);
  }
}