<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Login</title>
    <%@ include file="../partials/public-head.jspf" %>
  </head>
  <body class="public-page" data-context-path="${pageContext.request.contextPath}">
    <main class="public-shell auth-layout">
      <section class="public-hero">
        <div class="stack-md">
          <h1 class="public-title">Welcome Back</h1>
          <p class="public-copy">
            Sign in to access your personalized event management dashboard.
          </p>
        </div>

        <div class="stack-md">

          <div class="demo-account-grid">
            <article class="demo-account">
              <p class="panel-title">Admin demo</p>
              <p class="text-muted">Redirects to the admin dashboard preview path.</p>
              <button type="button" class="button button-secondary" data-demo-account="ADMIN">Use admin account</button>
            </article>
            <article class="demo-account">
              <p class="panel-title">Organizer demo</p>
              <p class="text-muted">Redirects to task operations and live alerts.</p>
              <button type="button" class="button button-secondary" data-demo-account="ORGANIZER">Use organizer account</button>
            </article>
            <article class="demo-account">
              <p class="panel-title">Volunteer demo</p>
              <p class="text-muted">Redirects to assigned tasks and performance metrics.</p>
              <button type="button" class="button button-secondary" data-demo-account="VOLUNTEER">Use volunteer account</button>
            </article>
            <article class="demo-account">
              <p class="panel-title">Student demo</p>
              <p class="text-muted">Redirects to recommendations and registrations.</p>
              <button type="button" class="button button-secondary" data-demo-account="STUDENT">Use student account</button>
            </article>
          </div>
        </div>
      </section>

      <section class="auth-card">
        <div class="stack-sm">
          <p class="eyebrow">Sign in</p>
          <p class="panel-title">Enter your credentials to continue.</p>
        </div>

        <div class="alert alert-info" <c:if test="${empty requestScope.loginNoticeMessage}">hidden</c:if> data-login-notice>
          <strong><c:out value="${empty requestScope.loginNoticeTitle ? 'Signed out' : requestScope.loginNoticeTitle}" /></strong>
          <span><c:out value="${requestScope.loginNoticeMessage}" /></span>
        </div>

        <div class="global-feedback alert alert-danger" <c:if test="${empty requestScope.loginGlobalErrorMessage}">hidden</c:if> data-global-feedback>
          <strong data-global-feedback-title><c:out value="${empty requestScope.loginGlobalErrorTitle ? 'Authentication failed' : requestScope.loginGlobalErrorTitle}" /></strong>
          <span data-global-feedback-message><c:out value="${empty requestScope.loginGlobalErrorMessage ? 'Check your credentials and try again.' : requestScope.loginGlobalErrorMessage}" /></span>
        </div>

        <form class="auth-form-grid" action="${pageContext.request.contextPath}/login" method="post" data-login-form novalidate>
          <label class="field">
            <span class="field-label">Email</span>
            <input class="control" type="email" name="email" autocomplete="email" placeholder="name@eventflow.local" value="<c:out value='${requestScope.formEmail}' />" data-login-email />
            <span class="field-error" <c:if test="${empty requestScope.emailError}">hidden</c:if> data-email-error><c:out value="${requestScope.emailError}" /></span>
          </label>

          <label class="field">
            <span class="field-label">Password</span>
            <input class="control" type="password" name="password" autocomplete="current-password" placeholder="Enter your password" data-login-password />
            <span class="field-error" <c:if test="${empty requestScope.passwordError}">hidden</c:if> data-password-error><c:out value="${requestScope.passwordError}" /></span>
          </label>

          <label class="checkbox-line">
            <input type="checkbox" name="rememberDevice" />
            <span>Remember this device</span>
          </label>

          <div class="button-row">
            <button type="submit" class="button button-primary" data-login-submit>Sign in</button>
          </div>
        </form>

        <div class="retry-panel">
          <p class="panel-title">Seeded account credentials</p>
          <ul class="session-fact-list">
            <li class="session-fact"><span>Admin</span><span class="mono-copy">admin@eventflow.local / Admin123!</span></li>
            <li class="session-fact"><span>Organizer</span><span class="mono-copy">organizer@eventflow.local / Organizer123!</span></li>
            <li class="session-fact"><span>Volunteer</span><span class="mono-copy">volunteer@eventflow.local / Volunteer123!</span></li>
            <li class="session-fact"><span>Student</span><span class="mono-copy">student@eventflow.local / Student123!</span></li>
          </ul>
        </div>
      </section>
    </main>

    <script src="${pageContext.request.contextPath}/assets/js/pages/mock-auth.js"></script>
  </body>
</html>