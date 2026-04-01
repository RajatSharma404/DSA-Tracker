let hasSynced = false;

function checkAccepted() {
  if (hasSynced) return;

  const path = window.location.pathname;
  if (!path.includes("/problems/")) return;

  const parts = path.split("/");
  const slugIndex = parts.indexOf("problems") + 1;
  if (slugIndex >= parts.length) return;
  const slug = parts[slugIndex];

  // LeetCode UI changes frequently, so we check multiple selectors and text hints.
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
    console.log(
      `[DSA Tracker Pro] Awesome! You solved '${slug}'. Ping dispatching to localhost...`,
    );
    chrome.runtime.sendMessage({ type: "SYNC_PROBLEM", problemSlug: slug });
  }
}

// We check periodically because LeetCode is a Single Page Application (SPA),
// and submission results load asynchronously without full page reloads.
setInterval(checkAccepted, 1500);

// Reset synced state if URL changes (they navigate to a new problem)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const url = window.location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    hasSynced = false; // allow syncing the next problem
  }
}).observe(document, { subtree: true, childList: true });
