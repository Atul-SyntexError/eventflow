(function () {
  function wait(delayMs) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, delayMs);
    });
  }

  function isRetryableStatus(status) {
    return status >= 500 || status === 408 || status === 429;
  }

  function create(options) {
    var contextPath = options && options.contextPath ? options.contextPath : "";
    var fixtureResolver = window.EventFlowMockApiFixtures || null;
    var baseDelayMs = options && typeof options.baseDelayMs === "number" ? options.baseDelayMs : 90;
    var retryDelayMs = options && typeof options.retryDelayMs === "number" ? options.retryDelayMs : 180;

    async function request(config) {
      var method = (config.method || "GET").toUpperCase();
      var path = config.path || "/";
      var retries = typeof config.retries === "number" ? config.retries : 0;
      var attempt = 0;
      var lastResponse = null;

      if (!fixtureResolver) {
        return {
          ok: false,
          status: 503,
          data: null,
          errorCode: "FIXTURE_RESOLVER_UNAVAILABLE",
          message: "Mock API fixtures are unavailable.",
          meta: {
            attempts: 0,
            generatedAt: new Date().toISOString(),
            contextPath: contextPath,
            path: path,
            method: method,
            retried: false
          }
        };
      }

      while (attempt <= retries) {
        if (attempt === 0 || config.delayOnRetry !== false) {
          await wait(attempt === 0 ? baseDelayMs : retryDelayMs * attempt);
        }

        lastResponse = fixtureResolver.resolve({
          method: method,
          path: path,
          query: config.query || {},
          body: config.body || null,
          contextPath: contextPath
        });

        if (lastResponse.ok || !isRetryableStatus(lastResponse.status) || attempt === retries) {
          return {
            ok: lastResponse.ok,
            status: lastResponse.status,
            data: lastResponse.ok ? lastResponse.data : null,
            errorCode: lastResponse.ok ? null : lastResponse.errorCode,
            message: lastResponse.message || null,
            responseDto: lastResponse.responseDto || null,
            meta: {
              attempts: attempt + 1,
              generatedAt: new Date().toISOString(),
              contextPath: contextPath,
              path: path,
              method: method,
              retried: attempt > 0,
              endpoint: lastResponse.endpoint || path
            }
          };
        }

        attempt += 1;
      }

      return {
        ok: false,
        status: 500,
        data: null,
        errorCode: "MOCK_API_EXHAUSTED",
        message: "Mock API retries were exhausted.",
        meta: {
          attempts: retries + 1,
          generatedAt: new Date().toISOString(),
          contextPath: contextPath,
          path: path,
          method: method,
          retried: retries > 0
        }
      };
    }

    function get(path, config) {
      return request(Object.assign({}, config || {}, { method: "GET", path: path }));
    }

    function post(path, body, config) {
      return request(Object.assign({}, config || {}, { method: "POST", path: path, body: body }));
    }

    function put(path, body, config) {
      return request(Object.assign({}, config || {}, { method: "PUT", path: path, body: body }));
    }

    function patch(path, body, config) {
      return request(Object.assign({}, config || {}, { method: "PATCH", path: path, body: body }));
    }

    function destroy(path, config) {
      return request(Object.assign({}, config || {}, { method: "DELETE", path: path }));
    }

    return {
      request: request,
      get: get,
      post: post,
      put: put,
      patch: patch,
      delete: destroy
    };
  }

  window.EventFlowMockApi = {
    create: create
  };
})();