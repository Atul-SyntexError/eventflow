package com.eventflow.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet(urlPatterns = {"/volunteer/tasks", "/volunteer/tasks/*"})
public final class VolunteerTasksPageController extends HttpServlet {

  private static final Pattern DETAIL_PATH_PATTERN = Pattern.compile("^/([0-9]+)/?$");
  private static final String LIST_VIEW_PATH = "/WEB-INF/views/volunteer/tasks.jsp";
  private static final String DETAIL_VIEW_PATH = "/WEB-INF/views/volunteer/task-detail.jsp";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String pathInfo = request.getPathInfo();
    if (pathInfo == null || "/".equals(pathInfo)) {
      request.getRequestDispatcher(LIST_VIEW_PATH).forward(request, response);
      return;
    }

    if ("/detail.jsp".equals(pathInfo) || "/detail.jsp/".equals(pathInfo)) {
      request.getRequestDispatcher(DETAIL_VIEW_PATH).forward(request, response);
      return;
    }

    Matcher matcher = DETAIL_PATH_PATTERN.matcher(pathInfo);
    if (!matcher.matches()) {
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    request.setAttribute("volunteerTaskId", matcher.group(1));
    request.getRequestDispatcher(DETAIL_VIEW_PATH).forward(request, response);
  }
}