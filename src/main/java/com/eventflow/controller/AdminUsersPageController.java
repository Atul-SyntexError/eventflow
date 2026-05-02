package com.eventflow.controller;

import com.eventflow.dto.UserDetailDto;
import com.eventflow.dto.UserFormRequestDto;
import com.eventflow.dto.UserSummaryDto;
import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.RoleType;
import com.eventflow.service.AdminUserService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.JsonPayloadMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@WebServlet(urlPatterns = {"/admin/users", "/admin/users/*"})
public final class AdminUsersPageController extends HttpServlet {

  private static final Pattern EDIT_PATH_PATTERN = Pattern.compile("^/([0-9]+)/edit/?$");
  private static final String VIEW_PATH = "/WEB-INF/views/admin/users.jsp";

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    String pathInfo = request.getPathInfo();
    String initialMode = "list";
    String selectedUserId = null;

    if (pathInfo == null || "/".equals(pathInfo)) {
      initialMode = "list";
    } else if ("/new".equals(pathInfo) || "/new/".equals(pathInfo)) {
      initialMode = "create";
    } else {
      Matcher matcher = EDIT_PATH_PATTERN.matcher(pathInfo);
      if (!matcher.matches()) {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      initialMode = "edit";
      selectedUserId = matcher.group(1);
    }

    AdminUserService adminUserService = AppComponentFactory.adminUserService(getServletContext());
      JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
      List<UserSummaryDto> users = adminUserService.listUsers();
      List<UserDetailDto> details = users.stream()
        .map(user -> adminUserService.getUserDetail(user.userId()))
        .toList();
      List<String> skillCatalog = adminUserService.listSkillCatalog();

    request.setAttribute("userInitialMode", initialMode);
    request.setAttribute("userSelectedId", selectedUserId);
      request.setAttribute("userSkillCatalog", String.join("|", skillCatalog));
      request.setAttribute(
        "userManagementBootstrapJson",
        jsonPayloadMapper.write(buildBootstrapDataset(users, details, skillCatalog)));
    request.getRequestDispatcher(VIEW_PATH).forward(request, response);
  }

      private Map<String, Object> buildBootstrapDataset(
        List<UserSummaryDto> users,
        List<UserDetailDto> details,
        List<String> skillCatalog) {
      Map<String, Object> dataset = new LinkedHashMap<>();
      dataset.put("summary", buildSummary(users));
      dataset.put(
        "filterOptions",
        Map.of(
          "roles", List.of("ALL", "ADMIN", "ORGANIZER", "VOLUNTEER", "STUDENT"),
          "availability", List.of("ALL", "AVAILABLE", "LIMITED", "UNAVAILABLE"),
          "activeState", List.of("ALL", "ACTIVE", "INACTIVE")));
      dataset.put("skillCatalog", skillCatalog);
      dataset.put("users", users);
      dataset.put("details", details);
      dataset.put(
        "createTemplate",
        new UserFormRequestDto(
          "",
          "",
          "",
          "",
          RoleType.VOLUNTEER,
          true,
          AvailabilityStatus.AVAILABLE,
          skillCatalog.isEmpty() ? List.of() : List.of(skillCatalog.get(0))));
      return dataset;
      }

      private Map<String, Object> buildSummary(List<UserSummaryDto> users) {
      long activeUsers = users.stream().filter(UserSummaryDto::active).count();
      long availableVolunteers = users.stream()
        .filter(user -> user.active() && user.role() == RoleType.VOLUNTEER && user.availabilityStatus() == AvailabilityStatus.AVAILABLE)
        .count();
      long organizers = users.stream().filter(user -> user.role() == RoleType.ORGANIZER).count();

      return Map.of(
        "totalUsers", users.size(),
        "activeUsers", activeUsers,
        "availableVolunteers", availableVolunteers,
        "organizers", organizers);
      }
}