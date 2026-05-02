package com.eventflow.utils;

import com.eventflow.model.RoleType;
import java.util.List;
import java.util.Map;

public final class RolePermissionRegistry {

  private static final Map<RoleType, List<String>> PERMISSIONS = Map.of(
      RoleType.ADMIN, List.of("EVENT_MANAGE", "USER_MANAGE", "REPORT_VIEW"),
      RoleType.ORGANIZER, List.of("TASK_MANAGE", "TASK_ASSIGN", "EVENT_OPERATIONS"),
      RoleType.VOLUNTEER, List.of("TASK_VIEW", "TASK_UPDATE", "PERFORMANCE_VIEW"),
      RoleType.STUDENT, List.of("EVENT_REGISTER", "CHECKIN", "FEEDBACK_SUBMIT"));

  public List<String> permissionsFor(RoleType roleType) {
    return PERMISSIONS.getOrDefault(roleType, List.of());
  }

  public String defaultPathFor(RoleType roleType) {
    return switch (roleType) {
      case ADMIN -> "/admin/dashboard.jsp";
      case ORGANIZER -> "/organizer/dashboard.jsp";
      case VOLUNTEER -> "/volunteer/dashboard.jsp";
      case STUDENT -> "/student/dashboard";
    };
  }
}