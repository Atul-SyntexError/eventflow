package com.eventflow.controller;

import com.eventflow.dto.RegistrationStatusDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.StudentEventDetailPageDto;
import com.eventflow.service.RegistrationService;
import com.eventflow.service.StudentEventDetailService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.JsonPayloadMapper;
import com.eventflow.utils.SessionContextHelper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet(urlPatterns = {"/student/events/*"})
public final class StudentEventDetailPageController extends HttpServlet {

  private static final Pattern DETAIL_PATH_PATTERN = Pattern.compile("^/([0-9]+)/?$");
  private static final String VIEW_PATH = "/WEB-INF/views/student/event-detail.jsp";

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    if (currentUser.isEmpty()) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    try {
      long eventId = resolveEventId(request);
      StudentEventDetailService studentEventDetailService =
          AppComponentFactory.studentEventDetailService(getServletContext());
      RegistrationService registrationService = AppComponentFactory.registrationService(getServletContext());
      JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
      RegistrationStatusDto registration = registrationService.listUserRegistrations(currentUser.get().userId())
          .stream()
          .filter(item -> item.eventId() != null && item.eventId() == eventId)
          .findFirst()
          .orElse(null);

      request.setAttribute(
          "studentEventDetailBootstrapJson",
          jsonPayloadMapper.write(
              new StudentEventDetailPageDto(
                  studentEventDetailService.getEventDetail(eventId),
                  registration)));
      request.getRequestDispatcher(VIEW_PATH).forward(request, response);
    } catch (ApplicationException exception) {
      response.sendError(exception.getStatusCode(), exception.getMessage());
    }
  }

  private long resolveEventId(HttpServletRequest request) {
    String pathInfo = request.getPathInfo();
    if ("/detail".equals(pathInfo)
        || "/detail/".equals(pathInfo)
        || "/detail.jsp".equals(pathInfo)
        || "/detail.jsp/".equals(pathInfo)) {
      return requireEventIdQuery(request);
    }

    Matcher matcher = DETAIL_PATH_PATTERN.matcher(pathInfo == null ? "" : pathInfo);
    if (matcher.matches()) {
      return parseEventId(matcher.group(1));
    }

    throw new ApplicationException(
        "Event detail route was not found.",
        404,
        ErrorCode.RESOURCE_NOT_FOUND,
        false,
        null);
  }

  private long requireEventIdQuery(HttpServletRequest request) {
    String eventIdValue = request.getParameter("eventId");
    if (eventIdValue == null || eventIdValue.isBlank()) {
      throw new ApplicationException(
          "Event detail requires an eventId query parameter.",
          400,
          ErrorCode.INVALID_FORMAT,
          false,
          null);
    }

    return parseEventId(eventIdValue);
  }

  private long parseEventId(String eventIdValue) {
    try {
      return Long.parseLong(eventIdValue);
    } catch (NumberFormatException exception) {
      throw new ApplicationException(
          "Event detail requires a numeric eventId query parameter.",
          400,
          ErrorCode.INVALID_FORMAT,
          false,
          exception);
    }
  }
}