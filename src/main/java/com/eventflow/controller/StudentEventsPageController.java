package com.eventflow.controller;

import com.eventflow.dto.RoleSessionDto;
import com.eventflow.service.StudentEventDiscoveryService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.JsonPayloadMapper;
import com.eventflow.utils.SessionContextHelper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@WebServlet(urlPatterns = {"/student/events"})
public final class StudentEventsPageController extends HttpServlet {

  private static final String VIEW_PATH = "/WEB-INF/views/student/events.jsp";

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    if (currentUser.isEmpty()) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
      return;
    }

    StudentEventDiscoveryService studentEventDiscoveryService =
        AppComponentFactory.studentEventDiscoveryService(getServletContext());
    JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
    request.setAttribute(
        "studentEventsBootstrapJson",
        jsonPayloadMapper.write(studentEventDiscoveryService.listDiscoverableEvents(currentUser.get().userId())));
    request.getRequestDispatcher(VIEW_PATH).forward(request, response);
  }
}