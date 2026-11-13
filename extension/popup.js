const $ = (id) => document.getElementById(id);
const send = (message) => new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));

const relative = (ts) => {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

const BADGES = {
  paired: ["PAIRED", "badge-paired"],
  re_pair_needed: ["RE-PAIR NEEDED", "badge-repair"],
  not_paired: ["NOT PAIRED", "badge-unpaired"],
};

const render = async () => {
  const res = await send({ type: "GET_PAIRING_STATUS" });
  const p = res?.payload || {};
  $("version").textContent = `v${p.version || chrome.runtime.getManifest().version}`;
  const [label, cls] = BADGES[p.status] || BADGES.not_paired;
  $("statusBadge").textContent = label;
  $("statusBadge").className = `badge ${cls}`;
  $("lc").textContent = p.leetcodeSignedIn ? "Signed in" : "Signed out";
  $("queue").textContent = String(p.pendingSyncs ?? 0);
  $("last").textContent = p.lastSync ? `${p.lastSync.title} · ${relative(p.lastSync.at)}` : "Never";
  $("errorMessage").textContent = p.lastError || "";
  $("pairingForm").hidden = Boolean(p.paired);
  $("pairedControls").hidden = !p.paired;
};

$("pairBtn").addEventListener("click", async () => {
  const token = $("tokenInput").value.trim();
  if (!token) {
    $("errorMessage").textContent = "Paste a pairing token first.";
    return;
  }
  const res = await send({ type: "SET_PAIRING_TOKEN", token });
  if (res?.ok) $("tokenInput").value = "";
  else $("errorMessage").textContent = res?.error || "Failed to pair.";
  render();
});
$("unpairBtn").addEventListener("click", async () => {
  await send({ type: "UNPAIR" });
  render();
});
$("retry").addEventListener("click", async () => {
  await send({ type: "FLUSH_QUEUE" });
  render();
});
$("leetcode").addEventListener("click", () => chrome.tabs.create({ url: "https://leetcode.com/problemset/" }));

render();
