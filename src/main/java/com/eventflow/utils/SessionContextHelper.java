package com.eventflow.utils;

import com.eventflow.dto.RoleSessionDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Optional;

public final class SessionContextHelper {

  public static final String SESSION_USER_ATTRIBUTE = "eventflow.currentUser";
  public static final int SESSION_TIMEOUT_SECONDS = 30 * 60;

  public Optional<RoleSessionDto> getCurrentUser(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session == null) {
      return Optional.empty();
    }

    Object value = session.getAttribute(SESSION_USER_ATTRIBUTE);
    return value instanceof RoleSessionDto roleSession ? Optional.of(roleSession) : Optional.empty();
  }

  public void store(HttpServletRequest request, RoleSessionDto roleSession) {
    HttpSession existingSession = request.getSession(false);
    if (existingSession != null) {
      existingSession.invalidate();
    }

    HttpSession session = request.getSession(true);
    session.setMaxInactiveInterval(SESSION_TIMEOUT_SECONDS);
    session.setAttribute(SESSION_USER_ATTRIBUTE, roleSession);
  }

  public void clear(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    if (session != null) {
      session.invalidate();
    }
  }

  public boolean hasAuthenticatedUser(HttpServletRequest request) {
    return getCurrentUser(request).isPresent();
  }

  public boolean isExpiredSession(HttpServletRequest request) {
    return request.getRequestedSessionId() != null && !request.isRequestedSessionIdValid();
  }
}