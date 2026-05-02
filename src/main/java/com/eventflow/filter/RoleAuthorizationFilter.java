package com.eventflow.filter;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.model.RoleType;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.JsonResponseWriter;
import com.eventflow.utils.SessionContextHelper;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebFilter(urlPatterns = {"/admin/*", "/organizer/*", "/volunteer/*", "/student/*", "/api/admin/*", "/api/organizer/*", "/api/volunteer/*", "/api/student/*"})
public final class RoleAuthorizationFilter implements Filter {

  private static final Logger LOGGER = LoggerFactory.getLogger(RoleAuthorizationFilter.class);

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    RoleType requiredRole = resolveRequiredRole(httpRequest.getServletPath());

    if (requiredRole == null) {
      chain.doFilter(request, response);
      return;
    }

    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(httpRequest);
    if (currentUser.isEmpty()) {
      handleUnauthenticated(httpRequest, httpResponse);
      return;
    }

    if (currentUser.get().role() == requiredRole) {
      chain.doFilter(request, response);
      return;
    }

    LOGGER.warn(
        "Blocked unauthorized route access userId={} userRole={} requiredRole={} path={}",
        currentUser.get().userId(),
        currentUser.get().role(),
        requiredRole,
        httpRequest.getRequestURI());

    if (httpRequest.getServletPath().startsWith("/api/")) {
      ApiResponse<Void> payload = ApiResponse.failure(
          "You do not have access to this resource.",
          List.of(FieldErrorDto.global(ErrorCode.ROLE_FORBIDDEN.name(), "You do not have access to this resource.")));
      jsonResponseWriter.writeApiResponse(httpResponse, HttpServletResponse.SC_FORBIDDEN, payload);
      return;
    }

    httpResponse.sendRedirect(httpRequest.getContextPath() + "/error/403");
  }

  private void handleUnauthenticated(HttpServletRequest request, HttpServletResponse response)
      throws IOException {
    boolean expired = sessionContextHelper.isExpiredSession(request);
    if (request.getServletPath().startsWith("/api/")) {
      ApiResponse<Void> payload = ApiResponse.failure(
          expired ? "Session expired. Sign in again." : "Authentication required.",
          List.of(FieldErrorDto.global(
              expired ? ErrorCode.SESSION_EXPIRED.name() : ErrorCode.AUTHENTICATION_REQUIRED.name(),
              expired ? "Session expired. Sign in again." : "Authentication required.")));
      jsonResponseWriter.writeApiResponse(response, HttpServletResponse.SC_UNAUTHORIZED, payload);
      return;
    }

    response.sendRedirect(request.getContextPath() + (expired ? "/error/session-expired" : "/login"));
  }

  private RoleType resolveRequiredRole(String servletPath) {
    if (servletPath.startsWith("/admin/") || servletPath.startsWith("/api/admin/")) {
      return RoleType.ADMIN;
    }
    if (servletPath.startsWith("/organizer/") || servletPath.startsWith("/api/organizer/")) {
      return RoleType.ORGANIZER;
    }
    if (servletPath.startsWith("/volunteer/") || servletPath.startsWith("/api/volunteer/")) {
      return RoleType.VOLUNTEER;
    }
    if (servletPath.startsWith("/student/") || servletPath.startsWith("/api/student/")) {
      return RoleType.STUDENT;
    }
    return null;
  }
}