(function () {
  var DEMO_ACCOUNTS = {
    ADMIN: {
      email: "admin@eventflow.local",
      password: "Admin123!"
    },
    ORGANIZER: {
      email: "organizer@eventflow.local",
      password: "Organizer123!"
    },
    VOLUNTEER: {
      email: "volunteer@eventflow.local",
      password: "Volunteer123!"
    },
    STUDENT: {
      email: "student@eventflow.local",
      password: "Student123!"
    }
  };

  var body = document.body;
  var form = document.querySelector("[data-login-form]");
  var emailInput = document.querySelector("[data-login-email]");
  var passwordInput = document.querySelector("[data-login-password]");
  var submitButton = document.querySelector("[data-login-submit]");
  var emailError = document.querySelector("[data-email-error]");
  var passwordError = document.querySelector("[data-password-error]");
  var loginNotice = document.querySelector("[data-login-notice]");
  var globalFeedback = document.querySelector("[data-global-feedback]");
  var globalFeedbackTitle = document.querySelector("[data-global-feedback-title]");
  var globalFeedbackMessage = document.querySelector("[data-global-feedback-message]");
  var demoButtons = document.querySelectorAll("[data-demo-account]");
  var contextPath = body.getAttribute("data-context-path") || "";

  function resetFieldErrors() {
    if (emailError) {
      emailError.hidden = true;
      emailError.textContent = "";
    }

    if (passwordError) {
      passwordError.hidden = true;
      passwordError.textContent = "";
    }
  }

  function hideGlobalFeedback() {
    if (globalFeedback) {
      globalFeedback.hidden = true;
    }

    if (loginNotice) {
      loginNotice.hidden = true;
    }
  }

  function showGlobalFeedback(title, message) {
    if (!globalFeedback || !globalFeedbackTitle || !globalFeedbackMessage) {
      return;
    }

    globalFeedbackTitle.textContent = title;
    globalFeedbackMessage.textContent = message;
    globalFeedback.hidden = false;
  }

  function showFieldError(element, message) {
    if (!element) {
      return;
    }

    element.textContent = message;
    element.hidden = false;
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) {
      return;
    }

    submitButton.classList.toggle("is-loading", isSubmitting);
    submitButton.textContent = isSubmitting ? "Signing in..." : "Sign in";
  }

  function fillDemoAccount(role) {
    var account = DEMO_ACCOUNTS[role];

    if (!account || !emailInput || !passwordInput) {
      return;
    }

    emailInput.value = account.email;
    passwordInput.value = account.password;
    hideGlobalFeedback();
    resetFieldErrors();
    emailInput.focus();
  }

  demoButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      fillDemoAccount(button.getAttribute("data-demo-account"));
    });
  });

  if (!form || !emailInput || !passwordInput) {
    return;
  }

  form.addEventListener("submit", function (event) {
    hideGlobalFeedback();
    resetFieldErrors();

    var email = emailInput.value.trim().toLowerCase();
    var password = passwordInput.value;
    var hasError = false;

    if (!email) {
      showFieldError(emailError, "Email is required.");
      hasError = true;
    }

    if (!password) {
      showFieldError(passwordError, "Password is required.");
      hasError = true;
    }

    if (hasError) {
      event.preventDefault();
      return;
    }

    setSubmitting(true);
  });
    window.setTimeout(function () {
      var account = findDemoAccount(email);

      if (email === "locked@eventflow.demo") {
        setSubmitting(false);
        showGlobalFeedback("Account locked", "This preview account is intentionally locked to show the auth failure state.");
        return;
      }

      if (!account || account.password !== password) {
        setSubmitting(false);
        showGlobalFeedback("Invalid credentials", "Use a demo account or enter one of the mock credential pairs listed below.");
        return;
      }

      if (mockData) {
        mockData.storeSession({
          session: account.session,
          redirectPath: account.redirectPath
        });
      } else {
        sessionStorage.setItem("eventflowMockSession", JSON.stringify({
          session: account.session,
          redirectPath: account.redirectPath
        }));
      }

      window.location.href = contextPath + "/dashboard.jsp?role=" + encodeURIComponent(account.session.role);
    }, 420);
  });
})();