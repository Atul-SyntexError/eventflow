package com.eventflow.model;

import java.math.BigDecimal;
import java.time.Instant;

public record User(
    Long userId,
    String email,
    String passwordHash,
    String firstName,
    String lastName,
    RoleType role,
    UserStatus userStatus,
    AvailabilityStatus availabilityStatus,
    BigDecimal performanceScore,
    Instant createdAt,
    Instant updatedAt) {

  public String fullName() {
    return firstName + " " + lastName;
  }

  public boolean isActive() {
    return userStatus == UserStatus.ACTIVE;
  }
}