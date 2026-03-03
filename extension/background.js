chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SYNC_PROBLEM") {
    // We seamlessly read the active LeetCode session token directly from the user's browser HTTP cookies
    chrome.cookies.get({ url: "https://leetcode.com", name: "LEETCODE_SESSION" }, (cookie) => {
      if (cookie && cookie.value) {
        
        // Quietly ping our backend localhost server, authenticating with the exact LeetCode cookie
        fetch("http://localhost:3001/api/extension/sync", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            problemSlug: request.problemSlug,
            leetcodeSession: cookie.value
          })
        })
        .then(res => res.json())
        .then(data => {
            console.log("[DSA Pro] Auto-Sync successful! Backend response:", data);
        })
        .catch(err => {
            console.error("[DSA Pro] Sync completely failed! Is the backend running? ", err);
        });
      } else {
        console.warn("[DSA Pro] Extension: Unable to find a LEETCODE_SESSION. Please sign into LeetCode first.");
      }
    });
  }
});
