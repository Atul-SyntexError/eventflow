package com.eventflow.controller;

import com.eventflow.utils.AppComponentFactory;
import jakarta.servlet.http.Cookie;
import com.eventflow.utils.SessionContextHelper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/logout")
public final class LogoutController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    sessionContextHelper.clear(request);
    expireSessionCookie(request, response);
    response.sendRedirect(request.getContextPath() + "/login?loggedOut=1");
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
  }

  private void expireSessionCookie(HttpServletRequest request, HttpServletResponse response) {
    Cookie cookie = new Cookie("JSESSIONID", "");
    cookie.setHttpOnly(true);
    cookie.setMaxAge(0);
    cookie.setPath(request.getContextPath().isBlank() ? "/" : request.getContextPath());
    response.addCookie(cookie);
  }
}