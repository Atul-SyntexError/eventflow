package com.eventflow.controller;

import com.eventflow.dto.RoleSessionDto;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.RolePermissionRegistry;
import com.eventflow.utils.SessionContextHelper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;

@WebServlet("/dashboard")
public final class DashboardController extends HttpServlet {

  private static final String BRIDGE_VIEW = "/WEB-INF/views/public/dashboard-bridge.jsp";

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final RolePermissionRegistry rolePermissionRegistry = AppComponentFactory.rolePermissionRegistry();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);

    if (currentUser.isEmpty()) {
      response.sendRedirect(request.getContextPath() + "/login");
      return;
    }

    RoleSessionDto roleSession = currentUser.get();
    request.setAttribute("redirectPath", rolePermissionRegistry.defaultPathFor(roleSession.role()));
    request.setAttribute("userId", roleSession.userId());
    request.setAttribute("fullName", roleSession.fullName());
    request.setAttribute("email", roleSession.email());
    request.setAttribute("role", roleSession.role().name());
    request.setAttribute("permissionsCsv", String.join("|", roleSession.permissions()));
    request.setAttribute("unreadNotificationCount", roleSession.unreadNotificationCount());
    request.setAttribute("lastLoginAt", roleSession.lastLoginAt());
    request.getRequestDispatcher(BRIDGE_VIEW).forward(request, response);
  }
}