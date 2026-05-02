package com.eventflow.dto;

import com.eventflow.model.RoleType;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.util.List;

public record RoleSessionDto(
    Long userId,
    String fullName,
    String email,
    RoleType role,
    List<String> permissions,
    Integer unreadNotificationCount,
    Instant lastLoginAt) implements Serializable {

  @Serial
  private static final long serialVersionUID = 1L;

  public RoleSessionDto {
    permissions = permissions == null ? List.of() : List.copyOf(permissions);
  }
}