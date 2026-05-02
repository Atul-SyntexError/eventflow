<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Not Found</title>
    <%@ include file="../partials/public-head.jspf" %>
  </head>
  <body class="public-page">
    <main class="public-shell state-layout">
      <section class="state-card">
        <span class="state-code">404</span>
        <div class="stack-sm">
          <p class="page-eyebrow">Route not found</p>
          <h1 class="public-title" style="font-size: clamp(2rem, 3vw, 3rem);">The route you requested does not exist in the current preview.</h1>
          <p class="public-copy">This page is the shared fallback for missing routes and broken navigation during the frontend phase.</p>
        </div>
        <div class="retry-panel">
          <strong>Next step</strong>
          <span>Return to the login preview or the dashboard preview to continue validating the shared application flow.</span>
          <div class="button-row">
            <a class="button button-primary" href="${pageContext.request.contextPath}/login">Go to login</a>
            <a class="button button-secondary" href="${pageContext.request.contextPath}/dashboard">Go to dashboard</a>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>