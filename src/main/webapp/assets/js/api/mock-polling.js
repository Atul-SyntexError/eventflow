(function () {
  function create(options) {
    var run = options.run;
    var intervalMs = options.intervalMs || 12000;
    var startImmediately = options.startImmediately !== false;
    var shouldRun = options.shouldRun || function () {
      return true;
    };
    var timerId = null;
    var active = false;
    var inFlight = false;

    async function tick(reason) {
      if (!active || inFlight || !shouldRun()) {
        return;
      }

      inFlight = true;

      try {
        await run({ reason: reason || "interval", triggeredAt: new Date().toISOString() });
      } finally {
        inFlight = false;
      }
    }

    function start() {
      if (active) {
        return;
      }

      active = true;

      if (startImmediately) {
        tick("start");
      }

      timerId = window.setInterval(function () {
        tick("interval");
      }, intervalMs);
    }

    function stop() {
      active = false;

      if (timerId) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    function refresh() {
      return tick("manual");
    }

    return {
      start: start,
      stop: stop,
      refresh: refresh,
      isRunning: function () {
        return active;
      }
    };
  }

  window.EventFlowMockPolling = {
    create: create
  };
})();