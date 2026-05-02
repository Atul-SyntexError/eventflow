package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.StudentEventCardDto;
import com.eventflow.service.StudentEventDiscoveryService;
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

@WebServlet("/api/student/events")
public final class StudentEventsApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    StudentEventDiscoveryService studentEventDiscoveryService =
        AppComponentFactory.studentEventDiscoveryService(getServletContext());

    try {
      RoleSessionDto actor = requireActor(request);
      List<StudentEventCardDto> events = studentEventDiscoveryService.listDiscoverableEvents(actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("Student events loaded successfully.", events));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    writeFailure(
        response,
        new ApplicationException(
            "Student events route was not found.",
            404,
            ErrorCode.RESOURCE_NOT_FOUND,
            false,
            null));
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