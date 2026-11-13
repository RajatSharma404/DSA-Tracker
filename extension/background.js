/*
 * DSA Pro Live Sync — background service worker (MV3).
 *
 * Auth: revocable `dsat_` device tokens (backend `ExtensionDevice`). A token
 * arrives either automatically from the web app (PAIR, which mints one via
 * POST /api/extension/devices) or pasted into the popup (SET_PAIRING_TOKEN).
 * The extension never reads or transmits the LEETCODE_SESSION cookie.
 *
 *  - REPORT_ACCEPTED: verdicts captured by leetcode-hook.js from LeetCode's own
 *    judge responses -> POST /api/extension/sync (strict contract, idempotent on
 *    LeetCode's real submission id), with an offline retry queue.
 *  - SUBMIT_TO_LEETCODE: submits through LeetCode's JSON API inside a
 *    leetcode.com tab (same-origin cookies + CSRF) and polls for the verdict.
 *  - FETCH_LEETCODE_SNAPSHOT: solved list, recent ACs, stats and calendar.
 */

const VERSION = chrome.runtime.getManifest().version;
const LEETCODE_ORIGIN = "https://leetcode.com";
/** Used when paired from the popup (no app origin known): backend directly. */
const DEFAULT_API_BASES = ["http://localhost:3001/api"];
const KEYS = {
  pairing: "dsaPairing", // { token, apiBase?, pairedAt, source }
  status: "dsaPairingStatus", // "paired" | "not_paired" | "re_pair_needed"
  lastError: "dsaLastError",
  queue: "dsaSyncQueue",
  lastSync: "dsaLastSync",
  lcSignedIn: "dsaLcSignedIn", // last observed LeetCode sign-in state
};
const RETRY_ALARM = "dsa-sync-retry";
const MAX_QUEUE = 50;

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const get = async (key) => (await chrome.storage.local.get(key))[key];
const set = (values) => chrome.storage.local.set(values);
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const isAllowedAppOrigin = (origin) => {
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return true;
    return url.protocol === "https:" && url.hostname.endsWith(".onrender.com");
  } catch {
    return false;
  }
};

const isDeviceToken = (t) => typeof t === "string" && t.startsWith("dsat_") && t.length >= 32 && t.length <= 200;

const flashBadge = async (text, color) => {
  try {
    await chrome.action.setBadgeBackgroundColor({ color });
    await chrome.action.setBadgeText({ text });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }).catch(() => {}), 6000);
  } catch {
    // cosmetic
  }
};

// ---------------------------------------------------------------------------
// LeetCode tab management — LeetCode API calls run inside a leetcode.com
// document so they are same-origin with the user's own cookies + CSRF.
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
    const timer = setTimeout(() => finish(reject, new Error("LeetCode took too long to load")), timeoutMs);
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
  const created = await chrome.tabs.create({ url: `${LEETCODE_ORIGIN}/problemset/`, active: false });
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
    const [injection] = await chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", func, args });
    const result = injection?.result;
    if (result?.error === "NOT_SIGNED_IN") await set({ [KEYS.lcSignedIn]: false });
    else if (result?.ok) await set({ [KEYS.lcSignedIn]: true });
    return result;
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
// In-page functions (serialized into leetcode.com; must be self-contained)
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
  const gql = async (query, variables) =>
    (await fetch("/graphql/", { method: "POST", credentials: "include", headers, body: JSON.stringify({ query, variables }) })).json();

  try {
    const status = await gql("query{userStatus{isSignedIn username}}", {});
    if (!status?.data?.userStatus?.isSignedIn) return { error: "NOT_SIGNED_IN" };

    const q = await gql(
      "query q($s:String!){question(titleSlug:$s){questionId questionFrontendId title difficulty}}",
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
        body: JSON.stringify({ lang, question_id: question.questionId, typed_code: code }),
      });
      if (submitRes.status !== 429) break;
      await sleep(2500 * (attempt + 1));
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
      const res = await fetch(`/submissions/detail/${submissionId}/check/`, { credentials: "include", headers });
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
  const headers = { "content-type": "application/json", "x-csrftoken": csrf, "x-dsa-tracker": "1" };
  const gql = async (query, variables) => {
    const res = await fetch("/graphql/", { method: "POST", credentials: "include", headers, body: JSON.stringify({ query, variables }) });
    if (!res.ok) return { errors: [{ message: `HTTP ${res.status}` }] };
    return res.json();
  };

  try {
    const status = await gql("query{userStatus{isSignedIn username}}", {});
    const user = status?.data?.userStatus;
    if (!user?.isSignedIn || !user.username) return { error: "NOT_SIGNED_IN" };
    const username = user.username;

    // LeetCode has shipped two problem-list schemas; try both.
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
      solved.push(...list.data.filter((q) => !q.status || String(q.status).toLowerCase() === "ac"));
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

    const recent = await gql(
      `query q($u:String!,$l:Int!){ recentAcSubmissionList(username:$u,limit:$l){ id title titleSlug timestamp lang } }`,
      { u: username, l: 50 },
    );
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
// Tracker API sync (strict contract) + offline queue
// ---------------------------------------------------------------------------

const ERROR_MESSAGES = {
  NOT_SIGNED_IN: "You're not signed in to LeetCode in this browser. Sign in at leetcode.com and retry.",
  PROBLEM_NOT_FOUND: "LeetCode doesn't recognise this problem slug.",
  RATE_LIMITED: "LeetCode is rate-limiting submissions. Wait ~10 seconds and retry.",
  NO_SUBMISSION_ID: "LeetCode accepted the request but returned no submission id.",
};
const humanError = (code) =>
  ERROR_MESSAGES[code] ||
  (code?.startsWith("SUBMIT_HTTP_") ? `LeetCode rejected the submission (${code.slice(12)}).` : code);

/** "52 ms" -> 52, "18.4 MB" -> 18841 (KB). Undefined when unparseable. */
const parseRuntimeMs = (v) => {
  const m = String(v ?? "").match(/([\d.]+)\s*(ms|s)?/i);
  if (!m) return undefined;
  const n = Number(m[1]) * (m[2]?.toLowerCase() === "s" ? 1000 : 1);
  return Number.isFinite(n) ? Math.round(n) : undefined;
};
const parseMemoryKb = (v) => {
  const m = String(v ?? "").match(/([\d.]+)\s*(kb|mb|gb)?/i);
  if (!m) return undefined;
  const unit = (m[2] || "mb").toLowerCase();
  const n = Number(m[1]) * (unit === "gb" ? 1024 * 1024 : unit === "mb" ? 1024 : 1);
  return Number.isFinite(n) ? Math.round(n) : undefined;
};
const clampPct = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.min(100, Math.max(0, v)) : undefined);

/** Builds the strict ExtensionSyncRequest (see backend/contracts). */
const toContractPayload = (r) => {
  const difficulty = String(r.difficulty || "").toUpperCase();
  const payload = {
    submissionId: String(r.submissionId),
    slug: String(r.slug).toLowerCase(),
    verdict: "ACCEPTED",
    submittedAt: new Date((Number(r.timestamp) || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    runtimeMs: parseRuntimeMs(r.runtime),
    memoryKb: parseMemoryKb(r.memory),
    title: typeof r.title === "string" ? r.title.slice(0, 200) : undefined,
    difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : undefined,
    lang: typeof r.lang === "string" ? r.lang.slice(0, 30) : undefined,
    code: typeof r.code === "string" && r.code.trim() ? r.code.slice(0, 100000) : undefined,
    runtimePercentile: clampPct(r.runtimePercentile),
    memoryPercentile: clampPct(r.memoryPercentile),
  };
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
  return payload;
};

const postToTracker = async (report) => {
  const pairing = await get(KEYS.pairing);
  if (!isDeviceToken(pairing?.token)) {
    const err = new Error("Not paired. Open DSA Tracker while signed in, or paste a pairing token in the popup.");
    err.unpaired = true;
    throw err;
  }
  const bases = pairing.apiBase ? [pairing.apiBase] : DEFAULT_API_BASES;
  const body = JSON.stringify(toContractPayload(report));
  let lastError = null;

  for (const base of bases) {
    let res;
    try {
      res = await fetch(`${base}/extension/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${pairing.token}` },
        body,
      });
    } catch (networkError) {
      lastError = networkError;
      continue;
    }
    if (res.status === 401) {
      await set({
        [KEYS.pairing]: null,
        [KEYS.status]: "re_pair_needed",
        [KEYS.lastError]: "Pairing token was revoked or expired. Open DSA Tracker to re-pair.",
      });
      const err = new Error("Pairing token rejected — re-pair needed");
      err.unpaired = true;
      throw err;
    }
    if (res.status === 404) {
      const err = new Error("This problem isn't in your tracker yet");
      err.malformed = true;
      throw err;
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`Tracker sync failed (${res.status}) ${text.slice(0, 160)}`);
      err.malformed = res.status === 400;
      throw err;
    }
    const json = await res.json().catch(() => ({}));
    await set({
      [KEYS.status]: "paired",
      [KEYS.lastError]: "",
      [KEYS.lastSync]: { at: Date.now(), slug: report.slug, title: report.title || report.slug },
    });
    return json;
  }
  throw lastError || new Error("Tracker unreachable");
};

const enqueue = async (report) => {
  const queue = (await get(KEYS.queue)) || [];
  const next = queue.filter((i) => i.submissionId !== report.submissionId);
  next.push({ ...report, queuedAt: Date.now() });
  await set({ [KEYS.queue]: next.slice(-MAX_QUEUE) });
  chrome.alarms.create(RETRY_ALARM, { periodInMinutes: 2 });
};

const flushQueue = async () => {
  const queue = (await get(KEYS.queue)) || [];
  if (!queue.length) {
    chrome.alarms.clear(RETRY_ALARM);
    return { flushed: 0, remaining: 0 };
  }
  const remaining = [];
  let flushed = 0;
  for (const item of queue) {
    try {
      await postToTracker(item);
      flushed += 1;
    } catch (err) {
      const stale = Date.now() - (item.queuedAt || 0) > 7 * 86400000;
      if (!stale && !err.malformed) remaining.push(item);
    }
  }
  await set({ [KEYS.queue]: remaining });
  if (!remaining.length) chrome.alarms.clear(RETRY_ALARM);
  return { flushed, remaining: remaining.length };
};

chrome.alarms.onAlarm.addListener((a) => a.name === RETRY_ALARM && flushQueue());
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
const fromLeetCode = (sender) => /^https:\/\/([a-z0-9-]+\.)?leetcode\.com$/.test(senderOrigin(sender));
const fromPopup = (sender) => !sender?.tab && sender?.id === chrome.runtime.id;

const status = async () => {
  const [pairing, st, lastError, queue, lastSync, lcSignedIn] = await Promise.all([
    get(KEYS.pairing),
    get(KEYS.status),
    get(KEYS.lastError),
    get(KEYS.queue),
    get(KEYS.lastSync),
    get(KEYS.lcSignedIn),
  ]);
  const paired = isDeviceToken(pairing?.token);
  return {
    installed: true,
    version: VERSION,
    paired,
    status: paired ? "paired" : st || "not_paired",
    pairedVia: paired ? pairing.source : null,
    // Unknown until we've seen a LeetCode page or call; assume yes so the
    // first action can tell the user precisely if they're signed out.
    leetcodeSignedIn: lcSignedIn !== false,
    pendingSyncs: (queue || []).length,
    lastSync: lastSync || null,
    lastSyncAt: lastSync ? new Date(lastSync.at).toISOString() : null,
    lastError: lastError || "",
  };
};

const handlers = {
  PING: status,
  GET_PAIRING_STATUS: status,

  /** Web app hands over a freshly minted device token. */
  async PAIR(payload, sender) {
    const origin = senderOrigin(sender);
    if (!isAllowedAppOrigin(origin)) throw new Error("Pairing is only allowed from DSA Tracker pages");
    if (!isDeviceToken(payload.token)) throw new Error("Invalid pairing token");
    await set({
      [KEYS.pairing]: { token: payload.token, apiBase: `${origin}/api`, pairedAt: Date.now(), source: "app" },
      [KEYS.status]: "paired",
      [KEYS.lastError]: "",
    });
    flushQueue();
    return { paired: true };
  },

  /** Manual fallback: token pasted into the popup. */
  async SET_PAIRING_TOKEN(payload, sender, request) {
    if (!fromPopup(sender)) throw new Error("Only the extension popup can set a token");
    const token = String(request.token ?? payload.token ?? "").trim();
    if (!isDeviceToken(token)) throw new Error("Invalid token format. Pairing tokens begin with 'dsat_'.");
    await set({
      [KEYS.pairing]: { token, pairedAt: Date.now(), source: "popup" },
      [KEYS.status]: "paired",
      [KEYS.lastError]: "",
    });
    flushQueue();
    return { paired: true };
  },

  async UNPAIR(_payload, sender) {
    if (!fromPopup(sender)) throw new Error("Only the extension popup can unpair");
    await set({ [KEYS.pairing]: null, [KEYS.status]: "not_paired", [KEYS.lastError]: "" });
    return { paired: false };
  },

  async LC_SIGNED_IN(payload, sender) {
    if (!fromLeetCode(sender)) throw new Error("Not from LeetCode");
    await set({ [KEYS.lcSignedIn]: Boolean(payload.signedIn) });
    return { ok: true };
  },

  async SUBMIT_TO_LEETCODE(payload) {
    const slug = String(payload.problemSlug || "").trim().toLowerCase();
    if (!/^[a-z0-9-]{1,120}$/.test(slug)) throw new Error("Invalid problem slug");
    const code = String(payload.code || "");
    if (!code.trim()) throw new Error("Code is empty");
    const lang = String(payload.language || "cpp");
    const timeoutMs = Math.min(Math.max(Number(payload.timeoutMs) || 45000, 10000), 120000);

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
        timestamp: Math.floor(Number(r.finishedAt) / 1000),
        title: out.question.title,
        difficulty: out.question.difficulty,
      };
      postToTracker(report).catch((err) => !err.malformed && enqueue(report));
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
    const maxPages = Math.min(Math.max(Number(payload.maxPages) || 40, 1), 60);
    const out = await runInLeetCode(lcSnapshotInPage, [maxPages]);
    if (!out) throw new Error("No response from the LeetCode tab");
    if (out.error) throw new Error(humanError(out.error));
    return out;
  },

  async REPORT_ACCEPTED(payload, sender) {
    if (!fromLeetCode(sender)) throw new Error("REPORT_ACCEPTED is only accepted from leetcode.com");
    const slug = String(payload.slug || "").toLowerCase();
    if (!/^[a-z0-9-]{1,120}$/.test(slug) || !payload.submissionId) throw new Error("Invalid report");
    const report = { ...payload, slug };
    try {
      await postToTracker(report);
      flashBadge("✓", "#10b981");
      return { synced: true };
    } catch (err) {
      if (err.malformed) throw err;
      await enqueue(report);
      flashBadge("…", "#f59e0b");
      const queued = new Error(
        err.unpaired ? "Accepted! Open DSA Tracker to pair and finish syncing." : "Tracker unreachable — queued for retry",
      );
      queued.payload = { queued: true };
      throw queued;
    }
  },

  FLUSH_QUEUE: flushQueue,
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handler = handlers[request?.type];
  if (!handler) {
    sendResponse({ ok: false, error: "Unsupported request type" });
    return false;
  }
  Promise.resolve(handler(request.payload || {}, sender, request))
    .then((payload) => sendResponse({ ok: true, payload }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || "Extension error", payload: error?.payload }));
  return true;
});
