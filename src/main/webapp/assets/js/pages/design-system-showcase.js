(function () {
  var body = document.body;
  var appShell = document.querySelector(".app-shell");
  var dialog = document.querySelector("[data-demo-dialog]");
  var dialogPanel = document.querySelector("[data-dialog-panel]");
  var initialFocusTarget = document.querySelector("[data-dialog-initial-focus]");
  var openDialog = document.querySelector("[data-open-dialog]");
  var closeDialogButtons = document.querySelectorAll("[data-close-dialog]");
  var toastTrigger = document.querySelector("[data-show-toast]");
  var toastStack = document.querySelector("[data-toast-stack]");
  var lastFocusedElement = null;

  function getFocusableElements() {
    if (!dialog) {
      return [];
    }

    return Array.prototype.slice.call(
      dialog.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function closeDialog() {
    if (!dialog) {
      return;
    }

    dialog.hidden = true;

    if (appShell) {
      appShell.removeAttribute("aria-hidden");
    }

    body.classList.remove("modal-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function openDialogPanel() {
    if (!dialog) {
      return;
    }

    lastFocusedElement = document.activeElement;
    dialog.hidden = false;

    if (appShell) {
      appShell.setAttribute("aria-hidden", "true");
    }

    body.classList.add("modal-open");

    if (initialFocusTarget) {
      initialFocusTarget.focus();
      return;
    }

    if (dialogPanel) {
      dialogPanel.focus();
    }
  }

  function showToast() {
    if (!toastStack) {
      return;
    }

    var toast = document.createElement("div");
    toast.className = "toast toast-success";
    toast.innerHTML = "<strong>Preview event</strong><div class=\"text-muted\">Shared toast feedback is ready for AJAX flows and notifications.</div>";
    toastStack.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 3200);
  }

  if (openDialog) {
    openDialog.addEventListener("click", openDialogPanel);
  }

  closeDialogButtons.forEach(function (button) {
    button.addEventListener("click", closeDialog);
  });

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        closeDialog();
      }
    });
  }

  if (toastTrigger) {
    toastTrigger.addEventListener("click", showToast);
  }

  document.addEventListener("keydown", function (event) {
    if (dialog && !dialog.hidden && event.key === "Escape") {
      closeDialog();
      return;
    }

    if (!dialog || dialog.hidden || event.key !== "Tab") {
      return;
    }

    var focusableElements = getFocusableElements();

    if (!focusableElements.length) {
      event.preventDefault();

      if (dialogPanel) {
        dialogPanel.focus();
      }

      return;
    }

    var firstFocusable = focusableElements[0];
    var lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  });
})();