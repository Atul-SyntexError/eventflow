<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Unauthorized</title>
    <%@ include file="../partials/public-head.jspf" %>
  </head>
  <body class="public-page">
    <main class="public-shell state-layout">
      <section class="state-card">
        <span class="state-code">403</span>
        <div class="stack-sm">
          <p class="page-eyebrow">Access denied</p>
          <h1 class="public-title" style="font-size: clamp(2rem, 3vw, 3rem);">That route is outside this role’s permission boundary.</h1>
          <p class="public-copy">This state will be used when a session is valid but the current user is not allowed to reach the requested page or action.</p>
        </div>
        <div class="state-action-row">
          <div class="alert alert-warning">
            <strong>Why you are seeing this</strong>
            <span>The authorization filter should keep protected routes isolated per role, and the UI should guide users back to the correct workspace.</span>
          </div>
          <div class="button-row">
            <a class="button button-primary" href="${pageContext.request.contextPath}/login">Return to login</a>
            <a class="button button-secondary" href="${pageContext.request.contextPath}/dashboard">Open dashboard</a>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>