const DEFAULT_API_BASES = ["http://localhost:3001"];

const isAllowedApiBase = (urlString) => {
  try {
    const url = new URL(urlString);
    const localHosts = new Set(["localhost", "127.0.0.1"]);
    if (localHosts.has(url.hostname)) {
      return url.protocol === "http:" || url.protocol === "https:";
    }
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

const getCandidateApiBases = async () => {
  try {
    const stored = await chrome.storage.local.get([
      "dsaApiBaseUrl",
      "dsaApiBaseUrls",
    ]);
    const single =
      typeof stored.dsaApiBaseUrl === "string" ? [stored.dsaApiBaseUrl] : [];
    const multiple = Array.isArray(stored.dsaApiBaseUrls)
      ? stored.dsaApiBaseUrls
      : [];

    return [...new Set([...single, ...multiple, ...DEFAULT_API_BASES])]
      .map((url) => String(url).trim().replace(/\/$/, ""))
      .filter((url) => Boolean(url) && isAllowedApiBase(url));
  } catch {
    return DEFAULT_API_BASES;
  }
};

const getPairingToken = () =>
  new Promise((resolve) => {
    chrome.storage.local.get(["pairingToken"], (res) => {
      resolve(res?.pairingToken || "");
    });
  });

const setPairingState = (state) =>
  new Promise((resolve) => {
    chrome.storage.local.set(state, resolve);
  });

const clearPairingToken = () =>
  new Promise((resolve) => {
    chrome.storage.local.set(
      {
        pairingToken: "",
        pairingStatus: "re_pair_needed",
        lastError: "Pairing token rejected or expired (401 Unauthorized). Re-pair needed.",
      },
      resolve,
    );
  });

/**
 * Sends submission sync payload with pairing token to the backend.
 */
const syncToApi = async (payload) => {
  const token = await getPairingToken();
  if (!token) {
    await setPairingState({
      pairingStatus: "not_paired",
      lastError: "Extension is not paired. Paste your pairing token in the extension popup.",
    });
    throw new Error("Extension is not paired. Please open extension popup to pair.");
  }

  const bases = await getCandidateApiBases();
  let lastError = null;

  for (const baseUrl of bases) {
    try {
      const response = await fetch(`${baseUrl}/api/extension/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        await clearPairingToken();
        throw new Error("Authentication failed (401 Unauthorized). Pairing token was revoked or expired. Re-pair needed.");
      }

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Sync failed (${response.status}): ${body}`);
      }

      const result = await response.json();
      await setPairingState({
        pairingStatus: "paired",
        lastSyncAt: new Date().toISOString(),
        lastSyncedSlug: payload.slug || payload.problemSlug,
        lastError: "",
      });

      return result;
    } catch (err) {
      lastError = err;
      if (err.message && err.message.includes("401")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("All API endpoints unreachable");
};

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  (async () => {
    try {
      const requestType =
        request && typeof request.type === "string" ? request.type : "";

      if (!requestType) {
        sendResponse({ ok: false, error: "Malformed extension request" });
        return;
      }

      // Check extension status
      if (requestType === "PING" || requestType === "GET_PAIRING_STATUS") {
        const token = await getPairingToken();
        const stored = await chrome.storage.local.get([
          "pairingStatus",
          "lastSyncAt",
          "lastError",
        ]);
        const status = token
          ? "paired"
          : stored?.pairingStatus || "not_paired";

        sendResponse({
          ok: true,
          payload: {
            installed: true,
            paired: Boolean(token),
            status,
            lastSyncAt: stored?.lastSyncAt || null,
            lastError: stored?.lastError || "",
          },
        });
        return;
      }

      // Save pairing token from popup
      if (requestType === "SET_PAIRING_TOKEN") {
        const token = String(request.token || "").trim();
        if (!token.startsWith("dsat_") || token.length < 32) {
          sendResponse({
            ok: false,
            error: "Invalid token format. Pairing tokens begin with 'dsat_'.",
          });
          return;
        }

        await setPairingState({
          pairingToken: token,
          pairingStatus: "paired",
          lastError: "",
        });

        sendResponse({ ok: true, payload: { paired: true } });
        return;
      }

      // Unpair from popup
      if (requestType === "UNPAIR") {
        await setPairingState({
          pairingToken: "",
          pairingStatus: "not_paired",
          lastError: "",
          lastSyncAt: null,
        });

        sendResponse({ ok: true, payload: { paired: false } });
        return;
      }

      // Sync submission (new 2.2 contract)
      if (requestType === "SYNC_SUBMISSION") {
        const payload = request.payload || {};
        const submissionId =
          payload.submissionId ||
          `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const result = await syncToApi({
          submissionId,
          slug: String(payload.slug || "").trim().toLowerCase(),
          verdict: String(payload.verdict || "ACCEPTED").trim().toUpperCase(),
          runtimeMs: typeof payload.runtimeMs === "number" ? payload.runtimeMs : undefined,
          memoryKb: typeof payload.memoryKb === "number" ? payload.memoryKb : undefined,
          submittedAt: payload.submittedAt || new Date().toISOString(),
        });

        sendResponse({ ok: true, payload: result });
        return;
      }

      // Fallback for legacy SYNC_PROBLEM message
      if (requestType === "SYNC_PROBLEM") {
        const slug = String(request.problemSlug || "").trim().toLowerCase();
        const submissionId = `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const result = await syncToApi({
          submissionId,
          slug,
          verdict: "ACCEPTED",
          submittedAt: new Date().toISOString(),
        });

        sendResponse({ ok: true, payload: result });
        return;
      }

      sendResponse({ ok: false, error: "Unsupported request type" });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error?.message || "Unexpected extension background error",
      });
    }
  })();

  return true;
});
