(function () {
  function create(options) {
    var shell = options.shell;
    var buttons = shell ? shell.querySelectorAll("[data-preview-state-button]") : [];
    var label = shell ? shell.querySelector("[data-preview-state-label]") : null;
    var copy = shell ? shell.querySelector("[data-preview-state-copy]") : null;
    var panel = shell ? shell.querySelector("[data-preview-state-panel]") : null;
    var panelTitle = shell ? shell.querySelector("[data-preview-state-panel-title]") : null;
    var panelMessage = shell ? shell.querySelector("[data-preview-state-panel-message]") : null;
    var resetButton = shell ? shell.querySelector("[data-preview-state-reset]") : null;
    var currentState = shell ? shell.getAttribute("data-preview-state-default") || "ready" : "ready";
    var stateCopy = {
      ready: {
        label: shell ? shell.getAttribute("data-preview-state-ready-label") || "Ready" : "Ready",
        copy: shell ? shell.getAttribute("data-preview-state-ready-copy") || "Showing active mock data." : "Showing active mock data."
      },
      loading: {
        label: shell ? shell.getAttribute("data-preview-state-loading-label") || "Loading" : "Loading",
        copy: shell ? shell.getAttribute("data-preview-state-loading-copy") || "Review skeleton placeholders before wiring the backend." : "Review skeleton placeholders before wiring the backend."
      },
      empty: {
        label: shell ? shell.getAttribute("data-preview-state-empty-label") || "Empty" : "Empty",
        copy: shell ? shell.getAttribute("data-preview-state-empty-copy") || "Review the no-data path before wiring live payloads." : "Review the no-data path before wiring live payloads."
      },
      error: {
        label: shell ? shell.getAttribute("data-preview-state-error-label") || "Error" : "Error",
        copy: shell ? shell.getAttribute("data-preview-state-error-copy") || "Review failure and retry copy before wiring live payloads." : "Review failure and retry copy before wiring live payloads."
      }
    };

    function syncStateUi() {
      if (label) {
        label.textContent = stateCopy[currentState].label;
      }

      if (copy) {
        copy.textContent = stateCopy[currentState].copy;
      }

      Array.prototype.forEach.call(buttons, function (button) {
        var isActive = button.getAttribute("data-state") === currentState;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    function setState(nextState) {
      if (!stateCopy[nextState]) {
        return;
      }

      currentState = nextState;
      syncStateUi();

      if (options.onChange) {
        options.onChange(nextState);
      }
    }

    function setPanel(copyBlock) {
      if (!panel) {
        return;
      }

      if (!copyBlock) {
        panel.hidden = true;
        return;
      }

      panel.hidden = false;

      if (panelTitle && copyBlock.title) {
        panelTitle.textContent = copyBlock.title;
      }

      if (panelMessage && copyBlock.message) {
        panelMessage.textContent = copyBlock.message;
      }
    }

    Array.prototype.forEach.call(buttons, function (button) {
      button.addEventListener("click", function () {
        setState(button.getAttribute("data-state"));
      });
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        setState("ready");
      });
    }

    syncStateUi();

    return {
      getState: function () {
        return currentState;
      },
      setState: setState,
      setPanel: setPanel
    };
  }

  window.EventFlowMockPreviewState = {
    create: create
  };
})();