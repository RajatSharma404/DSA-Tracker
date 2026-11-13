/*
 * DSA Pro Live Sync — LeetCode network hook (runs in the page's MAIN world).
 *
 * Instead of scraping the DOM for the word "Accepted" (which also appears in
 * the problem's stats panel and caused false syncs), this observes LeetCode's
 * own API traffic:
 *   POST /problems/<slug>/submit/            -> captures typed_code + lang
 *   GET  /submissions/detail/<id>/check/     -> final verdict (state=SUCCESS)
 * When a real submission is judged "Accepted" it posts a message to the
 * isolated content script, which forwards it to the background worker.
 *
 * Requests the extension itself makes (header x-dsa-tracker) are ignored, the
 * background worker reports those directly.
 */
(() => {
  if (window.__dsaTrackerHookInstalled) return;
  window.__dsaTrackerHookInstalled = true;

  const HOOK_SOURCE = "DSA_TRACKER_LC_HOOK";
  const SUBMIT_RE = /\/problems\/([a-z0-9-]+)\/submit\/?$/i;
  const CHECK_RE = /\/submissions\/detail\/(\d+)\/check\/?$/i;

  /** submissionId -> { slug, lang, code, startedAt } */
  const pending = new Map();
  const reported = new Set();

  const pathOf = (url) => {
    try {
      return new URL(String(url), window.location.origin).pathname;
    } catch {
      return "";
    }
  };

  const isExtensionRequest = (headers) => {
    if (!headers) return false;
    try {
      if (headers instanceof Headers) return headers.has("x-dsa-tracker");
      if (Array.isArray(headers))
        return headers.some(([k]) => String(k).toLowerCase() === "x-dsa-tracker");
      return Object.keys(headers).some((k) => k.toLowerCase() === "x-dsa-tracker");
    } catch {
      return false;
    }
  };

  const parseJson = (body) => {
    if (typeof body !== "string") return null;
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  };

  const csrfToken = () =>
    (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || "";

  const fetchQuestionMeta = async (slug) => {
    try {
      const res = await nativeFetch("/graphql/", {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
          "x-csrftoken": csrfToken(),
          "x-dsa-tracker": "1",
        },
        body: JSON.stringify({
          query:
            "query q($s:String!){question(titleSlug:$s){questionFrontendId title difficulty topicTags{name slug}}}",
          variables: { s: slug },
        }),
      });
      const json = await res.json();
      return json?.data?.question || null;
    } catch {
      return null;
    }
  };

  const onSubmitResponse = (slug, requestBody, responseJson) => {
    const id = responseJson?.submission_id;
    if (!id) return;
    const body = parseJson(requestBody) || {};
    pending.set(String(id), {
      slug,
      lang: String(body.lang || ""),
      code: typeof body.typed_code === "string" ? body.typed_code : "",
      startedAt: Date.now(),
    });
  };

  const onCheckResponse = async (submissionId, json) => {
    if (!json || json.state !== "SUCCESS") return;
    const meta = pending.get(submissionId);
    if (!meta || reported.has(submissionId)) return;
    pending.delete(submissionId);
    reported.add(submissionId);

    const accepted = json.status_msg === "Accepted" || json.status_code === 10;
    if (!accepted) {
      window.postMessage(
        {
          source: HOOK_SOURCE,
          type: "VERDICT",
          data: { slug: meta.slug, verdict: json.status_msg || "Unknown", accepted: false },
        },
        window.location.origin,
      );
      return;
    }

    const question = await fetchQuestionMeta(meta.slug);
    window.postMessage(
      {
        source: HOOK_SOURCE,
        type: "ACCEPTED",
        data: {
          slug: meta.slug,
          submissionId,
          lang: json.lang || meta.lang,
          code: meta.code,
          runtime: json.status_runtime || null,
          memory: json.status_memory || null,
          runtimePercentile:
            typeof json.runtime_percentile === "number" ? json.runtime_percentile : null,
          memoryPercentile:
            typeof json.memory_percentile === "number" ? json.memory_percentile : null,
          totalTestcases: json.total_testcases ?? null,
          timestamp: Math.floor(Number(json.task_finish_time || Date.now()) / 1000) || null,
          title: question?.title || null,
          difficulty: question?.difficulty || null,
          frontendId: question?.questionFrontendId || null,
          tags: Array.isArray(question?.topicTags)
            ? question.topicTags.map((t) => t.slug).slice(0, 12)
            : [],
        },
      },
      window.location.origin,
    );
  };

  const observe = (url, requestBody, responseText) => {
    const path = pathOf(url);
    const submit = path.match(SUBMIT_RE);
    if (submit) {
      onSubmitResponse(submit[1].toLowerCase(), requestBody, parseJson(responseText));
      return;
    }
    const check = path.match(CHECK_RE);
    if (check) {
      onCheckResponse(check[1], parseJson(responseText));
    }
  };

  const isInteresting = (url) => {
    const path = pathOf(url);
    return SUBMIT_RE.test(path) || CHECK_RE.test(path);
  };

  // --- fetch ---
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function patchedFetch(input, init) {
    const response = await nativeFetch(input, init);
    try {
      const url = typeof input === "string" ? input : input?.url;
      const headers = init?.headers || (input instanceof Request ? input.headers : null);
      if (url && isInteresting(url) && !isExtensionRequest(headers)) {
        const requestBody = typeof init?.body === "string" ? init.body : null;
        response
          .clone()
          .text()
          .then((text) => observe(url, requestBody, text))
          .catch(() => {});
      }
    } catch {
      // never break the page
    }
    return response;
  };

  // --- XMLHttpRequest ---
  const NativeXHR = window.XMLHttpRequest;
  const nativeOpen = NativeXHR.prototype.open;
  const nativeSend = NativeXHR.prototype.send;
  const nativeSetHeader = NativeXHR.prototype.setRequestHeader;

  NativeXHR.prototype.open = function open(method, url, ...rest) {
    this.__dsaUrl = url;
    this.__dsaSkip = false;
    return nativeOpen.call(this, method, url, ...rest);
  };
  NativeXHR.prototype.setRequestHeader = function setRequestHeader(name, value) {
    if (String(name).toLowerCase() === "x-dsa-tracker") this.__dsaSkip = true;
    return nativeSetHeader.call(this, name, value);
  };
  NativeXHR.prototype.send = function send(body) {
    try {
      if (this.__dsaUrl && isInteresting(this.__dsaUrl) && !this.__dsaSkip) {
        const requestBody = typeof body === "string" ? body : null;
        this.addEventListener("load", () => {
          try {
            const text =
              this.responseType === "" || this.responseType === "text"
                ? this.responseText
                : JSON.stringify(this.response);
            observe(this.__dsaUrl, requestBody, text);
          } catch {
            // ignore
          }
        });
      }
    } catch {
      // ignore
    }
    return nativeSend.call(this, body);
  };
})();
