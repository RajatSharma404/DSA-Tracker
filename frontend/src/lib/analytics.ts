export type AnalyticsEventName =
  | "dashboard_viewed"
  | "dashboard_primary_cta_clicked"
  | "today_plan_item_opened"
  | "review_queue_viewed"
  | "review_quality_selected"
  | "review_completed"
  | "problem_focus_mode_enabled"
  | "problem_submitted"
  | "analytics_viewed"
  | "analytics_time_range_changed";

type TrackedEvent = {
  event: AnalyticsEventName;
  payload: Record<string, unknown>;
  timestamp: number;
  path: string;
};

const EVENT_LOG_KEY = "dsa:event-log";

export function trackEvent(
  event: AnalyticsEventName,
  payload: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  try {
    const detail = {
      event,
      payload,
      timestamp: Date.now(),
      path: window.location.pathname,
    };

    window.dispatchEvent(new CustomEvent("dsa:analytics", { detail }));

    // Keep a light local trail for before/after KPI snapshots.
    const events = getEventLog();
    events.push(detail);
    if (events.length > 300) {
      events.splice(0, events.length - 300);
    }
    window.localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(events));

    if (process.env.NODE_ENV !== "production") {
      console.info("[analytics]", event, payload);
    }
  } catch (error) {
    console.warn("Analytics event failed", error);
  }
}

export function getEventLog(): TrackedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EVENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrackedEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearEventLog() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(EVENT_LOG_KEY);
}

export function getKpiSnapshot(days = 7) {
  const events = getEventLog();
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = events.filter((entry) => entry.timestamp >= since);

  const count = (name: AnalyticsEventName) =>
    filtered.filter((entry) => entry.event === name).length;

  const reviewSelections = count("review_quality_selected");
  const reviewCompleted = count("review_completed");
  const dashboardViews = count("dashboard_viewed");
  const dashboardPrimaryCta = count("dashboard_primary_cta_clicked");

  const reviewCompletionRate =
    reviewSelections > 0
      ? Math.round((reviewCompleted / reviewSelections) * 100)
      : 0;
  const dashboardActionRate =
    dashboardViews > 0
      ? Math.round((dashboardPrimaryCta / dashboardViews) * 100)
      : 0;

  return {
    windowDays: days,
    totalEvents: filtered.length,
    dashboardViews,
    dashboardPrimaryCta,
    dashboardActionRate,
    reviewQueueViews: count("review_queue_viewed"),
    reviewSelections,
    reviewCompleted,
    reviewCompletionRate,
    focusModeEnabled: count("problem_focus_mode_enabled"),
    problemSubmissions: count("problem_submitted"),
    analyticsViews: count("analytics_viewed"),
  };
}
