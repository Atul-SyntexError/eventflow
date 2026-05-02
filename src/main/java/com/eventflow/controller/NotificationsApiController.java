package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.NotificationFeedDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.service.NotificationService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.ErrorResponseMapper;
import com.eventflow.utils.JsonResponseWriter;
import com.eventflow.utils.SessionContextHelper;
import com.eventflow.validation.ValidationException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(urlPatterns = {"/api/notifications", "/api/notifications/*"})
public final class NotificationsApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    NotificationService notificationService = AppComponentFactory.notificationService(getServletContext());
    try {
      requireCollectionPath(request.getPathInfo());
      RoleSessionDto actor = requireActor(request);
      NotificationFeedDto feed = notificationService.getFeed(actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Notification feed loaded successfully.", feed));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    NotificationService notificationService = AppComponentFactory.notificationService(getServletContext());
    try {
      List<String> segments = normalizeSegments(request.getPathInfo());
      RoleSessionDto actor = requireActor(request);
      if (segments.size() == 2 && "read".equals(segments.get(1))) {
        long notificationId = parseNotificationId(segments.get(0));
        notificationService.markAsRead(notificationId, actor.userId());
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Notification marked as read successfully.", null));
        return;
      }

      throw new ApplicationException(
          "Notification route was not found.",
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  private RoleSessionDto requireActor(HttpServletRequest request) {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    return currentUser.orElseThrow(() ->
        new ApplicationException(
            "Authentication required.",
            401,
            ErrorCode.AUTHENTICATION_REQUIRED,
            false,
            null));
  }

  private void requireCollectionPath(String pathInfo) {
    List<String> segments = normalizeSegments(pathInfo);
    if (segments.isEmpty()) {
      return;
    }

    throw new ApplicationException(
        "Notification route was not found.",
        404,
        ErrorCode.RESOURCE_NOT_FOUND,
        false,
        null);
  }

  private List<String> normalizeSegments(String pathInfo) {
    if (pathInfo == null || "/".equals(pathInfo)) {
      return List.of();
    }

    String normalized = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
    if (normalized.endsWith("/")) {
      normalized = normalized.substring(0, normalized.length() - 1);
    }
    if (normalized.isBlank()) {
      return List.of();
    }
    return List.of(normalized.split("/"));
  }

  private long parseNotificationId(String segment) {
    try {
      return Long.parseLong(segment);
    } catch (NumberFormatException exception) {
      throw new ApplicationException(
          "Notification id is invalid.",
          400,
          ErrorCode.INVALID_FORMAT,
          false,
          exception);
    }
  }

  private void writeFailure(HttpServletResponse response, RuntimeException exception) throws IOException {
    jsonResponseWriter.writeApiResponse(response, resolveStatus(exception), errorResponseMapper.toResponse(exception));
  }

  private int resolveStatus(RuntimeException exception) {
    if (exception instanceof ValidationException) {
      return 422;
    }
    if (exception instanceof ApplicationException applicationException) {
      return applicationException.getStatusCode();
    }
    return HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
  }
}