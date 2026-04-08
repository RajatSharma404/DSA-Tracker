"use client";

export type ExtensionHealthState =
  | "NOT_INSTALLED"
  | "INSTALLED_NOT_READY"
  | "READY";

type ExtensionEnvelope = {
  source: "DSA_TRACKER_EXTENSION";
  requestId: string;
  ok: boolean;
  payload?: any;
  error?: string;
};

const RESPONSE_EVENT = "DSA_TRACKER_EXTENSION_RESPONSE";
const REQUEST_EVENT = "DSA_TRACKER_EXTENSION_REQUEST";
const REQUEST_DOM_EVENT = "DSA_TRACKER_EXTENSION_REQUEST_DOM";
const RESPONSE_DOM_EVENT = "DSA_TRACKER_EXTENSION_RESPONSE_DOM";
const DEFAULT_TIMEOUT_MS = 1200;

const randomId = () =>
  `dsa_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const sendExtensionRequestOnce = async <TPayload = any>(
  action: string,
  payload: Record<string, unknown> = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<TPayload> => {
  if (typeof window === "undefined") {
    throw new Error("Browser only");
  }

  const requestId = randomId();

  const response = await new Promise<ExtensionEnvelope>((resolve, reject) => {
    const onDomMessage = (event: Event) => {
      const customEvent = event as CustomEvent<ExtensionEnvelope>;
      const data = customEvent.detail;
      if (
        !data ||
        data.source !== "DSA_TRACKER_EXTENSION" ||
        data.requestId !== requestId
      ) {
        return;
      }
      window.clearTimeout(timer);
      document.removeEventListener(
        RESPONSE_DOM_EVENT,
        onDomMessage as EventListener,
      );
      resolve(data);
    };

    const timer = window.setTimeout(() => {
      document.removeEventListener(
        RESPONSE_DOM_EVENT,
        onDomMessage as EventListener,
      );
      reject(new Error("Extension request timed out"));
    }, timeoutMs);

    document.addEventListener(
      RESPONSE_DOM_EVENT,
      onDomMessage as EventListener,
    );
    document.dispatchEvent(
      new CustomEvent(REQUEST_DOM_EVENT, {
        detail: {
          source: "DSA_TRACKER_APP",
          type: REQUEST_EVENT,
          requestId,
          action,
          payload,
        },
      }),
    );
  });

  if (!response.ok) {
    throw new Error(response.error || "Extension request failed");
  }
  return response.payload as TPayload;
};

const sendExtensionRequest = async <TPayload = any>(
  action: string,
  payload: Record<string, unknown> = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = 1,
): Promise<TPayload> => {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await sendExtensionRequestOnce<TPayload>(
        action,
        payload,
        timeoutMs,
      );
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }
  throw lastError || new Error("Extension request failed");
};

export const getExtensionHealth = async (): Promise<{
  state: ExtensionHealthState;
  signedIn: boolean;
}> => {
  try {
    const status = await sendExtensionRequest<{
      installed: boolean;
      leetcodeSignedIn: boolean;
    }>("PING", {}, 2000, 1);
    if (!status.installed) {
      return { state: "NOT_INSTALLED", signedIn: false };
    }
    if (!status.leetcodeSignedIn) {
      return { state: "INSTALLED_NOT_READY", signedIn: false };
    }
    return { state: "READY", signedIn: true };
  } catch {
    return { state: "NOT_INSTALLED", signedIn: false };
  }
};

export const submitViaExtension = async (args: {
  problemSlug: string;
  code: string;
  language: string;
  timeoutMs: number;
}) => {
  return sendExtensionRequest<{
    verdict: string;
    accepted: boolean;
    timedOut: boolean;
    details?: string;
  }>("SUBMIT_TO_LEETCODE", args, args.timeoutMs + 12000, 1);
};

export const EXTENSION_RESPONSE_EVENT = RESPONSE_EVENT;
