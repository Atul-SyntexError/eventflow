package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.TaskAssignmentRequestDto;
import com.eventflow.dto.TaskAssignmentSuggestionDto;
import com.eventflow.dto.TaskDetailDto;
import com.eventflow.dto.TaskFormRequestDto;
import com.eventflow.dto.TaskSummaryDto;
import com.eventflow.service.OrganizerTaskService;
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

@WebServlet(urlPatterns = {"/api/organizer/tasks", "/api/organizer/tasks/*"})
public final class OrganizerTasksApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    OrganizerTaskService organizerTaskService = AppComponentFactory.organizerTaskService(getServletContext());
    try {
      List<String> segments = normalizeSegments(request.getPathInfo());
      if (segments.isEmpty()) {
        List<TaskSummaryDto> tasks = organizerTaskService.listTasks();
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Organizer tasks loaded successfully.", tasks));
        return;
      }

      if (segments.size() == 2 && "assignment-suggestions".equals(segments.get(1))) {
        long taskId = parseTaskId(segments.get(0));
        List<TaskAssignmentSuggestionDto> suggestions = organizerTaskService.listAssignmentSuggestions(taskId);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Task assignment suggestions loaded successfully.", suggestions));
        return;
      }

      if (segments.size() == 1) {
        long taskId = parseTaskId(segments.get(0));
        TaskDetailDto detail = organizerTaskService.getTaskDetail(taskId);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Organizer task loaded successfully.", detail));
        return;
      }

      throw new ApplicationException("Organizer task route was not found.", 404, null, false, null);
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    OrganizerTaskService organizerTaskService = AppComponentFactory.organizerTaskService(getServletContext());
    try {
      List<String> segments = normalizeSegments(request.getPathInfo());
      RoleSessionDto actor = requireActor(request);
      if (segments.isEmpty()) {
        TaskFormRequestDto formRequest = requireBody(request, TaskFormRequestDto.class);
        TaskDetailDto created = organizerTaskService.createTask(formRequest, actor.userId());
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_CREATED,
            ApiResponse.success("Organizer task created successfully.", created));
        return;
      }

      if (segments.size() == 2 && "assign".equals(segments.get(1))) {
        long taskId = parseTaskId(segments.get(0));
        TaskAssignmentRequestDto assignmentRequest = requireBody(request, TaskAssignmentRequestDto.class);
        TaskDetailDto updated = organizerTaskService.assignTask(taskId, assignmentRequest, actor.userId());
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Organizer task assignment updated successfully.", updated));
        return;
      }

      throw new ApplicationException("Organizer task route was not found.", 404, null, false, null);
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
    OrganizerTaskService organizerTaskService = AppComponentFactory.organizerTaskService(getServletContext());
    try {
      long taskId = requireDetailPath(request.getPathInfo());
      TaskFormRequestDto formRequest = requireBody(request, TaskFormRequestDto.class);
      RoleSessionDto actor = requireActor(request);
      TaskDetailDto updated = organizerTaskService.updateTask(taskId, formRequest, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Organizer task updated successfully.", updated));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
    OrganizerTaskService organizerTaskService = AppComponentFactory.organizerTaskService(getServletContext());
    try {
      long taskId = requireDetailPath(request.getPathInfo());
      RoleSessionDto actor = requireActor(request);
      organizerTaskService.deleteTask(taskId, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Organizer task deleted successfully.", null));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  private <T> T requireBody(HttpServletRequest request, Class<T> type) {
    T requestBody = jsonPayloadMapper.read(request, type);
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

  private long requireDetailPath(String pathInfo) {
    List<String> segments = normalizeSegments(pathInfo);
    if (segments.size() != 1) {
      throw new ApplicationException("Organizer task route was not found.", 404, null, false, null);
    }
    return parseTaskId(segments.get(0));
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

  private long parseTaskId(String segment) {
    try {
      return Long.parseLong(segment);
    } catch (NumberFormatException exception) {
      throw new ApplicationException("Task id is invalid.", 400, null, false, exception);
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