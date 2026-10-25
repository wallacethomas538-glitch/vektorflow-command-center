/* VektorFlow Command Center — API layer.
 * Thin fetch wrapper over the real VektorFlow backend (see vf-config.js).
 * No mock data, no fallback data, no localStorage fake DB: failures are
 * surfaced to the UI as honest errors via VfApiError.
 */
(function () {
  "use strict";

  var BASE = (typeof VEKTORFLOW_API_URL !== "undefined" ? VEKTORFLOW_API_URL : "").replace(/\/+$/, "");
  var DEFAULT_TIMEOUT_MS = 30000;

  function VfApiError(message, opts) {
    this.name = "VfApiError";
    this.message = message;
    opts = opts || {};
    this.kind = opts.kind || "unknown"; // network | timeout | http | api
    this.status = opts.status || 0;
  }
  VfApiError.prototype = Object.create(Error.prototype);
  VfApiError.prototype.constructor = VfApiError;

  function friendlyHttpMessage(status, detail) {
    if (status === 404) return "Not found on the backend (HTTP 404). " + detail;
    if (status === 422) return "The backend rejected the request (HTTP 422). " + detail;
    if (status === 502) return "The agent failed to execute (HTTP 502). " + detail;
    if (status >= 500) return "The backend errored (HTTP " + status + "). " + detail;
    return "HTTP " + status + ". " + detail;
  }

  async function request(path, options) {
    options = options || {};
    var timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;
    var url = BASE + path;
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    var res;
    try {
      res = await fetch(url, {
        method: options.method || "GET",
        headers: Object.assign({ "Content-Type": "application/json" }, options.headers || {}),
        body: options.body,
        signal: controller.signal
      });
    } catch (e) {
      clearTimeout(timer);
      if (e && e.name === "AbortError") {
        throw new VfApiError(
          "Request timed out after " + Math.round(timeoutMs / 1000) + "s. The backend may be waking from sleep — retry in a moment.",
          { kind: "timeout" }
        );
      }
      throw new VfApiError("Couldn't reach the backend: " + (e && e.message ? e.message : e), { kind: "network" });
    }
    clearTimeout(timer);

    var data = null;
    try { data = await res.json(); } catch (e) { data = null; }

    if (!res.ok) {
      var detail = (data && (data.detail || data.message)) || "";
      throw new VfApiError(friendlyHttpMessage(res.status, detail), { kind: "http", status: res.status });
    }
    return data;
  }

  function vfGet(path, opts) {
    return request(path, Object.assign({}, opts, { method: "GET", body: undefined }));
  }

  function vfPost(path, body, opts) {
    return request(path, Object.assign({}, opts, {
      method: "POST",
      body: JSON.stringify(body || {})
    }));
  }

  function vfEscapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = (s === null || s === undefined) ? "" : String(s);
    return div.innerHTML;
  }

  function vfNowTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // The agent chat endpoint may return a string or a dict — render either.
  function vfResultText(result) {
    if (typeof result === "string") return result;
    try { return JSON.stringify(result, null, 2); }
    catch (e) { return String(result); }
  }

  function vfQueryParam(name) {
    try { return new URLSearchParams(window.location.search).get(name); }
    catch (e) { return null; }
  }

  window.VF = {
    BASE: BASE,
    vfGet: vfGet,
    vfPost: vfPost,
    VfApiError: VfApiError,
    vfEscapeHtml: vfEscapeHtml,
    vfNowTime: vfNowTime,
    vfResultText: vfResultText,
    vfQueryParam: vfQueryParam
  };
})();
