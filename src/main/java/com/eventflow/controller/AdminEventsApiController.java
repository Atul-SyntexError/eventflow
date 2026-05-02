package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.EventDetailDto;
import com.eventflow.dto.EventFormRequestDto;
import com.eventflow.dto.EventSummaryDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.RiskPredictionDto;
import com.eventflow.service.AdminEventService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorResponseMapper;
import com.eventflow.utils.JsonPayloadMapper;
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

@WebServlet(urlPatterns = {"/api/admin/events", "/api/admin/events/*"})
public final class AdminEventsApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminEventService adminEventService = AppComponentFactory.adminEventService(getServletContext());
    try {
      List<String> segments = normalizeSegments(request.getPathInfo());
      if (segments.isEmpty()) {
        List<EventSummaryDto> events = adminEventService.listEvents();
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Events loaded successfully.", events));
        return;
      }

      if (segments.size() == 2 && "risks".equals(segments.get(1))) {
        long eventId = parseEventId(segments.get(0));
        List<RiskPredictionDto> risks = adminEventService.listEventRisks(eventId);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Event risks loaded successfully.", risks));
        return;
      }

      if (segments.size() == 1) {
        long eventId = parseEventId(segments.get(0));
        EventDetailDto detail = adminEventService.getEventDetail(eventId);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Event loaded successfully.", detail));
        return;
      }

      throw new ApplicationException("Event route was not found.", 404, null, false, null);
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminEventService adminEventService = AppComponentFactory.adminEventService(getServletContext());
    try {
      requireCollectionPath(request.getPathInfo());
      EventFormRequestDto formRequest = requireBody(request);
      RoleSessionDto actor = requireActor(request);
      EventDetailDto created = adminEventService.createEvent(formRequest, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_CREATED,
          ApiResponse.success("Event created successfully.", created));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminEventService adminEventService = AppComponentFactory.adminEventService(getServletContext());
    try {
      long eventId = requireDetailPath(request.getPathInfo());
      EventFormRequestDto formRequest = requireBody(request);
      RoleSessionDto actor = requireActor(request);
      EventDetailDto updated = adminEventService.updateEvent(eventId, formRequest, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Event updated successfully.", updated));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminEventService adminEventService = AppComponentFactory.adminEventService(getServletContext());
    try {
      long eventId = requireDetailPath(request.getPathInfo());
      RoleSessionDto actor = requireActor(request);
      adminEventService.deleteEvent(eventId, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Event deleted successfully.", null));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  private EventFormRequestDto requireBody(HttpServletRequest request) {
    EventFormRequestDto requestBody = jsonPayloadMapper.read(request, EventFormRequestDto.class);
    if (requestBody != null) {
      return requestBody;
    }

    throw new ApplicationException("Request body is required.", 400, null, false, null);
  }

  private RoleSessionDto requireActor(HttpServletRequest request) {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    return currentUser.orElseThrow(() ->
        new ApplicationException("Authentication required.", 401, null, false, null));
  }

  private void requireCollectionPath(String pathInfo) {
    if (normalizeSegments(pathInfo).isEmpty()) {
      return;
    }

    throw new ApplicationException("Event route was not found.", 404, null, false, null);
  }

  private long requireDetailPath(String pathInfo) {
    List<String> segments = normalizeSegments(pathInfo);
    if (segments.size() != 1) {
      throw new ApplicationException("Event route was not found.", 404, null, false, null);
    }
    return parseEventId(segments.get(0));
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

  private long parseEventId(String segment) {
    try {
      return Long.parseLong(segment);
    } catch (NumberFormatException exception) {
      throw new ApplicationException("Event id is invalid.", 400, null, false, exception);
    }
  }

  private void writeFailure(HttpServletResponse response, RuntimeException exception) throws IOException {
    int status = resolveStatus(exception);
    jsonResponseWriter.writeApiResponse(response, status, errorResponseMapper.toResponse(exception));
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