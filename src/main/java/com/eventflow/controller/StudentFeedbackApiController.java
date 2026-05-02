package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.CheckInRequestDto;
import com.eventflow.dto.EventDetailDto;
import com.eventflow.dto.FeedbackSubmissionRequestDto;
import com.eventflow.dto.RegistrationRequestDto;
import com.eventflow.dto.RegistrationStatusDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.service.RegistrationService;
import com.eventflow.service.StudentEventDetailService;
import com.eventflow.service.StudentFeedbackService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
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
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet(urlPatterns = {"/api/student/events/*"})
public final class StudentFeedbackApiController extends HttpServlet {

  private static final Pattern CHECK_IN_PATH_PATTERN = Pattern.compile("^/([0-9]+)/check-in/?$");
  private static final Pattern DETAIL_PATH_PATTERN = Pattern.compile("^/([0-9]+)/?$");
  private static final Pattern FEEDBACK_PATH_PATTERN = Pattern.compile("^/([0-9]+)/feedback/?$");
  private static final Pattern REGISTRATION_PATH_PATTERN = Pattern.compile("^/([0-9]+)/registrations/?$");

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    StudentEventDetailService studentEventDetailService = AppComponentFactory.studentEventDetailService(getServletContext());

    try {
      requireActor(request);
      String pathInfo = request.getPathInfo();
      if (matches(pathInfo, DETAIL_PATH_PATTERN)) {
        long eventId = parsePath(pathInfo, DETAIL_PATH_PATTERN, "Student event route was not found.");
        EventDetailDto detail = studentEventDetailService.getEventDetail(eventId);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Student event detail loaded successfully.", detail));
        return;
      }

      throw new ApplicationException(
          "Student event route was not found.",
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    StudentFeedbackService studentFeedbackService = AppComponentFactory.studentFeedbackService(getServletContext());
    RegistrationService registrationService = AppComponentFactory.registrationService(getServletContext());

    try {
      RoleSessionDto actor = requireActor(request);
      String pathInfo = request.getPathInfo();

      if (matches(pathInfo, CHECK_IN_PATH_PATTERN)) {
        long eventId = parsePath(pathInfo, CHECK_IN_PATH_PATTERN, "Student check-in route was not found.");
        CheckInRequestDto requestBody = requireBody(request, CheckInRequestDto.class);
        RegistrationStatusDto checkedIn = registrationService.checkInStudent(actor.userId(), eventId, requestBody);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Check-in recorded successfully.", checkedIn));
        return;
      }

      if (matches(pathInfo, FEEDBACK_PATH_PATTERN)) {
        long eventId = parsePath(pathInfo, FEEDBACK_PATH_PATTERN, "Student feedback route was not found.");
        FeedbackSubmissionRequestDto requestBody = requireBody(request, FeedbackSubmissionRequestDto.class);
        studentFeedbackService.submitFeedback(actor.userId(), eventId, requestBody);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_CREATED,
            ApiResponse.success("Feedback submitted successfully.", null));
        return;
      }

      if (matches(pathInfo, REGISTRATION_PATH_PATTERN)) {
        long eventId = parsePath(pathInfo, REGISTRATION_PATH_PATTERN, "Student registration route was not found.");
        RegistrationRequestDto requestBody = requireBody(request, RegistrationRequestDto.class);
        RegistrationStatusDto created = registrationService.createRegistration(actor.userId(), eventId, requestBody);
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_CREATED,
            ApiResponse.success("Registration created successfully.", created));
        return;
      }

      throw new ApplicationException(
          "Student event route was not found.",
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
    doGet(request, response);
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
    doGet(request, response);
  }

  private long parsePath(String pathInfo, Pattern pattern, String message) {
    if (pathInfo == null) {
      throw new ApplicationException(
          message,
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    }

    Matcher matcher = pattern.matcher(pathInfo);
    if (!matcher.matches()) {
      throw new ApplicationException(
          message,
          404,
          ErrorCode.RESOURCE_NOT_FOUND,
          false,
          null);
    }

    return Long.parseLong(matcher.group(1));
  }

  private boolean matches(String pathInfo, Pattern pattern) {
    return pathInfo != null && pattern.matcher(pathInfo).matches();
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