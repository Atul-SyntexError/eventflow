package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.TaskDetailDto;
import com.eventflow.dto.TaskSummaryDto;
import com.eventflow.dto.VolunteerTaskStatusUpdateRequestDto;
import com.eventflow.service.VolunteerTaskService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.ErrorResponseMapper;
import com.eventflow.utils.JsonPayloadMapper;
import com.eventflow.utils.JsonResponseWriter;
import com.eventflow.utils.SessionContextHelper;
import com.eventflow.validation.ValidationException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@WebServlet(urlPatterns = {"/api/volunteer/tasks", "/api/volunteer/tasks/*"})
public final class VolunteerTasksApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void service(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    if ("PATCH".equalsIgnoreCase(request.getMethod())) {
      doPatch(request, response);
      return;
    }
    super.service(request, response);
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    VolunteerTaskService volunteerTaskService = AppComponentFactory.volunteerTaskService(getServletContext());
    try {
      RoleSessionDto actor = requireActor(request);
      List<String> segments = normalizeSegments(request.getPathInfo());
      if (segments.isEmpty()) {
        List<TaskSummaryDto> tasks = volunteerTaskService.listTasks(actor.userId());
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Volunteer tasks loaded successfully.", tasks));
        return;
      }

      if (segments.size() == 1) {
        long taskId = parseTaskId(segments.get(0));
        TaskDetailDto detail = volunteerTaskService.getTaskDetail(taskId, actor.userId());
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Volunteer task loaded successfully.", detail));
        return;
      }

      throw new ApplicationException(
          "Volunteer task route was not found.",
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  protected void doPatch(HttpServletRequest request, HttpServletResponse response) throws IOException {
    VolunteerTaskService volunteerTaskService = AppComponentFactory.volunteerTaskService(getServletContext());
    try {
      RoleSessionDto actor = requireActor(request);
      long taskId = requireStatusPath(request.getPathInfo());
      VolunteerTaskStatusUpdateRequestDto updateRequest = requireBody(request, VolunteerTaskStatusUpdateRequestDto.class);
      TaskDetailDto updated = volunteerTaskService.updateTaskStatus(taskId, updateRequest, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Volunteer task status updated successfully.", updated));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  private <T> T requireBody(HttpServletRequest request, Class<T> type) {
    T requestBody = jsonPayloadMapper.read(request, type);
    if (requestBody != null) {
      return requestBody;
    }
    throw new ApplicationException(
        "Request body is required.",
        400,
        ErrorCode.INVALID_FORMAT,
        false,
        null);
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

  private long requireStatusPath(String pathInfo) {
    List<String> segments = normalizeSegments(pathInfo);
    if (segments.size() != 2 || !"status".equals(segments.get(1))) {
      throw new ApplicationException(
          "Volunteer task route was not found.",
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
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
      throw new ApplicationException(
          "Task id is invalid.",
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