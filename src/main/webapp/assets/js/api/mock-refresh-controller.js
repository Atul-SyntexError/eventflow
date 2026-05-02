(function () {
  function create(options) {
    var loader = options.loader;
    var onData = options.onData;
    var onError = options.onError || function () {};
    var shouldPoll = options.shouldPoll || function () {
      return true;
    };
    var intervalMs = options.intervalMs || 12000;
    var polling = window.EventFlowMockPolling
      ? window.EventFlowMockPolling.create({
          intervalMs: intervalMs,
          shouldRun: shouldPoll,
          run: function (context) {
            return load(context.reason || "poll");
          }
        })
      : null;

    async function load(reason) {
      var response = await loader(reason || "initial");

      if (response && response.ok) {
        onData(response.data, response, reason || "initial");
        return response;
      }

      onError(response, reason || "initial");
      return response;
    }

    function start() {
      if (polling) {
        polling.start();
      }
    }

    function stop() {
      if (polling) {
        polling.stop();
      }
    }

    function refresh() {
      if (polling) {
        return polling.refresh();
      }

      return load("manual");
    }

    return {
      load: load,
      start: start,
      stop: stop,
      refresh: refresh
    };
  }

  window.EventFlowMockRefreshController = {
    create: create
  };
})();