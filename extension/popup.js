document.addEventListener("DOMContentLoaded", () => {
  const statusBadge = document.getElementById("statusBadge");
  const pairingForm = document.getElementById("pairingForm");
  const pairedControls = document.getElementById("pairedControls");
  const tokenInput = document.getElementById("tokenInput");
  const pairBtn = document.getElementById("pairBtn");
  const unpairBtn = document.getElementById("unpairBtn");
  const lastSyncTime = document.getElementById("lastSyncTime");
  const errorMessage = document.getElementById("errorMessage");

  function renderStatus(payload) {
    errorMessage.textContent = payload.lastError || "";

    if (payload.lastSyncAt) {
      try {
        const d = new Date(payload.lastSyncAt);
        lastSyncTime.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " (" + d.toLocaleDateString() + ")";
      } catch {
        lastSyncTime.textContent = payload.lastSyncAt;
      }
    } else {
      lastSyncTime.textContent = "Never";
    }

    if (payload.status === "paired" || payload.paired) {
      statusBadge.textContent = "PAIRED";
      statusBadge.className = "badge badge-paired";
      pairingForm.style.display = "none";
      pairedControls.style.display = "block";
    } else if (payload.status === "re_pair_needed") {
      statusBadge.textContent = "RE-PAIR NEEDED";
      statusBadge.className = "badge badge-repair";
      pairingForm.style.display = "block";
      pairedControls.style.display = "none";
      errorMessage.textContent = payload.lastError || "Your token was revoked or expired. Please enter a fresh pairing token.";
    } else {
      statusBadge.textContent = "NOT PAIRED";
      statusBadge.className = "badge badge-unpaired";
      pairingForm.style.display = "block";
      pairedControls.style.display = "none";
    }
  }

  function fetchStatus() {
    chrome.runtime.sendMessage({ type: "GET_PAIRING_STATUS" }, (response) => {
      if (response && response.ok && response.payload) {
        renderStatus(response.payload);
      }
    });
  }

  pairBtn.addEventListener("click", () => {
    const token = tokenInput.value.trim();
    if (!token) {
      errorMessage.textContent = "Please enter a valid pairing token.";
      return;
    }

    chrome.runtime.sendMessage({ type: "SET_PAIRING_TOKEN", token }, (response) => {
      if (response && response.ok) {
        tokenInput.value = "";
        fetchStatus();
      } else {
        errorMessage.textContent = response?.error || "Failed to pair token.";
      }
    });
  });

  unpairBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "UNPAIR" }, () => {
      fetchStatus();
    });
  });

  fetchStatus();
});

