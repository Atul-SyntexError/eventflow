package com.eventflow.controller;

import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.SessionStatusDto;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.JsonResponseWriter;
import com.eventflow.utils.SessionContextHelper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@WebServlet("/api/session")
public final class SessionApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    SessionStatusDto payload = new SessionStatusDto(
        currentUser.isPresent(),
        sessionContextHelper.isExpiredSession(request),
        currentUser.orElse(null));

    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    response.setHeader("Pragma", "no-cache");
    jsonResponseWriter.writeSessionStatus(
        response,
        currentUser.isPresent() ? HttpServletResponse.SC_OK : HttpServletResponse.SC_UNAUTHORIZED,
        payload);
  }
}