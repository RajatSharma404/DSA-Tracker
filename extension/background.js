/*
 * DSA Pro Live Sync — background service worker (MV3).
 *
 * Responsibilities
 *  - PAIR: the DSA Tracker web app hands over its API base + access token so
 *    accepted submissions made directly on LeetCode can be synced without the
 *    LeetCode session cookie ever leaving the browser.
 *  - SUBMIT_TO_LEETCODE: submits code through LeetCode's own JSON API from
 *    inside a leetcode.com tab (same-origin, real cookies + CSRF) and polls the
 *    judge for the verdict. No editor/DOM automation.
 *  - FETCH_LEETCODE_SNAPSHOT: reads the signed-in user's solved list, recent
 *    accepted submissions and stats via LeetCode GraphQL from a leetcode tab.
 *  - REPORT_ACCEPTED: forwards verdicts captured by leetcode-hook.js to the
 *    tracker API, with an offline retry queue (chrome.alarms).
 */

const VERSION = chrome.runtime.getManifest().version;
const STORAGE_KEYS = {
  pairing: "dsaPairing",
  queue: "dsaSyncQueue",
  lastSync: "dsaLastSync",
  lastSnapshot: "dsaLastSnapshotAt",
};
const RETRY_ALARM = "dsa-sync-retry";
const MAX_QUEUE = 50;
const LEETCODE_ORIGIN = "https://leetcode.com";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const storageGet = async (key) => (await chrome.storage.local.get(key))[key];
const storageSet = (key, value) => chrome.storage.local.set({ [key]: value });

const isAllowedAppOrigin = (origin) => {
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return true;
    return url.protocol === "https:" && url.hostname.endsWith(".onrender.com");
  } catch {
    return false;
  }
};

const getLeetCodeSessionCookie = async () => {
  try {
    const cookie = await chrome.cookies.get({
      url: LEETCODE_ORIGIN,
      name: "LEETCODE_SESSION",
    });
    return cookie?.value || "";
  } catch {
    return "";
  }
};

const flashBadge = async (text, color) => {
  try {
    await chrome.action.setBadgeBackgroundColor({ color });
    await chrome.action.setBadgeText({ text });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }).catch(() => {}), 6000);
  } catch {
    // badge is cosmetic
  }
};

// ---------------------------------------------------------------------------
// LeetCode tab management — every LeetCode API call runs inside a
// leetcode.com document so it is same-origin with valid cookies + CSRF.
// ---------------------------------------------------------------------------

let tabLease = null; // { tabId, created, users }

const waitForTabComplete = (tabId, timeoutMs = 20000) =>
  new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn, value) => {
      if (done) return;
      done = true;
      chrome.tabs.onUpdated.removeListener(onUpdated);
      clearTimeout(timer);
      fn(value);
    };
    const onUpdated = (id, info) => {
      if (id === tabId && info.status === "complete") finish(resolve, true);
    };
    const timer = setTimeout(
      () => finish(reject, new Error("LeetCode took too long to load")),
      timeoutMs,
    );
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs
      .get(tabId)
      .then((tab) => tab.status === "complete" && finish(resolve, true))
      .catch((err) => finish(reject, err));
  });

const acquireLeetCodeTab = async () => {
  if (tabLease) {
    try {
      await chrome.tabs.get(tabLease.tabId);
      tabLease.users += 1;
      return tabLease.tabId;
    } catch {
      tabLease = null;
    }
  }

  const existing = await chrome.tabs.query({ url: `${LEETCODE_ORIGIN}/*` });
  const usable = existing.find((t) => !t.discarded && t.status === "complete") || existing[0];
  if (usable?.id) {
    if (usable.discarded) await chrome.tabs.reload(usable.id);
    await waitForTabComplete(usable.id);
    tabLease = { tabId: usable.id, created: false, users: 1 };
    return usable.id;
  }

  // Lightweight page: the problemset list loads fast and we only need the origin.
  const created = await chrome.tabs.create({
    url: `${LEETCODE_ORIGIN}/problemset/`,
    active: false,
  });
  if (!created.id) throw new Error("Could not open a LeetCode tab");
  await waitForTabComplete(created.id);
  tabLease = { tabId: created.id, created: true, users: 1 };
  return created.id;
};

const releaseLeetCodeTab = async () => {
  if (!tabLease) return;
  tabLease.users -= 1;
  if (tabLease.users > 0) return;
  const { tabId, created } = tabLease;
  tabLease = null;
  if (created) await chrome.tabs.remove(tabId).catch(() => {});
};

const runInLeetCode = async (func, args = []) => {
  const tabId = await acquireLeetCodeTab();
  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId },
      world: "MAIN",
      func,
      args,
    });
    return injection?.result;
  } catch (error) {
    if (/No tab with id|Cannot access contents/i.test(String(error?.message))) {
      throw new Error("The LeetCode tab was closed or blocked. Please retry.");
    }
    throw error;
  } finally {
    await releaseLeetCodeTab();
  }
};

// ---------------------------------------------------------------------------
// In-page functions (serialized and executed inside leetcode.com).
// They must be fully self-contained.
// ---------------------------------------------------------------------------

async function lcSubmitInPage(slug, code, lang, timeoutMs) {
  const csrf = (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || "";
  const headers = {
    "content-type": "application/json",
    "x-csrftoken": csrf,
    "x-requested-with": "XMLHttpRequest",
    "x-dsa-tracker": "1",
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const gql = async (query, variables) => {
    const res = await fetch("/graphql/", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    return res.json();
  };

  try {
    const status = await gql("query{userStatus{isSignedIn username}}", {});
    if (!status?.data?.userStatus?.isSignedIn) return { error: "NOT_SIGNED_IN" };

    const q = await gql(
      "query q($s:String!){question(titleSlug:$s){questionId questionFrontendId title difficulty isPaidOnly}}",
      { s: slug },
    );
    const question = q?.data?.question;
    if (!question) return { error: "PROBLEM_NOT_FOUND" };

    let submitRes;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      submitRes = await fetch(`/problems/${slug}/submit/`, {
        method: "POST",
        credentials: "include",
        headers,
        referrer: `${location.origin}/problems/${slug}/`,
        body: JSON.stringify({
          lang,
          question_id: question.questionId,
          typed_code: code,
        }),
      });
      if (submitRes.status !== 429) break;
      await sleep(2500 * (attempt + 1)); // LeetCode throttles rapid submits
    }
    if (submitRes.status === 401 || submitRes.status === 403) return { error: "NOT_SIGNED_IN" };
    if (submitRes.status === 429) return { error: "RATE_LIMITED" };
    if (!submitRes.ok) return { error: `SUBMIT_HTTP_${submitRes.status}` };

    const { submission_id: submissionId } = await submitRes.json();
    if (!submissionId) return { error: "NO_SUBMISSION_ID" };

    const started = Date.now();
    let wait = 900;
    while (Date.now() - started < timeoutMs) {
      await sleep(wait);
      wait = Math.min(wait + 300, 2000);
      const res = await fetch(`/submissions/detail/${submissionId}/check/`, {
        credentials: "include",
        headers,
      });
      if (!res.ok) continue;
      const r = await res.json();
      if (r.state !== "SUCCESS") continue;
      return {
        ok: true,
        submissionId: String(submissionId),
        question,
        result: {
          statusMsg: r.status_msg,
          accepted: r.status_msg === "Accepted" || r.status_code === 10,
          runtime: r.status_runtime || null,
          memory: r.status_memory || null,
          runtimePercentile: r.runtime_percentile ?? null,
          memoryPercentile: r.memory_percentile ?? null,
          totalCorrect: r.total_correct ?? null,
          totalTestcases: r.total_testcases ?? null,
          compileError: r.full_compile_error || r.compile_error || null,
          runtimeError: r.full_runtime_error || r.runtime_error || null,
          lastTestcase: r.last_testcase || null,
          expectedOutput: r.expected_output || null,
          codeOutput: r.code_output || null,
          finishedAt: r.task_finish_time || Date.now(),
        },
      };
    }
    return { error: "TIMEOUT", submissionId: String(submissionId) };
  } catch (err) {
    return { error: `IN_PAGE_ERROR: ${err && err.message ? err.message : String(err)}` };
  }
}

async function lcSnapshotInPage(maxPages) {
  const csrf = (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || "";
  const headers = {
    "content-type": "application/json",
    "x-csrftoken": csrf,
    "x-dsa-tracker": "1",
  };
  const gql = async (query, variables) => {
    const res = await fetch("/graphql/", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) return { errors: [{ message: `HTTP ${res.status}` }] };
    return res.json();
  };

  try {
    const status = await gql("query{userStatus{isSignedIn username}}", {});
    const user = status?.data?.userStatus;
    if (!user?.isSignedIn || !user.username) return { error: "NOT_SIGNED_IN" };
    const username = user.username;

    // 1) Full solved list. LeetCode has shipped two schemas; try both.
    const solved = [];
    let source = "questionList";
    const pageSize = 100;
    for (let page = 0; page < maxPages; page += 1) {
      const r = await gql(
        `query q($limit:Int,$skip:Int,$filters:QuestionListFilterInput){
          questionList(categorySlug:"",limit:$limit,skip:$skip,filters:$filters){
            totalNum data{ title titleSlug difficulty status questionFrontendId }
          }}`,
        { limit: pageSize, skip: page * pageSize, filters: { status: "AC" } },
      );
      const list = r?.data?.questionList;
      if (!list) {
        source = "unavailable";
        break;
      }
      solved.push(...list.data.filter((q) => q.status === "ac" || q.status === "AC" || !q.status));
      if ((page + 1) * pageSize >= list.totalNum || list.data.length === 0) break;
    }

    if (source === "unavailable") {
      source = "problemsetQuestionListV2";
      for (let page = 0; page < maxPages; page += 1) {
        const r = await gql(
          `query q($skip:Int,$limit:Int){
            problemsetQuestionListV2(
              filters:{filterCombineType:ALL,statusFilter:{questionStatuses:[SOLVED],operator:IS}}
              limit:$limit skip:$skip categorySlug:"all-code-essentials"
            ){ hasMore questions{ title titleSlug difficulty questionFrontendId } }
          }`,
          { skip: page * pageSize, limit: pageSize },
        );
        const list = r?.data?.problemsetQuestionListV2;
        if (!list) {
          source = "recentOnly";
          break;
        }
        solved.push(...list.questions);
        if (!list.hasMore) break;
      }
    }

    // 2) Recent accepted submissions give real timestamps.
    const recent = await gql(
      `query q($u:String!,$l:Int!){ recentAcSubmissionList(username:$u,limit:$l){ id title titleSlug timestamp lang } }`,
      { u: username, l: 50 },
    );

    // 3) Profile stats + submission calendar.
    const profile = await gql(
      `query q($u:String!){
        matchedUser(username:$u){
          profile{ ranking userAvatar }
          submitStatsGlobal{ acSubmissionNum{ difficulty count } }
          userCalendar{ streak totalActiveDays submissionCalendar }
        }
        userContestRanking(username:$u){ rating attendedContestsCount globalRanking topPercentage }
      }`,
      { u: username },
    );

    const mu = profile?.data?.matchedUser;
    let calendar = {};
    try {
      calendar = JSON.parse(mu?.userCalendar?.submissionCalendar || "{}");
    } catch {
      calendar = {};
    }

    return {
      ok: true,
      username,
      source,
      solved: solved.map((q) => ({
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: String(q.difficulty || "").toUpperCase(),
        frontendId: q.questionFrontendId || null,
      })),
      recent: (recent?.data?.recentAcSubmissionList || []).map((s) => ({
        title: s.title,
        titleSlug: s.titleSlug,
        timestamp: Number(s.timestamp) || 0,
        lang: s.lang || null,
      })),
      stats: {
        ranking: mu?.profile?.ranking ?? null,
        avatar: mu?.profile?.userAvatar ?? null,
        acByDifficulty: mu?.submitStatsGlobal?.acSubmissionNum || [],
        streak: mu?.userCalendar?.streak ?? null,
        totalActiveDays: mu?.userCalendar?.totalActiveDays ?? null,
        contest: profile?.data?.userContestRanking || null,
      },
      calendar,
    };
  } catch (err) {
    return { error: `IN_PAGE_ERROR: ${err && err.message ? err.message : String(err)}` };
  }
}

// ---------------------------------------------------------------------------
// Tracker API sync with offline queue
// ---------------------------------------------------------------------------

const ERROR_MESSAGES = {
  NOT_SIGNED_IN: "You're not signed in to LeetCode in this browser. Sign in at leetcode.com and retry.",
  PROBLEM_NOT_FOUND: "LeetCode doesn't recognise this problem slug.",
  RATE_LIMITED: "LeetCode is rate-limiting submissions. Wait ~10 seconds and retry.",
  NO_SUBMISSION_ID: "LeetCode accepted the request but returned no submission id.",
};
const humanError = (code) =>
  ERROR_MESSAGES[code] || (code?.startsWith("SUBMIT_HTTP_") ? `LeetCode rejected the submission (${code.slice(12)}).` : code);

const postAcceptedToTracker = async (payload) => {
  const pairing = await storageGet(STORAGE_KEYS.pairing);
  if (!pairing?.apiBase || !pairing?.token) {
    const err = new Error("Open DSA Tracker once while signed in so the extension can pair.");
    err.permanent = true;
    throw err;
  }
  const res = await fetch(`${pairing.apiBase}/extension/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pairing.token}`,
      "X-DSA-Extension-Version": VERSION,
    },
    body: JSON.stringify({ version: 2, ...payload }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`Tracker sync failed (${res.status}) ${body.slice(0, 160)}`);
    err.permanent = res.status === 400 || res.status === 401 || res.status === 403;
    err.malformed = res.status === 400;
    throw err;
  }
  const json = await res.json().catch(() => ({}));
  await storageSet(STORAGE_KEYS.lastSync, {
    at: Date.now(),
    slug: payload.slug,
    title: json?.problem?.title || payload.title || payload.slug,
  });
  return json;
};

const enqueue = async (payload) => {
  const queue = (await storageGet(STORAGE_KEYS.queue)) || [];
  const filtered = queue.filter((item) => item.submissionId !== payload.submissionId);
  filtered.push({ ...payload, queuedAt: Date.now() });
  await storageSet(STORAGE_KEYS.queue, filtered.slice(-MAX_QUEUE));
  chrome.alarms.create(RETRY_ALARM, { periodInMinutes: 2 });
};

const flushQueue = async () => {
  const queue = (await storageGet(STORAGE_KEYS.queue)) || [];
  if (!queue.length) {
    chrome.alarms.clear(RETRY_ALARM);
    return { flushed: 0, remaining: 0 };
  }
  const remaining = [];
  let flushed = 0;
  for (const item of queue) {
    try {
      await postAcceptedToTracker(item);
      flushed += 1;
    } catch (err) {
      // Drop items that will never succeed or are older than a week.
      const stale = Date.now() - (item.queuedAt || 0) > 7 * 24 * 3600 * 1000;
      if (!stale && !err.malformed) remaining.push(item);
    }
  }
  await storageSet(STORAGE_KEYS.queue, remaining);
  if (!remaining.length) chrome.alarms.clear(RETRY_ALARM);
  return { flushed, remaining: remaining.length };
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === RETRY_ALARM) flushQueue();
});
chrome.runtime.onStartup.addListener(() => flushQueue());

// ---------------------------------------------------------------------------
// Message router
// ---------------------------------------------------------------------------

const senderOrigin = (sender) => {
  try {
    return new URL(sender?.tab?.url || sender?.url || "").origin;
  } catch {
    return "";
  }
};

const handlers = {
  async PING() {
    const [session, pairing, queue, lastSync] = await Promise.all([
      getLeetCodeSessionCookie(),
      storageGet(STORAGE_KEYS.pairing),
      storageGet(STORAGE_KEYS.queue),
      storageGet(STORAGE_KEYS.lastSync),
    ]);
    return {
      installed: true,
      version: VERSION,
      leetcodeSignedIn: Boolean(session),
      paired: Boolean(pairing?.token),
      pendingSyncs: (queue || []).length,
      lastSync: lastSync || null,
    };
  },

  async PAIR(payload, sender) {
    const origin = senderOrigin(sender);
    if (!isAllowedAppOrigin(origin)) throw new Error("Pairing is only allowed from DSA Tracker pages");
    const token = typeof payload.token === "string" ? payload.token.trim() : "";
    if (!token || token.length > 4096) throw new Error("Missing access token");
    // The API is always reached through the app's same-origin /api proxy.
    await storageSet(STORAGE_KEYS.pairing, {
      apiBase: `${origin}/api`,
      token,
      pairedAt: Date.now(),
    });
    flushQueue();
    return { paired: true };
  },

  async SUBMIT_TO_LEETCODE(payload) {
    const slug = String(payload.problemSlug || "").trim().toLowerCase();
    if (!/^[a-z0-9-]{1,120}$/.test(slug)) throw new Error("Invalid problem slug");
    const code = String(payload.code || "");
    if (!code.trim()) throw new Error("Code is empty");
    const lang = String(payload.language || "cpp");
    const timeoutMs = Math.min(Math.max(Number(payload.timeoutMs) || 45000, 10000), 120000);

    if (!(await getLeetCodeSessionCookie())) throw new Error(ERROR_MESSAGES.NOT_SIGNED_IN);

    const out = await runInLeetCode(lcSubmitInPage, [slug, code, lang, timeoutMs]);
    if (!out) throw new Error("No response from the LeetCode tab");
    if (out.error === "TIMEOUT") {
      return {
        accepted: false,
        verdict: "TIMEOUT",
        timedOut: true,
        submissionId: out.submissionId,
        details: "LeetCode is still judging. Check your submissions page in a minute.",
      };
    }
    if (out.error) throw new Error(humanError(out.error));

    const r = out.result;
    if (r.accepted) {
      const report = {
        slug,
        submissionId: out.submissionId,
        lang,
        code,
        runtime: r.runtime,
        memory: r.memory,
        runtimePercentile: r.runtimePercentile,
        memoryPercentile: r.memoryPercentile,
        totalTestcases: r.totalTestcases,
        timestamp: Math.floor(Number(r.finishedAt) / 1000),
        title: out.question.title,
        difficulty: out.question.difficulty,
        frontendId: out.question.questionFrontendId,
        tags: [],
      };
      postAcceptedToTracker(report).catch(() => enqueue(report));
      flashBadge("✓", "#10b981");
    }

    return {
      accepted: r.accepted,
      verdict: r.statusMsg || "Unknown",
      timedOut: false,
      submissionId: out.submissionId,
      runtime: r.runtime,
      memory: r.memory,
      runtimePercentile: r.runtimePercentile,
      memoryPercentile: r.memoryPercentile,
      totalCorrect: r.totalCorrect,
      totalTestcases: r.totalTestcases,
      details:
        r.compileError ||
        r.runtimeError ||
        (r.lastTestcase
          ? `Input: ${r.lastTestcase}\nExpected: ${r.expectedOutput ?? "?"}\nOutput: ${r.codeOutput ?? "?"}`
          : undefined),
    };
  },

  async FETCH_LEETCODE_SNAPSHOT(payload) {
    if (!(await getLeetCodeSessionCookie())) throw new Error(ERROR_MESSAGES.NOT_SIGNED_IN);
    const maxPages = Math.min(Math.max(Number(payload.maxPages) || 40, 1), 60);
    const out = await runInLeetCode(lcSnapshotInPage, [maxPages]);
    if (!out) throw new Error("No response from the LeetCode tab");
    if (out.error) throw new Error(humanError(out.error));
    await storageSet(STORAGE_KEYS.lastSnapshot, Date.now());
    return out;
  },

  async REPORT_ACCEPTED(payload, sender) {
    if (!/^https:\/\/([a-z0-9-]+\.)?leetcode\.com$/.test(senderOrigin(sender))) {
      throw new Error("REPORT_ACCEPTED is only accepted from leetcode.com");
    }
    const slug = String(payload.slug || "").toLowerCase();
    if (!/^[a-z0-9-]{1,120}$/.test(slug)) throw new Error("Invalid slug");
    const report = { ...payload, slug };
    try {
      await postAcceptedToTracker(report);
      flashBadge("✓", "#10b981");
      return { synced: true };
    } catch (err) {
      if (err.malformed) throw err;
      // Unreachable, unpaired or expired token: keep it and retry after the
      // next successful PAIR (which happens every time the app is opened).
      await enqueue(report);
      flashBadge("…", "#f59e0b");
      const queuedError = new Error(
        err.permanent
          ? "Open DSA Tracker while signed in to finish syncing (queued)"
          : "Tracker unreachable — queued for retry",
      );
      queuedError.payload = { queued: true };
      throw queuedError;
    }
  },

  async FLUSH_QUEUE() {
    return flushQueue();
  },
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handler = handlers[request?.type];
  if (!handler) {
    sendResponse({ ok: false, error: "Unsupported request type" });
    return false;
  }
  handler(request.payload || {}, sender)
    .then((payload) => sendResponse({ ok: true, payload }))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error?.message || "Extension error",
        payload: error?.payload,
      }),
    );
  return true;
});
