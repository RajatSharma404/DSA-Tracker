/**
 * "Sync from LeetCode" bookmarklet: zero-install history import.
 *
 * Run on leetcode.com, it opens a small tracker window (/connect/leetcode)
 * right away (pop-up blockers only allow that synchronously on click), reads
 * the user's solved list, recent accepted submissions, profile stats and
 * submission calendar from LeetCode's GraphQL API (same-origin, the user's own
 * session), then posts them to that window, which imports them under the
 * tracker session. No data goes anywhere else.
 *
 * Mirrors lcSnapshotInPage in extension/background.js.
 */

export const BOOKMARKLET_MESSAGE = {
  ready: "DSA_RECEIVER_READY",
  snapshot: "DSA_LC_SNAPSHOT",
} as const;

const source = (trackerOrigin: string) => `
(async function () {
  var T = ${JSON.stringify(trackerOrigin)};
  if (!/(^|\\.)leetcode\\.com$/.test(location.hostname)) {
    if (confirm("Run this bookmark while you are on leetcode.com. Open LeetCode now?")) location.href = "https://leetcode.com/problemset/";
    return;
  }
  var w = window.open(T + "/connect/leetcode", "dsa_lc_sync", "width=480,height=600");
  if (!w) { alert("Please allow pop-ups for leetcode.com, then click the bookmark again."); return; }
  var ready = false, payload = null;
  var send = function () { if (ready && payload) w.postMessage({ type: "DSA_LC_SNAPSHOT", data: payload }, T); };
  window.addEventListener("message", function (e) {
    if (e.origin === T && e.data && e.data.type === "DSA_RECEIVER_READY") { ready = true; send(); }
  });
  var csrf = (document.cookie.match(/(?:^|;\\s*)csrftoken=([^;]+)/) || [])[1] || "";
  var gql = function (query, variables) {
    return fetch("/graphql/", { method: "POST", credentials: "include", headers: { "content-type": "application/json", "x-csrftoken": csrf }, body: JSON.stringify({ query: query, variables: variables || {} }) })
      .then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; });
  };
  try {
    var st = await gql("query{userStatus{isSignedIn username}}");
    var u = st && st.data && st.data.userStatus;
    if (!u || !u.isSignedIn) { payload = { error: "NOT_SIGNED_IN" }; send(); return; }
    var solved = [];
    for (var p = 0; p < 40; p++) {
      var r = await gql("query q($l:Int,$s:Int,$f:QuestionListFilterInput){questionList(categorySlug:\\"\\",limit:$l,skip:$s,filters:$f){totalNum data{title titleSlug difficulty status}}}", { l: 100, s: p * 100, f: { status: "AC" } });
      var list = r && r.data && r.data.questionList;
      if (!list) break;
      for (var i = 0; i < list.data.length; i++) {
        var q = list.data[i];
        if (!q.status || String(q.status).toLowerCase() === "ac") solved.push({ title: q.title, titleSlug: q.titleSlug, difficulty: String(q.difficulty || "").toUpperCase() });
      }
      if ((p + 1) * 100 >= list.totalNum || !list.data.length) break;
    }
    var rec = await gql("query q($u:String!){recentAcSubmissionList(username:$u,limit:50){title titleSlug timestamp}}", { u: u.username });
    var pro = await gql("query q($u:String!){matchedUser(username:$u){profile{ranking userAvatar} submitStatsGlobal{acSubmissionNum{difficulty count}} userCalendar{streak totalActiveDays submissionCalendar}} userContestRanking(username:$u){rating attendedContestsCount globalRanking topPercentage}}", { u: u.username });
    var mu = (pro && pro.data && pro.data.matchedUser) || {};
    var cal = {};
    try { cal = JSON.parse((mu.userCalendar && mu.userCalendar.submissionCalendar) || "{}"); } catch (e) {}
    payload = {
      username: u.username,
      solved: solved,
      recent: ((rec && rec.data && rec.data.recentAcSubmissionList) || []).map(function (s) { return { title: s.title, titleSlug: s.titleSlug, timestamp: Number(s.timestamp) || 0 }; }),
      stats: {
        ranking: (mu.profile && mu.profile.ranking) || null,
        avatar: (mu.profile && mu.profile.userAvatar) || null,
        acByDifficulty: (mu.submitStatsGlobal && mu.submitStatsGlobal.acSubmissionNum) || [],
        streak: (mu.userCalendar && mu.userCalendar.streak) || null,
        totalActiveDays: (mu.userCalendar && mu.userCalendar.totalActiveDays) || null,
        contest: (pro && pro.data && pro.data.userContestRanking) || null
      },
      calendar: cal
    };
  } catch (err) {
    payload = { error: "READ_FAILED" };
  }
  send();
})();`;

/** Collapse whitespace so the bookmark stays compact and single-line. */
const compact = (code: string) =>
  code
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");

export const buildBookmarklet = (trackerOrigin: string) =>
  `javascript:${encodeURIComponent(compact(source(trackerOrigin)))}`;

/** Exposed for tests: the raw source the bookmark runs. */
export const bookmarkletSource = (trackerOrigin: string) => compact(source(trackerOrigin));
