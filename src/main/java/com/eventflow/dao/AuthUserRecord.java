package com.eventflow.dao;

import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import com.eventflow.model.UserStatus;

public record AuthUserRecord(
    Long userId,
    String email,
    String passwordHash,
    String firstName,
    String lastName,
    RoleType role,
    UserStatus userStatus,
    AvailabilityStatus availabilityStatus,
    Integer unreadNotificationCount) {

  public String fullName() {
    return firstName + " " + lastName;
  }

  public boolean isActive() {
    return userStatus == UserStatus.ACTIVE;
  }
}