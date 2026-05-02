<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>EventFlow Redirecting</title>
    <%@ include file="../partials/public-head.jspf" %>
  </head>
  <body
    class="public-page"
    data-context-path="${pageContext.request.contextPath}"
    data-redirect-path="<c:out value='${requestScope.redirectPath}' />"
    data-user-id="<c:out value='${requestScope.userId}' />"
    data-full-name="<c:out value='${requestScope.fullName}' />"
    data-email="<c:out value='${requestScope.email}' />"
    data-role="<c:out value='${requestScope.role}' />"
    data-permissions="<c:out value='${requestScope.permissionsCsv}' />"
    data-unread-count="<c:out value='${requestScope.unreadNotificationCount}' />"
    data-last-login="<c:out value='${requestScope.lastLoginAt}' />">
    <main class="public-shell state-layout">
      <section class="state-card">
        <span class="state-code">RD</span>
        <div class="stack-sm">
          <p class="page-eyebrow">Routing session</p>
          <h1 class="public-title" style="font-size: clamp(2rem, 3vw, 3rem);">Preparing your workspace.</h1>
          <p class="public-copy">The authenticated session is being bridged into the current role preview shell.</p>
        </div>
        <div class="retry-panel">
          <strong>Continue manually</strong>
          <span>If redirecting stalls, continue to the resolved role workspace.</span>
          <div class="button-row">
            <a class="button button-primary" href="${pageContext.request.contextPath}${requestScope.redirectPath}">Open workspace</a>
          </div>
        </div>
      </section>
    </main>

    <script>
      (function () {
        var body = document.body;
        var contextPath = body.getAttribute("data-context-path") || "";
        var redirectPath = body.getAttribute("data-redirect-path") || "/dashboard";
        var permissions = body.getAttribute("data-permissions");

        sessionStorage.setItem("eventflowMockSession", JSON.stringify({
          session: {
            userId: Number(body.getAttribute("data-user-id") || "0"),
            fullName: body.getAttribute("data-full-name") || "",
            email: body.getAttribute("data-email") || "",
            role: body.getAttribute("data-role") || "",
            permissions: permissions ? permissions.split("|") : [],
            unreadNotificationCount: Number(body.getAttribute("data-unread-count") || "0"),
            lastLoginAt: body.getAttribute("data-last-login") || ""
          },
          redirectPath: redirectPath
        }));

        window.location.replace(contextPath + redirectPath);
      })();
    </script>
  </body>
</html>