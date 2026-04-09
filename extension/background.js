const DEFAULT_API_BASES = ["http://localhost:3001"];
const isAllowedApiBase = (urlString) => {
  try {
    const url = new URL(urlString);
    const localHosts = new Set(["localhost", "127.0.0.1"]);
    if (localHosts.has(url.hostname)) {
      return url.protocol === "http:" || url.protocol === "https:";
    }
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

const getCandidateApiBases = async () => {
  try {
    const stored = await chrome.storage.sync.get([
      "dsaApiBaseUrl",
      "dsaApiBaseUrls",
    ]);
    const single =
      typeof stored.dsaApiBaseUrl === "string" ? [stored.dsaApiBaseUrl] : [];
    const multiple = Array.isArray(stored.dsaApiBaseUrls)
      ? stored.dsaApiBaseUrls
      : [];

    return [...new Set([...single, ...multiple, ...DEFAULT_API_BASES])]
      .map((url) => String(url).trim().replace(/\/$/, ""))
      .filter((url) => Boolean(url) && isAllowedApiBase(url));
  } catch {
    return DEFAULT_API_BASES;
  }
};

const trySyncToApi = async (baseUrl, problemSlug, leetcodeSession) => {
  const response = await fetch(`${baseUrl}/api/extension/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      problemSlug,
      leetcodeSession,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sync failed (${response.status}): ${body}`);
  }

  return response.json();
};

const getLeetCodeSessionCookie = () =>
  new Promise((resolve) => {
    chrome.cookies.get(
      { url: "https://leetcode.com", name: "LEETCODE_SESSION" },
      (cookie) => resolve(cookie?.value || ""),
    );
  });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isMissingTabError = (error) =>
  /No tab with id|Cannot access contents of the page/i.test(
    String(error?.message || ""),
  );

const withScript = async (tabId, func, args = [], world = "ISOLATED") => {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId },
      func,
      args,
      world,
    });
    return result?.[0]?.result;
  } catch (error) {
    if (isMissingTabError(error)) {
      throw new Error(
        "LeetCode tab was closed before submission finished. Please retry.",
      );
    }
    throw error;
  }
};

const waitForTabLoad = async (tabId, timeoutMs = 10000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    let tab;
    try {
      tab = await chrome.tabs.get(tabId);
    } catch (error) {
      if (isMissingTabError(error)) {
        throw new Error(
          "LeetCode tab was closed before submission finished. Please retry.",
        );
      }
      throw error;
    }
    if (tab.status === "complete") return true;
    await delay(250);
  }
  return false;
};

const waitForEditorReady = async (tabId, timeoutMs = 20000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ready = await withScript(
      tabId,
      () => {
        const hasMonaco = Boolean(window.monaco?.editor?.getModels?.()?.length);
        const hasTextarea = Boolean(document.querySelector("textarea"));
        return hasMonaco || hasTextarea;
      },
      [],
      "MAIN",
    );

    if (ready) return true;
    await delay(300);
  }
  return false;
};

const normalizeForCompare = (value) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .trimEnd();

const setLanguageOnLeetCode = async (tabId, language) => {
  return withScript(
    tabId,
    (lang) => {
      const normalizeLang = (value) => {
        const map = {
          cpp: "C++",
          c: "C",
          java: "Java",
          python3: "Python3",
        };
        return map[value] || "C++";
      };

      const target = normalizeLang(lang);
      const langButton =
        document.querySelector('[data-e2e-locator="lang-select-btn"]') ||
        document.querySelector('[class*="lang-select"] button');

      if (!langButton) return false;
      langButton.click();

      const options = Array.from(document.querySelectorAll("div,button,li"));
      const match = options.find((el) => {
        const text = (el.textContent || "").trim().toLowerCase();
        return (
          text === target.toLowerCase() || text.includes(target.toLowerCase())
        );
      });

      if (!match) return false;
      match.click();
      return true;
    },
    [language],
    "MAIN",
  );
};

const writeCodeToLeetCodeEditor = async (tabId, code) => {
  return withScript(
    tabId,
    (submissionCode) => {
      const pickBestEditor = (editorApi) => {
        const editors = editorApi.getEditors?.() || [];
        if (!editors.length) return null;

        const activeEl = document.activeElement;

        const focused = editors.find((editor) => {
          const node = editor.getDomNode?.();
          if (!node) return false;
          if (node.classList.contains("focused")) return true;
          return Boolean(activeEl && node.contains(activeEl));
        });
        if (focused) return focused;

        const visible = editors.find((editor) => {
          const node = editor.getDomNode?.();
          return Boolean(node && node.offsetParent !== null);
        });
        if (visible) return visible;

        return editors[0];
      };

      const writeWithMonaco = () => {
        const monaco = window.monaco;
        const editorApi = monaco?.editor;
        if (!editorApi) return { ok: false, source: "none" };

        const activeEditor = pickBestEditor(editorApi);

        if (activeEditor?.getModel?.()) {
          const model = activeEditor.getModel();
          activeEditor.focus?.();
          activeEditor.executeEdits?.("dsa-tracker-sync", [
            {
              range: model.getFullModelRange(),
              text: submissionCode,
              forceMoveMarkers: true,
            },
          ]);

          // Also update model directly to handle cases where executeEdits is ignored.
          model.pushEditOperations(
            [],
            [
              {
                range: model.getFullModelRange(),
                text: submissionCode,
              },
            ],
            () => null,
          );

          const value = model.getValue();
          if (value === submissionCode) {
            return {
              ok: true,
              source: "monaco-active",
              valueLength: value.length,
            };
          }
        }

        const models = editorApi.getModels?.() || [];
        for (const model of models) {
          model.pushEditOperations(
            [],
            [
              {
                range: model.getFullModelRange(),
                text: submissionCode,
              },
            ],
            () => null,
          );
        }

        const readBack = models[0]?.getValue?.() || "";
        return {
          ok: readBack === submissionCode,
          source: "monaco-models",
          valueLength: readBack.length,
        };
      };

      const writeTextarea = () => {
        const textarea = document.querySelector("textarea");
        if (!textarea) return { ok: false, source: "none" };
        textarea.focus();
        textarea.value = submissionCode;
        textarea.dispatchEvent(new InputEvent("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        return {
          ok: textarea.value === submissionCode,
          source: "textarea",
          valueLength: textarea.value.length,
        };
      };

      const monacoResult = writeWithMonaco();
      if (monacoResult.ok) return monacoResult;
      return writeTextarea();
    },
    [code],
    "MAIN",
  );
};

const readCurrentLeetCodeEditorCode = async (tabId) => {
  return withScript(
    tabId,
    () => {
      const monaco = window.monaco;
      const editorApi = monaco?.editor;

      if (editorApi) {
        const editors = editorApi.getEditors?.() || [];
        const activeEl = document.activeElement;

        const focused = editors.find((editor) => {
          const node = editor.getDomNode?.();
          if (!node) return false;
          if (node.classList.contains("focused")) return true;
          return Boolean(activeEl && node.contains(activeEl));
        });

        if (focused && focused.getModel?.()) {
          return {
            source: "monaco-focused",
            code: focused.getModel().getValue() || "",
          };
        }

        for (const editor of editors) {
          const node = editor.getDomNode?.();
          if (node && node.offsetParent !== null && editor.getModel?.()) {
            return {
              source: "monaco-active",
              code: editor.getModel().getValue() || "",
            };
          }
        }

        const models = editorApi.getModels?.() || [];
        if (models.length > 0) {
          return {
            source: "monaco-model",
            code: models[0].getValue() || "",
          };
        }
      }

      const textarea = document.querySelector("textarea");
      if (textarea) {
        return { source: "textarea", code: textarea.value || "" };
      }

      return { source: "none", code: "" };
    },
    [],
    "MAIN",
  );
};

const clickSubmit = async (tabId) => {
  return withScript(tabId, () => {
    const selectors = [
      '[data-e2e-locator="console-submit-button"]',
      '[data-cy="submit-code-btn"]',
      'button[data-e2e-locator*="submit"]',
      'button[type="button"]',
    ];
    for (const sel of selectors) {
      const nodes = Array.from(document.querySelectorAll(sel));
      const btn = nodes.find((node) =>
        /submit/i.test((node.textContent || "").trim()),
      );
      if (btn && !btn.disabled) {
        btn.click();
        return true;
      }
    }
    return false;
  });
};

const readVerdict = async (tabId) => {
  return withScript(tabId, () => {
    const pendingWords = ["pending", "running", "judging"];
    const candidates = Array.from(
      document.querySelectorAll("div,span,p,strong"),
    ).map((el) => (el.textContent || "").trim());
    const joined = candidates.join(" ").toLowerCase();
    if (pendingWords.some((w) => joined.includes(w))) {
      return { pending: true };
    }
    const nonAccepted = [
      "wrong answer",
      "time limit exceeded",
      "runtime error",
      "memory limit exceeded",
      "compilation error",
      "output limit exceeded",
      "presentation error",
    ];
    if (joined.includes("accepted")) {
      return { pending: false, verdict: "Accepted", accepted: true };
    }
    const hit = nonAccepted.find((v) => joined.includes(v));
    if (hit) {
      return { pending: false, verdict: hit.toUpperCase(), accepted: false };
    }
    return { pending: true };
  });
};

const runLeetCodeSubmission = async ({
  problemSlug,
  code,
  language,
  timeoutMs,
}) => {
  const leetcodeSession = await getLeetCodeSessionCookie();
  if (!leetcodeSession) {
    throw new Error("Your LeetCode is not signed in");
  }

  let tabId = null;
  try {
    const createdTab = await chrome.tabs.create({
      url: `https://leetcode.com/problems/${problemSlug}/description/`,
      active: false,
    });
    tabId = createdTab.id;
    if (!tabId) throw new Error("Failed to open LeetCode tab");

    await waitForTabLoad(tabId, 15000);
    await delay(1400);

    const editorReady = await waitForEditorReady(tabId, 20000);
    if (!editorReady) {
      throw new Error("LeetCode editor did not load in time");
    }

    let codeSet = false;
    const languageSet = await setLanguageOnLeetCode(tabId, language);
    if (languageSet) {
      await delay(900);
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const writeResult = await writeCodeToLeetCodeEditor(tabId, code);
      await delay(650);

      const editorSnapshot = await readCurrentLeetCodeEditorCode(tabId);
      const normalizedCurrent = normalizeForCompare(editorSnapshot?.code || "");
      const normalizedExpected = normalizeForCompare(code || "");

      if (writeResult?.ok && normalizedCurrent === normalizedExpected) {
        codeSet = true;
        break;
      }

      await delay(400);
    }

    if (!codeSet) {
      throw new Error(
        "Unable to verify pasted code in LeetCode editor. Open LeetCode tab to inspect.",
      );
    }

    const clicked = await clickSubmit(tabId);
    if (!clicked) throw new Error("Unable to click submit on LeetCode");

    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await delay(1300);
      const result = await readVerdict(tabId);
      if (result && !result.pending) {
        if (!result.accepted) {
          await chrome.tabs.update(tabId, { active: true });
        } else {
          await chrome.tabs.remove(tabId).catch(() => {});
        }
        return {
          accepted: Boolean(result.accepted),
          verdict: result.verdict || "Unknown",
          timedOut: false,
        };
      }
    }

    await chrome.tabs.update(tabId, { active: true });
    return {
      accepted: false,
      verdict: "TIMEOUT",
      timedOut: true,
      details: "Timed out waiting for LeetCode verdict (45s).",
    };
  } catch (error) {
    if (tabId) {
      await chrome.tabs.update(tabId, { active: true }).catch(() => {});
    }
    throw error;
  }
};

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  (async () => {
    try {
      const requestType =
        request && typeof request.type === "string" ? request.type : "";

      if (!requestType) {
        sendResponse({ ok: false, error: "Malformed extension request" });
        return;
      }

      if (requestType === "PING") {
        const session = await getLeetCodeSessionCookie();
        sendResponse({
          ok: true,
          payload: { installed: true, leetcodeSignedIn: Boolean(session) },
        });
        return;
      }

      if (requestType === "SUBMIT_TO_LEETCODE") {
        try {
          const payload = request.payload || {};
          const result = await runLeetCodeSubmission({
            problemSlug: String(payload.problemSlug || "")
              .trim()
              .toLowerCase(),
            code: String(payload.code || ""),
            language: String(payload.language || "cpp"),
            timeoutMs: Number(payload.timeoutMs || 30000),
          });
          sendResponse({ ok: true, payload: result });
        } catch (error) {
          sendResponse({
            ok: false,
            error: error?.message || "LeetCode submission failed",
          });
        }
        return;
      }

      if (requestType === "SYNC_PROBLEM") {
        const cookie = await getLeetCodeSessionCookie();
        if (!cookie) {
          sendResponse({ ok: false, error: "No LeetCode session found" });
          return;
        }
        const candidates = await getCandidateApiBases();
        let lastError = null;
        for (const baseUrl of candidates) {
          try {
            await trySyncToApi(baseUrl, request.problemSlug, cookie);
            sendResponse({ ok: true, payload: { synced: true } });
            return;
          } catch (err) {
            lastError = err;
          }
        }
        sendResponse({
          ok: false,
          error: lastError?.message || "All sync attempts failed",
        });
        return;
      }

      sendResponse({ ok: false, error: "Unsupported request type" });
    } catch (error) {
      sendResponse({
        ok: false,
        error: error?.message || "Unexpected extension background error",
      });
    }
  })();

  return true;
});
