const APP_SOURCE = "DSA_TRACKER_APP";
const EXT_SOURCE = "DSA_TRACKER_EXTENSION";
const REQUEST_EVENT = "DSA_TRACKER_EXTENSION_REQUEST";
const REQUEST_DOM_EVENT = "DSA_TRACKER_EXTENSION_REQUEST_DOM";
const RESPONSE_DOM_EVENT = "DSA_TRACKER_EXTENSION_RESPONSE_DOM";
const inFlightRequestIds = new Set();

const safeRuntimeSendMessage = (message, callback) => {
  try {
    if (!chrome?.runtime?.id) {
      callback({
        ok: false,
        error: "Extension runtime unavailable. Reload extension and page.",
      });
      return;
    }
    chrome.runtime.sendMessage(message, callback);
  } catch (error) {
    callback({
      ok: false,
      error: error?.message || "Failed to reach extension background worker",
    });
  }
};

function sendResponse(requestId, ok, payload, error) {
  window.postMessage(
    {
      source: EXT_SOURCE,
      requestId,
      ok,
      payload,
      error,
    },
    "*",
  );

  document.dispatchEvent(
    new CustomEvent(RESPONSE_DOM_EVENT, {
      detail: {
        source: EXT_SOURCE,
        requestId,
        ok,
        payload,
        error,
      },
    }),
  );
}

const forwardRequestToBackground = (data) => {
  if (!data?.requestId || !data?.action) return;

  if (!data || data.source !== APP_SOURCE || data.type !== REQUEST_EVENT)
    return;
  if (inFlightRequestIds.has(data.requestId)) return;

  inFlightRequestIds.add(data.requestId);

  safeRuntimeSendMessage(
    {
      type: data.action,
      payload: data.payload || {},
    },
    (response) => {
      const runtimeLastError = chrome?.runtime?.lastError;
      if (runtimeLastError) {
        sendResponse(data.requestId, false, null, runtimeLastError.message);
        inFlightRequestIds.delete(data.requestId);
        return;
      }
      if (!response?.ok) {
        sendResponse(
          data.requestId,
          false,
          null,
          response?.error || "Request failed",
        );
        inFlightRequestIds.delete(data.requestId);
        return;
      }
      sendResponse(data.requestId, true, response.payload, null);
      inFlightRequestIds.delete(data.requestId);
    },
  );
};

window.addEventListener("message", (event) => {
  const data = event.data;
  forwardRequestToBackground(data);
});

document.addEventListener(REQUEST_DOM_EVENT, (event) => {
  const customEvent = event;
  const detail = customEvent.detail || {};
  forwardRequestToBackground({
    source: APP_SOURCE,
    type: REQUEST_EVENT,
    requestId: detail.requestId,
    action: detail.action,
    payload: detail.payload,
  });
});

// Existing auto-sync behavior for accepted submissions on LeetCode pages.
if (window.location.hostname.includes("leetcode.com")) {
  let hasSynced = false;

  function checkAccepted() {
    if (hasSynced) return;

    const path = window.location.pathname;
    if (!path.includes("/problems/")) return;

    const parts = path.split("/");
    const slugIndex = parts.indexOf("problems") + 1;
    if (slugIndex >= parts.length) return;
    const slug = parts[slugIndex];

    const candidateNodes = [
      document.querySelector('[data-e2e-locator="submission-result"]'),
      document.querySelector('[data-cy="submission-result"]'),
      document.querySelector('[class*="result"]'),
      document.querySelector('[class*="status"]'),
    ].filter(Boolean);

    const acceptedFromCandidates = candidateNodes.some((node) => {
      const text = (node.textContent || "").trim().toLowerCase();
      return text.includes("accepted");
    });

    const acceptedFromTextScan = Array.from(
      document.querySelectorAll("span, div, p, strong"),
    ).some((el) => {
      const text = (el.textContent || "").trim().toLowerCase();
      if (text !== "accepted" && !text.includes("accepted")) return false;

      const color = getComputedStyle(el).color;
      return (
        color === "rgb(44, 181, 93)" ||
        color === "rgb(0, 175, 155)" ||
        color === "rgb(46, 160, 67)"
      );
    });

    if (acceptedFromCandidates || acceptedFromTextScan) {
      hasSynced = true;
      safeRuntimeSendMessage(
        { type: "SYNC_PROBLEM", problemSlug: slug },
        () => {},
      );
    }
  }

  setInterval(checkAccepted, 1500);

  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const url = window.location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      hasSynced = false;
    }
  }).observe(document, { subtree: true, childList: true });
}
