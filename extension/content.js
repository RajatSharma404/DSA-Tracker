let hasSynced = false;

function checkAccepted() {
  if (hasSynced) return;
  
  const path = window.location.pathname;
  if (!path.includes('/problems/')) return;
  
  const parts = path.split('/');
  const slugIndex = parts.indexOf('problems') + 1;
  if (slugIndex >= parts.length) return;
  const slug = parts[slugIndex];

  // Search for the "Accepted" submission state on LeetCode's React app
  const modernLocator = document.querySelector('[data-e2e-locator="submission-result"]');
  
  // Fallback: search for elements with exact text "Accepted" and specific success green color
  const acceptedElements = Array.from(document.querySelectorAll('span, div')).filter(el => {
    return el.textContent === 'Accepted' && 
           getComputedStyle(el).color === 'rgb(44, 181, 93)';
  });

  if ((modernLocator && modernLocator.textContent === 'Accepted') || acceptedElements.length > 0) {
    hasSynced = true;
    console.log(`[DSA Tracker Pro] Awesome! You solved '${slug}'. Ping dispatching to localhost...`);
    chrome.runtime.sendMessage({ type: "SYNC_PROBLEM", problemSlug: slug });
  }
}

// We check periodically because LeetCode is a Single Page Application (SPA),
// and submission results load asynchronously without full page reloads.
setInterval(checkAccepted, 2000);

// Reset synced state if URL changes (they navigate to a new problem)
let lastUrl = window.location.href;
new MutationObserver(() => {
  const url = window.location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    hasSynced = false; // allow syncing the next problem
  }
}).observe(document, { subtree: true, childList: true });
