package com.eventflow.controller;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(urlPatterns = {"/error/403", "/error/404", "/error/session-expired"})
public final class ErrorPageController extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String servletPath = request.getServletPath();

    switch (servletPath) {
      case "/error/403" -> {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        request.getRequestDispatcher("/WEB-INF/views/public/unauthorized.jsp").forward(request, response);
      }
      case "/error/404" -> {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        request.getRequestDispatcher("/WEB-INF/views/public/not-found.jsp").forward(request, response);
      }
      case "/error/session-expired" -> {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        request.getRequestDispatcher("/WEB-INF/views/public/session-expired.jsp").forward(request, response);
      }
      default -> response.sendError(HttpServletResponse.SC_NOT_FOUND);
    }
  }
}