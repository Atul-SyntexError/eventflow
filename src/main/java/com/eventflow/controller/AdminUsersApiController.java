package com.eventflow.controller;

import com.eventflow.dto.ApiResponse;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.dto.UserDetailDto;
import com.eventflow.dto.UserFormRequestDto;
import com.eventflow.dto.UserSummaryDto;
import com.eventflow.service.AdminUserService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
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
import java.util.List;
import java.util.Optional;

@WebServlet(urlPatterns = {"/api/admin/users", "/api/admin/users/*"})
public final class AdminUsersApiController extends HttpServlet {

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();
  private final JsonResponseWriter jsonResponseWriter = AppComponentFactory.jsonResponseWriter();
  private final JsonPayloadMapper jsonPayloadMapper = AppComponentFactory.jsonPayloadMapper();
  private final ErrorResponseMapper errorResponseMapper = new ErrorResponseMapper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminUserService adminUserService = AppComponentFactory.adminUserService(getServletContext());
    try {
      String pathInfo = request.getPathInfo();
      if (pathInfo == null || "/".equals(pathInfo)) {
        List<UserSummaryDto> users = adminUserService.listUsers();
        jsonResponseWriter.writeApiResponse(
            response,
            HttpServletResponse.SC_OK,
            ApiResponse.success("Users loaded successfully.", users));
        return;
      }

      long userId = parseUserId(pathInfo);
      UserDetailDto userDetail = adminUserService.getUserDetail(userId);
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("User loaded successfully.", userDetail));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminUserService adminUserService = AppComponentFactory.adminUserService(getServletContext());
    try {
      requireCollectionPath(request.getPathInfo());
      UserFormRequestDto formRequest = requireBody(request);
      RoleSessionDto actor = requireActor(request);
      UserDetailDto created = adminUserService.createUser(formRequest, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_CREATED,
          ApiResponse.success("User created successfully.", created));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminUserService adminUserService = AppComponentFactory.adminUserService(getServletContext());
    try {
      long userId = parseUserId(request.getPathInfo());
      UserFormRequestDto formRequest = requireBody(request);
      RoleSessionDto actor = requireActor(request);
      UserDetailDto updated = adminUserService.updateUser(userId, formRequest, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("User updated successfully.", updated));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
    AdminUserService adminUserService = AppComponentFactory.adminUserService(getServletContext());
    try {
      long userId = parseUserId(request.getPathInfo());
      RoleSessionDto actor = requireActor(request);
      adminUserService.deleteUser(userId, actor.userId());
      jsonResponseWriter.writeApiResponse(
          response,
          HttpServletResponse.SC_OK,
          ApiResponse.success("User deleted successfully.", null));
    } catch (RuntimeException exception) {
      writeFailure(response, exception);
    }
  }

  private UserFormRequestDto requireBody(HttpServletRequest request) {
    UserFormRequestDto requestBody = jsonPayloadMapper.read(request, UserFormRequestDto.class);
    if (requestBody != null) {
      return requestBody;
    }

    throw new ApplicationException(
        "Request body is required.",
        400,
        null,
        false,
        null);
  }

  private void requireCollectionPath(String pathInfo) {
    if (pathInfo == null || "/".equals(pathInfo)) {
      return;
    }
    throw new ApplicationException("User route was not found.", 404, null, false, null);
  }

  private RoleSessionDto requireActor(HttpServletRequest request) {
    Optional<RoleSessionDto> currentUser = sessionContextHelper.getCurrentUser(request);
    return currentUser.orElseThrow(() ->
        new ApplicationException("Authentication required.", 401, null, false, null));
  }

  private long parseUserId(String pathInfo) {
    if (pathInfo == null) {
      throw new ApplicationException("User route was not found.", 404, null, false, null);
    }

    String normalized = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
    if (normalized.endsWith("/")) {
      normalized = normalized.substring(0, normalized.length() - 1);
    }

    if (normalized.isEmpty() || normalized.contains("/")) {
      throw new ApplicationException("User route was not found.", 404, null, false, null);
    }

    try {
      return Long.parseLong(normalized);
    } catch (NumberFormatException exception) {
      throw new ApplicationException("User id is invalid.", 400, null, false, exception);
    }
  }

  private void writeFailure(HttpServletResponse response, RuntimeException exception) throws IOException {
    int status = resolveStatus(exception);
    jsonResponseWriter.writeApiResponse(response, status, errorResponseMapper.toResponse(exception));
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