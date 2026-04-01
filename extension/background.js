const DEFAULT_API_BASES = ["http://localhost:3001"];

const getCandidateApiBases = async () => {
  try {
    const stored = await chrome.storage.sync.get([
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
      .filter(Boolean);
  } catch {
    return DEFAULT_API_BASES;
  }
};

const trySyncToApi = async (baseUrl, problemSlug, leetcodeSession) => {
  const response = await fetch(`${baseUrl}/api/extension/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      problemSlug,
      leetcodeSession,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sync failed (${response.status}): ${body}`);
  }

  return response.json();
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.type !== "SYNC_PROBLEM") {
    return;
  }

  chrome.cookies.get(
    { url: "https://leetcode.com", name: "LEETCODE_SESSION" },
    async (cookie) => {
      if (!cookie || !cookie.value) {
        console.warn(
          "[DSA Pro] Extension: Unable to find LEETCODE_SESSION. Please sign into LeetCode first.",
        );
        return;
      }

      const candidates = await getCandidateApiBases();
      let lastError = null;

      for (const baseUrl of candidates) {
        try {
          const data = await trySyncToApi(
            baseUrl,
            request.problemSlug,
            cookie.value,
          );
          console.log("[DSA Pro] Auto-sync successful via", baseUrl, data);
          return;
        } catch (err) {
          lastError = err;
          console.warn("[DSA Pro] Sync attempt failed via", baseUrl, err);
        }
      }

      console.error("[DSA Pro] All sync attempts failed.", lastError);
    },
  );
});
