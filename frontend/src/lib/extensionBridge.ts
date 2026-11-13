"use client";

/**
 * Bridge between the web app and the DSA Pro Live Sync extension.
 * The extension's isolated content script listens for REQUEST_DOM_EVENT and
 * replies with RESPONSE_DOM_EVENT carrying the same requestId.
 */

export type ExtensionHealthState = "NOT_INSTALLED" | "INSTALLED_NOT_READY" | "READY";

export interface ExtensionStatus {
  state: ExtensionHealthState;
  signedIn: boolean;
  paired: boolean;
  version: string | null;
  pendingSyncs: number;
  lastSync: { at: number; slug: string; title: string } | null;
  /** v1 extensions cannot fetch snapshots or pair */
  outdated: boolean;
}

export interface LeetCodeSubmitResult {
  verdict: string;
  accepted: boolean;
  timedOut: boolean;
  submissionId?: string;
  runtime?: string | null;
  memory?: string | null;
  runtimePercentile?: number | null;
  memoryPercentile?: number | null;
  totalCorrect?: number | null;
  totalTestcases?: number | null;
  details?: string;
}

export interface LeetCodeSnapshot {
  ok: true;
  username: string;
  source: string;
  solved: Array<{ title: string; titleSlug: string; difficulty: string; frontendId: string | null }>;
  recent: Array<{ title: string; titleSlug: string; timestamp: number; lang: string | null }>;
  stats: {
    ranking: number | null;
    avatar: string | null;
    acByDifficulty: Array<{ difficulty: string; count: number }>;
    streak: number | null;
    totalActiveDays: number | null;
    contest: {
      rating: number;
      attendedContestsCount: number;
      globalRanking: number;
      topPercentage: number;
    } | null;
  };
  /** unix-seconds (as string) -> submission count */
  calendar: Record<string, number>;
}

type ExtensionEnvelope = {
  source: "DSA_TRACKER_EXTENSION";
  requestId: string;
  ok: boolean;
  payload?: unknown;
  error?: string;
};

const REQUEST_EVENT = "DSA_TRACKER_EXTENSION_REQUEST";
const REQUEST_DOM_EVENT = "DSA_TRACKER_EXTENSION_REQUEST_DOM";
const RESPONSE_DOM_EVENT = "DSA_TRACKER_EXTENSION_RESPONSE_DOM";
const SNAPSHOT_CACHE_KEY = "dsa_lc_snapshot_v1";

const randomId = () => `dsa_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/** True when the v2 content script has stamped the document. */
export const extensionVersionFromDom = (): string | null =>
  typeof document === "undefined"
    ? null
    : document.documentElement.getAttribute("data-dsa-extension");

const sendOnce = <T>(action: string, payload: Record<string, unknown>, timeoutMs: number) =>
  new Promise<T>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Browser only"));
      return;
    }
    const requestId = randomId();
    const cleanup = () => {
      window.clearTimeout(timer);
      document.removeEventListener(RESPONSE_DOM_EVENT, onResponse as EventListener);
    };
    const onResponse = (event: CustomEvent<ExtensionEnvelope>) => {
      const data = event.detail;
      if (!data || data.source !== "DSA_TRACKER_EXTENSION" || data.requestId !== requestId) return;
      cleanup();
      if (data.ok) resolve(data.payload as T);
      else reject(new Error(data.error || "Extension request failed"));
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Extension request timed out"));
    }, timeoutMs);

    document.addEventListener(RESPONSE_DOM_EVENT, onResponse as EventListener);
    document.dispatchEvent(
      new CustomEvent(REQUEST_DOM_EVENT, {
        detail: { source: "DSA_TRACKER_APP", type: REQUEST_EVENT, requestId, action, payload },
      }),
    );
  });

const sendExtensionRequest = async <T>(
  action: string,
  payload: Record<string, unknown> = {},
  timeoutMs = 2000,
  retries = 0,
): Promise<T> => {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await sendOnce<T>(action, payload, timeoutMs);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Only timeouts are worth retrying; a real error answer won't change.
      if (!/timed out/i.test(lastError.message)) break;
      if (i < retries) await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw lastError ?? new Error("Extension request failed");
};

const NOT_INSTALLED: ExtensionStatus = {
  state: "NOT_INSTALLED",
  signedIn: false,
  paired: false,
  version: null,
  pendingSyncs: 0,
  lastSync: null,
  outdated: false,
};

export const getExtensionStatus = async (): Promise<ExtensionStatus> => {
  try {
    const s = await sendExtensionRequest<{
      installed: boolean;
      leetcodeSignedIn: boolean;
      version?: string;
      paired?: boolean;
      pendingSyncs?: number;
      lastSync?: ExtensionStatus["lastSync"];
    }>("PING", {}, 1500, 1);
    if (!s?.installed) return NOT_INSTALLED;
    const version = s.version ?? null;
    return {
      state: s.leetcodeSignedIn ? "READY" : "INSTALLED_NOT_READY",
      signedIn: Boolean(s.leetcodeSignedIn),
      paired: Boolean(s.paired),
      version,
      pendingSyncs: s.pendingSyncs ?? 0,
      lastSync: s.lastSync ?? null,
      outdated: !version || Number(version.split(".")[0]) < 2,
    };
  } catch {
    return NOT_INSTALLED;
  }
};

/** Back-compat wrapper used by older call sites. */
export const getExtensionHealth = async () => {
  const s = await getExtensionStatus();
  return { state: s.state, signedIn: s.signedIn };
};

/**
 * Hand the extension the current access token so syncs that start on
 * leetcode.com reach this account. Safe to call repeatedly.
 */
export const pairExtension = async (token: string) => {
  if (!token) return false;
  try {
    await sendExtensionRequest("PAIR", { token }, 2000);
    return true;
  } catch {
    return false;
  }
};

export const submitViaExtension = (args: {
  problemSlug: string;
  code: string;
  language: string;
  timeoutMs: number;
}) =>
  // Opening a LeetCode tab + judging can take a while; give generous headroom.
  sendExtensionRequest<LeetCodeSubmitResult>("SUBMIT_TO_LEETCODE", args, args.timeoutMs + 30_000);

export const fetchLeetCodeSnapshot = async (): Promise<LeetCodeSnapshot> => {
  const snapshot = await sendExtensionRequest<LeetCodeSnapshot>(
    "FETCH_LEETCODE_SNAPSHOT",
    { maxPages: 40 },
    90_000,
  );
  try {
    localStorage.setItem(
      SNAPSHOT_CACHE_KEY,
      JSON.stringify({ at: Date.now(), stats: snapshot.stats, calendar: snapshot.calendar, username: snapshot.username }),
    );
  } catch {
    // storage is optional
  }
  return snapshot;
};

export const readCachedSnapshot = (): {
  at: number;
  username: string;
  stats: LeetCodeSnapshot["stats"];
  calendar: LeetCodeSnapshot["calendar"];
} | null => {
  try {
    const raw = localStorage.getItem(SNAPSHOT_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
