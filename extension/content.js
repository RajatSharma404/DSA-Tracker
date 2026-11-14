/*
 * DSA Pro Live Sync — isolated-world content script.
 *
 * On DSA Tracker pages: bridges DOM CustomEvents from the web app to the
 * background service worker (request/response with requestId).
 * On LeetCode pages: relays verdicts captured by leetcode-hook.js to the
 * background worker and shows a small confirmation toast.
 */
const APP_SOURCE = "DSA_TRACKER_APP";
const EXT_SOURCE = "DSA_TRACKER_EXTENSION";
const HOOK_SOURCE = "DSA_TRACKER_LC_HOOK";
const REQUEST_EVENT = "DSA_TRACKER_EXTENSION_REQUEST";
const REQUEST_DOM_EVENT = "DSA_TRACKER_EXTENSION_REQUEST_DOM";
const RESPONSE_DOM_EVENT = "DSA_TRACKER_EXTENSION_RESPONSE_DOM";
const READY_DOM_EVENT = "DSA_TRACKER_EXTENSION_READY";
const ALLOWED_APP_ACTIONS = new Set([
  "PING",
  "PAIR",
  "SUBMIT_TO_LEETCODE",
  "FETCH_LEETCODE_SNAPSHOT",
]);

const isLeetCode = /(^|\.)leetcode\.com$/.test(window.location.hostname);
const inFlightRequestIds = new Set();

const safeRuntimeSendMessage = (message, callback) => {
  try {
    if (!chrome?.runtime?.id) {
      callback({
        ok: false,
        error: "Extension was updated or reloaded. Refresh this page.",
      });
      return;
    }
    chrome.runtime.sendMessage(message, (response) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        callback({ ok: false, error: lastError.message });
        return;
      }
      callback(response || { ok: false, error: "Empty response from extension" });
    });
  } catch (error) {
    callback({
      ok: false,
      error: error?.message || "Failed to reach extension background worker",
    });
  }
};

/** Event details cross JS worlds as JSON strings (objects can arrive as null). */
const readDetail = (detail) => {
  if (typeof detail !== "string") return detail || {};
  try {
    return JSON.parse(detail);
  } catch {
    return {};
  }
};

const respondToApp = (requestId, response) => {
  document.dispatchEvent(
    new CustomEvent(RESPONSE_DOM_EVENT, {
      detail: JSON.stringify({
        source: EXT_SOURCE,
        requestId,
        ok: Boolean(response?.ok),
        payload: response?.payload ?? null,
        error: response?.ok ? null : response?.error || "Request failed",
      }),
    }),
  );
};

const forwardAppRequest = (detail) => {
  const { requestId, action, payload } = detail || {};
  if (typeof requestId !== "string" || !requestId) return;
  if (!ALLOWED_APP_ACTIONS.has(action)) {
    respondToApp(requestId, { ok: false, error: `Unsupported action: ${action}` });
    return;
  }
  if (inFlightRequestIds.has(requestId)) return;
  inFlightRequestIds.add(requestId);

  safeRuntimeSendMessage(
    { type: action, payload: payload && typeof payload === "object" ? payload : {} },
    (response) => {
      inFlightRequestIds.delete(requestId);
      respondToApp(requestId, response);
    },
  );
};

if (!isLeetCode) {
  // ---------------- DSA Tracker web app bridge ----------------
  document.addEventListener(REQUEST_DOM_EVENT, (event) => {
    const detail = readDetail(event.detail);
    if (detail.source !== APP_SOURCE || detail.type !== REQUEST_EVENT) return;
    forwardAppRequest(detail);
  });

  // Let the app know the bridge is live without waiting for a ping timeout.
  const announce = () =>
    document.dispatchEvent(
      new CustomEvent(READY_DOM_EVENT, {
        detail: JSON.stringify({ source: EXT_SOURCE, version: chrome.runtime.getManifest().version }),
      }),
    );
  announce();
  document.addEventListener("DOMContentLoaded", announce, { once: true });
  document.documentElement.setAttribute(
    "data-dsa-extension",
    chrome.runtime.getManifest().version,
  );
} else {
  // ---------------- LeetCode verdict relay ----------------
  const showToast = (text, tone = "ok") => {
    try {
      const el = document.createElement("div");
      el.textContent = text;
      el.style.cssText = [
        "position:fixed",
        "right:20px",
        "bottom:20px",
        "z-index:2147483647",
        "padding:10px 14px",
        "border-radius:12px",
        "font:600 13px/1.3 system-ui,-apple-system,sans-serif",
        "color:#fff",
        `background:${tone === "ok" ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#b45309,#f59e0b)"}`,
        "box-shadow:0 10px 30px rgba(0,0,0,.35)",
        "opacity:0",
        "transform:translateY(8px)",
        "transition:opacity .25s ease,transform .25s ease",
      ].join(";");
      (document.body || document.documentElement).appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
      setTimeout(() => {
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 300);
      }, 3800);
    } catch {
      // ignore
    }
  };

  // Record whether the user is signed in (replaces reading the session cookie).
  const reportSignIn = async () => {
    try {
      const csrf = (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || "";
      const res = await fetch("/graphql/", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json", "x-csrftoken": csrf },
        body: JSON.stringify({ query: "query{userStatus{isSignedIn}}" }),
      });
      const json = await res.json();
      const signedIn = Boolean(json?.data?.userStatus?.isSignedIn);
      safeRuntimeSendMessage({ type: "LC_SIGNED_IN", payload: { signedIn } }, () => {});
    } catch {
      // best effort
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reportSignIn, { once: true });
  } else {
    reportSignIn();
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.source !== HOOK_SOURCE || data.type !== "ACCEPTED") return;

    safeRuntimeSendMessage({ type: "REPORT_ACCEPTED", payload: data.data }, (response) => {
      if (response?.ok) {
        showToast(`✓ Synced "${data.data.title || data.data.slug}" to DSA Tracker`);
      } else if (response?.payload?.queued) {
        showToast("Accepted! Will sync to DSA Tracker when it's reachable.", "warn");
      } else if (response?.error) {
        showToast(`DSA Tracker sync: ${response.error}`, "warn");
      }
    });
  });
}
