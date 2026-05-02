package com.eventflow.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/volunteer/notifications")
public final class VolunteerNotificationsPageController extends HttpServlet {

  private static final String VIEW_PATH = "/WEB-INF/views/volunteer/notifications.jsp";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    request.getRequestDispatcher(VIEW_PATH).forward(request, response);
  }
}