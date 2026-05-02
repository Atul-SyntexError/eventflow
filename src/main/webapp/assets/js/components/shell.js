(function () {
  var body = document.body;
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navClose = document.querySelector("[data-nav-close]");
  var sidebar = document.querySelector("[data-app-sidebar]");
  var firstNavLink = sidebar ? sidebar.querySelector("a, button") : null;
  var desktopMediaQuery = window.matchMedia("(min-width: 1025px)");
  var lastNavTrigger = null;

  function syncDesktopState(isDesktop) {
    if (!sidebar) {
      return;
    }

    sidebar.setAttribute("aria-hidden", isDesktop ? "false" : String(!body.classList.contains("nav-open")));

    if (isDesktop) {
      body.classList.remove("nav-open");

      if (navToggle) {
        navToggle.setAttribute("aria-expanded", "false");
      }
    }
  }

  function setOpenState(isOpen) {
    if (!sidebar || desktopMediaQuery.matches) {
      syncDesktopState(true);
      return;
    }

    body.classList.toggle("nav-open", isOpen);

    if (navToggle) {
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    sidebar.setAttribute("aria-hidden", isOpen ? "false" : "true");

    if (isOpen && firstNavLink) {
      firstNavLink.focus();
      return;
    }

    if (!isOpen && lastNavTrigger) {
      lastNavTrigger.focus();
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      lastNavTrigger = navToggle;
      setOpenState(!body.classList.contains("nav-open"));
    });
  }

  if (navClose) {
    navClose.addEventListener("click", function () {
      setOpenState(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setOpenState(false);
    }
  });

  if (desktopMediaQuery.addEventListener) {
    desktopMediaQuery.addEventListener("change", function (event) {
      syncDesktopState(event.matches);
    });
  } else if (desktopMediaQuery.addListener) {
    desktopMediaQuery.addListener(function (event) {
      syncDesktopState(event.matches);
    });
  }

  syncDesktopState(desktopMediaQuery.matches);
})();