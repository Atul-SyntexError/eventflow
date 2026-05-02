package com.eventflow.mapper;

import com.eventflow.dto.RoleSessionDto;
import com.eventflow.model.User;
import java.time.Instant;
import java.util.List;

public final class RoleSessionMapper {

  public RoleSessionDto toDto(
      User user,
      List<String> permissions,
      int unreadNotificationCount,
      Instant lastLoginAt) {
    return new RoleSessionDto(
        user.userId(),
        user.fullName(),
        user.email(),
        user.role(),
        permissions,
        unreadNotificationCount,
        lastLoginAt);
  }
}