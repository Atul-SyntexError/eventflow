package com.eventflow.dto;

import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import java.util.List;

public record UserFormRequestDto(
    String firstName,
    String lastName,
    String email,
    String password,
    RoleType role,
    boolean active,
    AvailabilityStatus availabilityStatus,
    List<String> skills) {

  public UserFormRequestDto {
    skills = DtoCollections.copyOf(skills);
  }
}