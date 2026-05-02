<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Session Expired</title>
    <%@ include file="../partials/public-head.jspf" %>
  </head>
  <body class="public-page">
    <main class="public-shell state-layout">
      <section class="state-card">
        <span class="state-code">SE</span>
        <div class="stack-sm">
          <p class="page-eyebrow">Session expired</p>
          <h1 class="public-title" style="font-size: clamp(2rem, 3vw, 3rem);">Your session has expired and the page needs a safe re-entry point.</h1>
          <p class="public-copy">This state mirrors the Phase 0 contract for session timeout and gives users a clear path back into the application.</p>
        </div>
        <div class="retry-panel">
          <strong>Recovery path</strong>
          <span>Return to login and request a fresh session. AJAX flows should later use the same shared messaging and redirect behavior.</span>
          <div class="button-row">
            <a class="button button-primary" href="${pageContext.request.contextPath}/login">Sign in again</a>
            <a class="button button-ghost" href="${pageContext.request.contextPath}/error/403">Preview unauthorized state</a>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>