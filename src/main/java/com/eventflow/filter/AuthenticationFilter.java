package com.eventflow.filter;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.FieldErrorDto;
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
import java.util.Map;

@WebFilter(urlPatterns = {"/dashboard", "/logout", "/admin/*", "/organizer/*", "/volunteer/*", "/student/*", "/api/*"})
public final class AuthenticationFilter implements Filter {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest httpRequest = (HttpServletRequest) request;
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    String servletPath = httpRequest.getServletPath();

    if ("/api/session".equals(servletPath) || sessionContextHelper.hasAuthenticatedUser(httpRequest)) {
      chain.doFilter(request, response);
      return;
    }

    boolean expired = sessionContextHelper.isExpiredSession(httpRequest);
    if (servletPath.startsWith("/api/")) {
      ApiResponse<Void> payload = ApiResponse.failure(
          expired ? "Session expired. Sign in again." : "Authentication required.",
          List.of(FieldErrorDto.global(
              expired ? ErrorCode.SESSION_EXPIRED.name() : ErrorCode.AUTHENTICATION_REQUIRED.name(),
              expired ? "Session expired. Sign in again." : "Authentication required.")),
          Map.of("expired", expired));
      jsonResponseWriter.writeApiResponse(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, payload);
      return;
    }

    httpResponse.sendRedirect(httpRequest.getContextPath() + (expired ? "/error/session-expired" : "/login"));
  }
}