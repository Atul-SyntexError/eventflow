package com.eventflow.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet(urlPatterns = "/organizer/events/*")
public final class OrganizerEventOperationsPageController extends HttpServlet {

  private static final Pattern OPERATIONS_PATH_PATTERN = Pattern.compile("^/([0-9]+)/operations/?$");
  private static final String VIEW_PATH = "/WEB-INF/views/organizer/operations.jsp";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String pathInfo = request.getPathInfo();
    Matcher matcher = OPERATIONS_PATH_PATTERN.matcher(pathInfo == null ? "" : pathInfo);
    if (!matcher.matches()) {
      response.sendError(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    request.setAttribute("operationsEventId", matcher.group(1));
    request.getRequestDispatcher(VIEW_PATH).forward(request, response);
  }
}