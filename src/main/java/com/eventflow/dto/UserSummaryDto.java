package com.eventflow.dto;

import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import java.math.BigDecimal;
import java.util.List;

public record UserSummaryDto(
    Long userId,
    String fullName,
    String email,
    RoleType role,
    boolean active,
    AvailabilityStatus availabilityStatus,
    BigDecimal performanceScore,
    List<String> skills) {

  public UserSummaryDto {
    skills = DtoCollections.copyOf(skills);
  }
}