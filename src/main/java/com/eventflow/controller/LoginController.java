package com.eventflow.controller;

import com.eventflow.dto.FieldErrorDto;
import com.eventflow.dto.LoginRequestDto;
import com.eventflow.dto.RoleSessionDto;
import com.eventflow.service.AuthService;
import com.eventflow.utils.AppComponentFactory;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.utils.SessionContextHelper;
import com.eventflow.validation.ValidationException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebServlet("/login")
public final class LoginController extends HttpServlet {

  private static final Logger LOGGER = LoggerFactory.getLogger(LoginController.class);
  private static final String LOGIN_VIEW = "/WEB-INF/views/public/login.jsp";

  private final SessionContextHelper sessionContextHelper = AppComponentFactory.sessionContextHelper();

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    disableCaching(response);

    if (sessionContextHelper.hasAuthenticatedUser(request)) {
      response.sendRedirect(request.getContextPath() + "/dashboard");
      return;
    }

    if ("1".equals(request.getParameter("loggedOut"))) {
      request.setAttribute("loginNoticeTitle", "Signed out");
      request.setAttribute("loginNoticeMessage", "Your session has been cleared.");
    }

    forward(request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    disableCaching(response);

    String email = request.getParameter("email");
    request.setAttribute("formEmail", email);

    try {
      AuthService authService = AppComponentFactory.authService(getServletContext());
      RoleSessionDto roleSession = authService.authenticate(new LoginRequestDto(email, request.getParameter("password")));
      sessionContextHelper.store(request, roleSession);
      response.sendRedirect(request.getContextPath() + "/dashboard");
    } catch (ValidationException exception) {
      response.setStatus(422);
      applyFieldErrors(request, exception.getErrors());
      forward(request, response);
    } catch (ApplicationException exception) {
      response.setStatus(exception.getStatusCode());
      request.setAttribute(
          "loginGlobalErrorTitle",
          exception.getErrorCode() == ErrorCode.INVALID_CREDENTIALS ? "Invalid credentials" : "Authentication failed");
      request.setAttribute("loginGlobalErrorMessage", exception.getMessage());
      forward(request, response);
    } catch (RuntimeException exception) {
      LOGGER.error("Unexpected login failure", exception);
      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      request.setAttribute("loginGlobalErrorTitle", "Sign in unavailable");
      request.setAttribute("loginGlobalErrorMessage", "The application could not complete sign in. Try again.");
      forward(request, response);
    }
  }

  private void applyFieldErrors(HttpServletRequest request, List<FieldErrorDto> errors) {
    for (FieldErrorDto error : errors) {
      if ("email".equals(error.field())) {
        request.setAttribute("emailError", error.message());
        continue;
      }

      if ("password".equals(error.field())) {
        request.setAttribute("passwordError", error.message());
        continue;
      }

      request.setAttribute("loginGlobalErrorTitle", "Authentication failed");
      request.setAttribute("loginGlobalErrorMessage", error.message());
    }
  }

  private void disableCaching(HttpServletResponse response) {
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    response.setHeader("Pragma", "no-cache");
  }

  private void forward(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    request.getRequestDispatcher(LOGIN_VIEW).forward(request, response);
  }
}