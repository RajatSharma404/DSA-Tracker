const $ = (id) => document.getElementById(id);

const status = (el, tone, text) => {
  el.textContent = "";
  const dot = document.createElement("span");
  dot.className = `dot ${tone}`;
  el.append(dot, document.createTextNode(text));
};

const relative = (ts) => {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

const render = () =>
  chrome.runtime.sendMessage({ type: "PING" }, (res) => {
    const p = res?.payload || {};
    $("version").textContent = `v${p.version || chrome.runtime.getManifest().version}`;
    status($("lc"), p.leetcodeSignedIn ? "ok" : "bad", p.leetcodeSignedIn ? "Signed in" : "Signed out");
    status($("paired"), p.paired ? "ok" : "warn", p.paired ? "Yes" : "Open the tracker");
    $("queue").textContent = String(p.pendingSyncs ?? 0);
    $("last").textContent = p.lastSync ? `${p.lastSync.title} · ${relative(p.lastSync.at)}` : "—";
  });

$("retry").addEventListener("click", () =>
  chrome.runtime.sendMessage({ type: "FLUSH_QUEUE" }, render),
);
$("leetcode").addEventListener("click", () => chrome.tabs.create({ url: "https://leetcode.com/problemset/" }));

render();
