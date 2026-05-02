(function () {
  function wait(delayMs) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, delayMs);
    });
  }

  function isRetryableStatus(status) {
    return status >= 500 || status === 408 || status === 429;
  }

  function appendQuery(url, query) {
    if (!query) {
      return url;
    }

    Object.keys(query).forEach(function (key) {
      var value = query[key];
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.append(key, value);
    });

    return url;
  }

  function parsePayload(text) {
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  function create(options) {
    var contextPath = options && options.contextPath ? options.contextPath : "";
    var baseDelayMs = options && typeof options.baseDelayMs === "number" ? options.baseDelayMs : 0;
    var retryDelayMs = options && typeof options.retryDelayMs === "number" ? options.retryDelayMs : 180;

    async function request(config) {
      var method = (config.method || "GET").toUpperCase();
      var path = config.path || "/";
      var retries = typeof config.retries === "number" ? config.retries : 0;
      var attempt = 0;

      while (attempt <= retries) {
        if (attempt === 0 && baseDelayMs > 0) {
          await wait(baseDelayMs);
        } else if (attempt > 0 && config.delayOnRetry !== false) {
          await wait(retryDelayMs * attempt);
        }

        try {
          var url = appendQuery(new URL(contextPath + path, window.location.origin), config.query || null);
          var headers = {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest"
          };
          var requestOptions = {
            method: method,
            headers: headers,
            credentials: "same-origin"
          };

          if (config.body !== undefined && config.body !== null) {
            headers["Content-Type"] = "application/json";
            requestOptions.body = JSON.stringify(config.body);
          }

          var response = await window.fetch(url.toString(), requestOptions);
          var text = await response.text();
          var payload = parsePayload(text);
          var isApiEnvelope = payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "success");
          var errors = isApiEnvelope && Array.isArray(payload.errors) ? payload.errors : [];
          var ok = response.ok && (!isApiEnvelope || payload.success !== false);

          if (!ok && isRetryableStatus(response.status) && attempt < retries) {
            attempt += 1;
            continue;
          }

          return {
            ok: ok,
            status: response.status,
            data: isApiEnvelope ? payload.data : payload,
            errors: errors,
            errorCode: !ok && errors.length ? errors[0].code || null : null,
            message: isApiEnvelope ? payload.message : null,
            meta: {
              attempts: attempt + 1,
              contextPath: contextPath,
              path: path,
              method: method,
              retried: attempt > 0
            }
          };
        } catch (error) {
          if (attempt === retries) {
            return {
              ok: false,
              status: 0,
              data: null,
              errors: [],
              errorCode: "NETWORK_ERROR",
              message: "Network request failed.",
              meta: {
                attempts: attempt + 1,
                contextPath: contextPath,
                path: path,
                method: method,
                retried: attempt > 0
              }
            };
          }
        }

        attempt += 1;
      }

      return {
        ok: false,
        status: 500,
        data: null,
        errors: [],
        errorCode: "REQUEST_FAILED",
        message: "Request failed.",
        meta: {
          attempts: retries + 1,
          contextPath: contextPath,
          path: path,
          method: method,
          retried: retries > 0
        }
      };
    }

    return {
      request: request,
      get: function (path, config) {
        return request(Object.assign({}, config || {}, { method: "GET", path: path }));
      },
      post: function (path, body, config) {
        return request(Object.assign({}, config || {}, { method: "POST", path: path, body: body }));
      },
      put: function (path, body, config) {
        return request(Object.assign({}, config || {}, { method: "PUT", path: path, body: body }));
      },
      delete: function (path, config) {
        return request(Object.assign({}, config || {}, { method: "DELETE", path: path }));
      }
    };
  }

  window.EventFlowApi = {
    create: create
  };
})();